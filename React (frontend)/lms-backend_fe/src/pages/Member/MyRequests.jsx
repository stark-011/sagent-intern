import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import * as issueService from "../../api/issueService";
import * as stockService from "../../api/stockService";
import Loader from "../../components/Loader";
import { useAuth } from "../../context/AuthContext";
import {
  formatDateTime,
  getBookTitle,
  getEntityId,
  getIssueBookId,
  getIssueId,
  getIssueStatus,
  getIssueUserId,
  getUserId,
} from "../../utils/fieldUtils";

const statusClass = (status) => {
  const normalized = String(status).toLowerCase();
  if (normalized.includes("issued")) return "bg-brand-100 text-brand-800";
  if (normalized.includes("cancel")) return "bg-rose-100 text-rose-800";
  if (normalized.includes("return")) return "bg-emerald-100 text-emerald-800";
  return "bg-amber-100 text-amber-800";
};

const MyRequests = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [requestUpdating, setRequestUpdating] = useState(null);
  const [requests, setRequests] = useState([]);
  const [booksMap, setBooksMap] = useState(new Map());

  const userId = getUserId(user || {});

  const loadRequests = async () => {
    setLoading(true);
    try {
      const [issuesResponse, stockResponse] = await Promise.all([
        issueService.getAllIssues(),
        stockService.getAllStock(),
      ]);

      const allIssues = Array.isArray(issuesResponse) ? issuesResponse : [];
      const allStock = Array.isArray(stockResponse) ? stockResponse : [];

      const nextBooksMap = new Map(
        allStock.map((book) => [String(getEntityId(book)), getBookTitle(book)])
      );

      const filtered = allIssues.filter(
        (issue) => String(getIssueUserId(issue)) === String(userId)
      );
      const requestOnly = filtered.filter((issue) => {
        const status = getIssueStatus(issue).toLowerCase();
        return (
          status.includes("request") ||
          status.includes("pending") ||
          status.includes("cancel") ||
          status.includes("reject")
        );
      });

      setBooksMap(nextBooksMap);
      setRequests(requestOnly);
    } catch (error) {
      toast.error(error?.message || "Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const cancelRequest = async (issueId) => {
    setRequestUpdating(issueId);
    try {
      const updated = await issueService.patchIssue(issueId, {
        status: "Cancelled",
      });

      setRequests((prev) =>
        prev.map((request) => (getIssueId(request) === issueId ? updated : request))
      );
      toast.success("Request cancelled");
    } catch (error) {
      toast.error(error?.response?.data || error?.message || "Failed to cancel request");
    } finally {
      setRequestUpdating(null);
    }
  };

  if (loading) return <Loader text="Loading requests..." />;

  return (
    <section className="panel overflow-hidden">
      <h2 className="text-xl font-semibold text-slate-900">My Book Requests</h2>
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-brand-50 text-left text-slate-700">
            <tr>
              <th className="px-3 py-2">Issue ID</th>
              <th className="px-3 py-2">Book</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Created</th>
              <th className="px-3 py-2 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-5 text-center text-slate-500">
                  No requests found.
                </td>
              </tr>
            )}

            {requests.map((request) => {
              const id = getIssueId(request);
              const status = getIssueStatus(request);
              const lowerStatus = status.toLowerCase();
              const canCancel =
                lowerStatus.includes("request") || lowerStatus.includes("pending");
              const bookId = getIssueBookId(request);
              const title =
                booksMap.get(String(bookId)) || (bookId ? `Book #${bookId}` : "Unknown Book");

              return (
                <tr key={id || title} className="border-t">
                  <td className="px-3 py-2">{id || "-"}</td>
                  <td className="px-3 py-2 font-medium text-slate-900">{title}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(
                        status
                      )}`}
                    >
                      {status}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    {formatDateTime(request.createdAt || request.issueDate)}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {canCancel ? (
                      <button
                        type="button"
                        className="btn-danger"
                        onClick={() => cancelRequest(id)}
                        disabled={requestUpdating === id}
                      >
                        {requestUpdating === id ? "Cancelling..." : "Cancel Request"}
                      </button>
                    ) : (
                      <span className="text-xs text-slate-500">No action</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default MyRequests;
