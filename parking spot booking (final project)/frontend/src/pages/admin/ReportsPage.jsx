import { useEffect, useState } from "react";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import PageHeader from "../../components/common/PageHeader";
import { adminService } from "../../services/adminService";
import { formatCurrency } from "../../utils/format";

const ReportsPage = () => {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadReports = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await adminService.getReportsSummary();
      setReports(data);
    } catch (err) {
      setError(err.message || "Failed to load reports.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const roleEntries = Object.entries(reports?.by_role || {});
  const bookingEntries = Object.entries(reports?.by_booking_status || {});
  const approvalEntries = Object.entries(reports?.by_approval || {});
  const monthlyRevenue = reports?.monthly_revenue || [];
  const maxMonthlyRevenue = monthlyRevenue.length
    ? Math.max(...monthlyRevenue.map((item) => Number(item.amount) || 0), 1)
    : 1;

  return (
    <div className="space-y-5">
      <PageHeader title="Reports Summary" subtitle="Platform trends and distribution from database analytics." />
      {loading ? <Card><p className="text-sm text-slate-500">Loading analytics...</p></Card> : null}
      {error ? (
        <Card className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-rose-600">{error}</p>
          <Button size="sm" variant="secondary" onClick={loadReports} disabled={loading}>
            {loading ? "Retrying..." : "Retry"}
          </Button>
        </Card>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-xs font-semibold uppercase text-slate-500">Users by Role</p>
          <div className="mt-3 space-y-2 text-sm">
            {roleEntries.map(([key, value]) => (
              <div key={key} className="flex items-center justify-between rounded-lg bg-slate-50 p-2">
                <span className="capitalize text-slate-700">{key}</span>
                <span className="font-semibold text-slate-900">{value}</span>
              </div>
            ))}
            {!loading && roleEntries.length === 0 ? <p className="text-slate-500">No data available.</p> : null}
          </div>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase text-slate-500">Bookings by Status</p>
          <div className="mt-3 space-y-2 text-sm">
            {bookingEntries.map(([key, value]) => (
              <div key={key} className="flex items-center justify-between rounded-lg bg-slate-50 p-2">
                <span className="capitalize text-slate-700">{key}</span>
                <span className="font-semibold text-slate-900">{value}</span>
              </div>
            ))}
            {!loading && bookingEntries.length === 0 ? <p className="text-slate-500">No data available.</p> : null}
          </div>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase text-slate-500">Approvals Split</p>
          <div className="mt-3 space-y-2 text-sm">
            {approvalEntries.map(([key, value]) => (
              <div key={key} className="flex items-center justify-between rounded-lg bg-slate-50 p-2">
                <span className="capitalize text-slate-700">{key}</span>
                <span className="font-semibold text-slate-900">{value}</span>
              </div>
            ))}
            {!loading && approvalEntries.length === 0 ? <p className="text-slate-500">No data available.</p> : null}
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="font-display text-lg font-semibold text-slate-900">Monthly Revenue Trend</h3>
        <div className="mt-4 space-y-3">
          {monthlyRevenue.map((item) => (
            <div key={item.month}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-medium text-slate-700">{item.month}</span>
                <span className="text-slate-700">{formatCurrency(item.amount)}</span>
              </div>
              <div className="h-3 rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{ width: `${Math.min(100, ((Number(item.amount) || 0) / maxMonthlyRevenue) * 100)}%` }}
                />
              </div>
            </div>
          ))}
          {!loading && monthlyRevenue.length === 0 ? <p className="text-slate-500">No data available.</p> : null}
        </div>
      </Card>
    </div>
  );
};

export default ReportsPage;
