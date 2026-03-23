import { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import * as issueService from "../../api/issueService";
import * as notifyService from "../../api/notifyService";
import * as stockService from "../../api/stockService";
import * as userService from "../../api/userService";
import Loader from "../../components/Loader";
import {
  formatDateTime,
  getBookTitle,
  getEntityId,
  getIssueBookId,
  getIssueId,
  getIssueStatus,
  getIssueUserId,
  getUserDisplayName,
} from "../../utils/fieldUtils";

const statusClass = (status) => {
  const normalized = String(status).toLowerCase();
  if (normalized.includes("issued")) return "bg-brand-100 text-brand-800";
  if (normalized.includes("return")) return "bg-emerald-100 text-emerald-800";
  if (normalized.includes("cancel")) return "bg-rose-100 text-rose-800";
  return "bg-amber-100 text-amber-800";
};

const ManageRequests = () => {
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [issues, setIssues] = useState([]);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [booksMap, setBooksMap] = useState(new Map());
  const [usersMap, setUsersMap] = useState(new Map());

  const loadRequests = async () => {
    setLoading(true);
    try {
      const [issueData, stockData, userData] = await Promise.all([
        issueService.getAllIssues(),
        stockService.getAllStock(),
        userService.getAllUsers(),
      ]);

      const allIssues = Array.isArray(issueData) ? issueData : [];
      const allStock = Array.isArray(stockData) ? stockData : [];
      const allUsers = Array.isArray(userData) ? userData : [];

      const nextBooksMap = new Map(
        allStock.map((book) => [String(getEntityId(book)), getBookTitle(book)])
      );
      const nextUsersMap = new Map(
        allUsers.map((member) => [String(getEntityId(member)), getUserDisplayName(member)])
      );

      setIssues(allIssues);
      setBooksMap(nextBooksMap);
      setUsersMap(nextUsersMap);
    } catch (error) {
      toast.error(error?.message || "Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const filteredIssues = useMemo(() => {
    if (statusFilter === "ALL") return issues;
    return issues.filter(
      (issue) => getIssueStatus(issue).toUpperCase() === statusFilter
    );
  }, [issues, statusFilter]);

  const sendNotification = async (issue, message) => {
    const userId = getIssueUserId(issue);
    if (!userId) return;
    try {
      await notifyService.sendNotification({
        userId,
        message,
      });
    } catch {
      // Notification failure does not block request status update.
    }
  };

  const updateStatus = async (issue, status) => {
    const issueId = getIssueId(issue);
    if (!issueId) {
      toast.error("Issue ID is missing");
      return;
    }
    setUpdatingId(issueId);
    try {
      const updated = await issueService.patchIssue(issueId, { status });
      setIssues((prev) =>
        prev.map((item) => (getIssueId(item) === issueId ? updated : item))
      );

      if (status === "Issued") {
        await sendNotification(issue, "Your book request has been approved and issued.");
      }
      if (status === "Returned") {
        await sendNotification(issue, "A borrowed book has been marked as returned.");
      }

      toast.success(`Request status updated to ${status}`);
    } catch (error) {
      toast.error(error?.response?.data || error?.message || "Status update failed");
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <Loader text="Loading requests..." />;

  return (
    <div className="space-y-6">
      <section className="panel">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h2 className="text-xl font-semibold text-slate-900">Manage Borrow Requests</h2>
          <select
            className="input md:w-56"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="Requested">Requested</option>
            <option value="Issued">Issued</option>
            <option value="Returned">Returned</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </section>

      <section className="panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-brand-50 text-left text-slate-700">
              <tr>
                <th className="px-3 py-2">Issue ID</th>
                <th className="px-3 py-2">Member</th>
                <th className="px-3 py-2">Book</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Created</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredIssues.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-5 text-center text-slate-500">
                    No requests found.
                  </td>
                </tr>
              )}

              {filteredIssues.map((issue) => {
                const issueId = getIssueId(issue);
                const status = getIssueStatus(issue);
                const lower = status.toLowerCase();
                const memberId = getIssueUserId(issue);
                const bookId = getIssueBookId(issue);
                const memberName = usersMap.get(String(memberId)) || `Member #${memberId || "-"}`;
                const bookTitle =
                  booksMap.get(String(bookId)) || (bookId ? `Book #${bookId}` : "Unknown Book");

                return (
                  <tr key={issueId || `${memberId}-${bookId}`} className="border-t">
                    <td className="px-3 py-2">{issueId || "-"}</td>
                    <td className="px-3 py-2 font-medium text-slate-900">{memberName}</td>
                    <td className="px-3 py-2">{bookTitle}</td>
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
                      {formatDateTime(issue.createdAt || issue.issueDate)}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <div className="flex flex-wrap justify-end gap-2">
                        {(lower.includes("request") || lower.includes("pending")) && (
                          <>
                            <button
                              type="button"
                              className="btn-primary"
                              onClick={() => updateStatus(issue, "Issued")}
                              disabled={updatingId === issueId}
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              className="btn-danger"
                              onClick={() => updateStatus(issue, "Cancelled")}
                              disabled={updatingId === issueId}
                            >
                              Reject
                            </button>
                          </>
                        )}

                        {lower.includes("issued") && (
                          <button
                            type="button"
                            className="btn-secondary"
                            onClick={() => updateStatus(issue, "Returned")}
                            disabled={updatingId === issueId}
                          >
                            Mark Returned
                          </button>
                        )}

                        {(lower.includes("return") || lower.includes("cancel")) && (
                          <span className="text-xs text-slate-500">No action</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default ManageRequests;
