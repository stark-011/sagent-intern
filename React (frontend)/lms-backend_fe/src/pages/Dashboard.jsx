import { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import * as issueService from "../api/issueService";
import * as notifyService from "../api/notifyService";
import * as stockService from "../api/stockService";
import Loader from "../components/Loader";
import { useAuth } from "../context/AuthContext";
import {
  formatDateTime,
  getBookTitle,
  getEntityId,
  getIssueBookId,
  getIssueId,
  getIssueStatus,
  getIssueUserId,
  getNotificationMessage,
  getUserDisplayName,
  getUserId,
  isNotificationRead,
  normalizeRole,
} from "../utils/fieldUtils";

const statusPillClass = (status) => {
  const normalized = String(status).toLowerCase();
  if (normalized.includes("issued")) return "bg-brand-100 text-brand-800";
  if (normalized.includes("returned")) return "bg-emerald-100 text-emerald-800";
  if (normalized.includes("cancel")) return "bg-rose-100 text-rose-800";
  return "bg-amber-100 text-amber-800";
};

const Dashboard = () => {
  const { user, role } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([]);
  const [recentIssues, setRecentIssues] = useState([]);

  const userId = getUserId(user || {});
  const normalizedRole = normalizeRole(role);
  const displayName = getUserDisplayName(user || {});

  const loadData = async () => {
    setLoading(true);
    try {
      const [stockResult, issueResult, notificationResult] = await Promise.allSettled([
        stockService.getAllStock(),
        issueService.getAllIssues(),
        normalizedRole === "LIBRARIAN" || !userId
          ? notifyService.getAllNotifications()
          : notifyService.getUserNotifications(userId),
      ]);

      const stocks =
        stockResult.status === "fulfilled" && Array.isArray(stockResult.value)
          ? stockResult.value
          : [];
      const issues =
        issueResult.status === "fulfilled" && Array.isArray(issueResult.value)
          ? issueResult.value
          : [];
      const notifications =
        notificationResult.status === "fulfilled" &&
        Array.isArray(notificationResult.value)
          ? notificationResult.value
          : [];

      const myIssues = issues.filter(
        (issue) => String(getIssueUserId(issue)) === String(userId)
      );

      const metrics =
        normalizedRole === "LIBRARIAN"
          ? [
              { label: "Total Books", value: stocks.length },
              {
                label: "Pending Requests",
                value: issues.filter((item) =>
                  getIssueStatus(item).toLowerCase().includes("request")
                ).length,
              },
              {
                label: "Issued Books",
                value: issues.filter((item) =>
                  getIssueStatus(item).toLowerCase().includes("issued")
                ).length,
              },
              { label: "Notifications", value: notifications.length },
            ]
          : [
              { label: "Books in Catalog", value: stocks.length },
              { label: "My Requests", value: myIssues.length },
              {
                label: "My Issued Books",
                value: myIssues.filter((item) =>
                  getIssueStatus(item).toLowerCase().includes("issued")
                ).length,
              },
              {
                label: "Unread Alerts",
                value: notifications.filter((item) => !isNotificationRead(item)).length,
              },
            ];

      const stockMap = new Map(stocks.map((item) => [String(getEntityId(item)), item]));
      const sourceIssues = normalizedRole === "LIBRARIAN" ? issues : myIssues;
      const topIssues = sourceIssues.slice(0, 6).map((issue) => {
        const stock = stockMap.get(String(getIssueBookId(issue)));
        return {
          id: getIssueId(issue),
          title: getBookTitle(stock || {}),
          status: getIssueStatus(issue),
          updatedAt:
            issue.updatedAt ||
            issue.returnDate ||
            issue.returnedDate ||
            issue.issueDate ||
            issue.createdAt,
        };
      });

      setStats(metrics);
      setRecentIssues(topIssues);
    } catch (error) {
      toast.error(error?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [normalizedRole, userId]);

  const quickNotes = useMemo(
    () => [
      "Book data and request states refresh from /api/stock and /api/issues.",
      "Notifications are served from /api/notifications and user-specific routes.",
      "Role-based menus are controlled by your saved user role.",
    ],
    []
  );

  if (loading) {
    return <Loader text="Loading dashboard..." />;
  }

  return (
    <div className="space-y-6">
      <section className="panel">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-500">
          Welcome
        </p>
        <h2 className="mt-2 text-2xl font-bold text-slate-900">{displayName}</h2>
        <p className="mt-2 text-sm text-slate-600">
          Role: <span className="font-semibold">{normalizedRole}</span>
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <article key={item.label} className="panel">
            <p className="text-sm text-slate-600">{item.label}</p>
            <p className="mt-3 text-3xl font-bold text-slate-900">{item.value}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <article className="panel lg:col-span-2">
          <h3 className="text-lg font-semibold text-slate-900">Recent Transactions</h3>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-brand-50 text-left text-slate-700">
                <tr>
                  <th className="px-3 py-2">Issue ID</th>
                  <th className="px-3 py-2">Book</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Updated</th>
                </tr>
              </thead>
              <tbody>
                {recentIssues.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-3 py-5 text-center text-slate-500">
                      No transactions found.
                    </td>
                  </tr>
                )}

                {recentIssues.map((item) => (
                  <tr key={item.id || `${item.title}-${item.updatedAt}`} className="border-t">
                    <td className="px-3 py-2">{item.id || "-"}</td>
                    <td className="px-3 py-2">{item.title}</td>
                    <td className="px-3 py-2">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusPillClass(
                          item.status
                        )}`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-3 py-2">{formatDateTime(item.updatedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="panel">
          <h3 className="text-lg font-semibold text-slate-900">System Notes</h3>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            {quickNotes.map((note) => (
              <li key={note} className="rounded-lg bg-brand-50 px-3 py-2">
                {note}
              </li>
            ))}
          </ul>
          <p className="mt-5 text-xs text-slate-500">
            Latest notification preview:{" "}
            <span className="font-medium text-slate-700">
              {getNotificationMessage({ message: "Open Notifications to view reminders." })}
            </span>
          </p>
        </article>
      </section>
    </div>
  );
};

export default Dashboard;
