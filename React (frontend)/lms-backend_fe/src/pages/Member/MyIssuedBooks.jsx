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
  getIssueDueDate,
  getIssueFine,
  getIssueId,
  getIssueReturnDate,
  getIssueStatus,
  getIssueUserId,
  getUserId,
} from "../../utils/fieldUtils";

const statusClass = (status) => {
  const normalized = String(status).toLowerCase();
  if (normalized.includes("issued")) return "bg-brand-100 text-brand-800";
  if (normalized.includes("return")) return "bg-emerald-100 text-emerald-800";
  return "bg-amber-100 text-amber-800";
};

const MyIssuedBooks = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [updatingIssueId, setUpdatingIssueId] = useState(null);
  const [issues, setIssues] = useState([]);
  const [bookTitles, setBookTitles] = useState(new Map());

  const userId = getUserId(user || {});

  const loadIssuedBooks = async () => {
    setLoading(true);
    try {
      const [issueResponse, stockResponse] = await Promise.all([
        issueService.getAllIssues(),
        stockService.getAllStock(),
      ]);

      const allIssues = Array.isArray(issueResponse) ? issueResponse : [];
      const allStock = Array.isArray(stockResponse) ? stockResponse : [];
      const map = new Map(
        allStock.map((book) => [String(getEntityId(book)), getBookTitle(book)])
      );

      const myIssues = allIssues.filter(
        (issue) => String(getIssueUserId(issue)) === String(userId)
      );
      const relevant = myIssues.filter((issue) => {
        const status = getIssueStatus(issue).toLowerCase();
        return status.includes("issued") || status.includes("return");
      });

      setIssues(relevant);
      setBookTitles(map);
    } catch (error) {
      toast.error(error?.message || "Failed to load issued books");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIssuedBooks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const returnBook = async (issueId) => {
    setUpdatingIssueId(issueId);
    try {
      const updated = await issueService.patchIssue(issueId, {
        status: "Returned",
      });

      setIssues((prev) =>
        prev.map((issue) => (getIssueId(issue) === issueId ? updated : issue))
      );

      const fine = getIssueFine(updated || {});
      if (fine > 0) {
        toast.success(`Book returned. Fine: ${fine}`);
      } else {
        toast.success("Book returned successfully");
      }
    } catch (error) {
      toast.error(error?.response?.data || error?.message || "Return failed");
    } finally {
      setUpdatingIssueId(null);
    }
  };

  if (loading) return <Loader text="Loading issued books..." />;

  return (
    <section className="panel overflow-hidden">
      <h2 className="text-xl font-semibold text-slate-900">My Issued Books</h2>
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-brand-50 text-left text-slate-700">
            <tr>
              <th className="px-3 py-2">Issue ID</th>
              <th className="px-3 py-2">Book</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Due Date</th>
              <th className="px-3 py-2">Returned At</th>
              <th className="px-3 py-2">Fine</th>
              <th className="px-3 py-2 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {issues.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-5 text-center text-slate-500">
                  No issued books found.
                </td>
              </tr>
            )}

            {issues.map((issue) => {
              const id = getIssueId(issue);
              const status = getIssueStatus(issue);
              const lower = status.toLowerCase();
              const bookId = getIssueBookId(issue);
              const bookTitle =
                bookTitles.get(String(bookId)) || (bookId ? `Book #${bookId}` : "Unknown Book");
              const fine = getIssueFine(issue);

              return (
                <tr key={id || bookTitle} className="border-t">
                  <td className="px-3 py-2">{id || "-"}</td>
                  <td className="px-3 py-2 font-medium text-slate-900">{bookTitle}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(
                        status
                      )}`}
                    >
                      {status}
                    </span>
                  </td>
                  <td className="px-3 py-2">{formatDateTime(getIssueDueDate(issue))}</td>
                  <td className="px-3 py-2">{formatDateTime(getIssueReturnDate(issue))}</td>
                  <td className="px-3 py-2">{fine > 0 ? fine : "-"}</td>
                  <td className="px-3 py-2 text-right">
                    {lower.includes("issued") ? (
                      <button
                        type="button"
                        className="btn-primary"
                        onClick={() => returnBook(id)}
                        disabled={updatingIssueId === id}
                      >
                        {updatingIssueId === id ? "Returning..." : "Return Book"}
                      </button>
                    ) : (
                      <span className="text-xs text-slate-500">Completed</span>
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

export default MyIssuedBooks;
