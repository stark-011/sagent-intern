import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import Card from "../../components/common/Card";
import PageHeader from "../../components/common/PageHeader";
import StatCard from "../../components/common/StatCard";
import { adminService } from "../../services/adminService";
import { formatCurrency } from "../../utils/format";
import { ShieldCheck, Users, ParkingCircle, CreditCard, ClipboardCheck } from "lucide-react";

const AdminDashboardPage = () => {
  const [summary, setSummary] = useState(null);
  const [pending, setPending] = useState([]);

  useEffect(() => {
    Promise.all([adminService.getDashboardSummary(), adminService.getPendingApprovals()])
      .then(([summaryRes, pendingRes]) => {
        setSummary(summaryRes);
        setPending(pendingRes.slice(0, 5));
      })
      .catch((error) => toast.error(error.message));
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Dashboard"
        subtitle="Platform health, approvals, and operations overview."
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <StatCard title="Users" value={summary?.totalUsers || 0} icon={<Users className="h-5 w-5" />} />
        <StatCard title="Lenders" value={summary?.totalLenders || 0} icon={<Users className="h-5 w-5" />} accent="text-indigo-600" />
        <StatCard title="Spots" value={summary?.totalSpots || 0} icon={<ParkingCircle className="h-5 w-5" />} accent="text-sky-600" />
        <StatCard title="Pending Approvals" value={summary?.pendingApprovals || 0} icon={<ShieldCheck className="h-5 w-5" />} accent="text-amber-600" />
        <StatCard title="Active Bookings" value={summary?.activeBookings || 0} icon={<ClipboardCheck className="h-5 w-5" />} accent="text-emerald-600" />
        <StatCard title="Payments" value={formatCurrency(summary?.totalPayments || 0)} icon={<CreditCard className="h-5 w-5" />} />
      </div>

      <Card>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold text-slate-900">Quick Review Queue</h3>
          <Link to="/admin/approvals" className="text-sm font-semibold text-brand-600">
            Open approvals
          </Link>
        </div>
        <div className="space-y-2">
          {pending.length ? pending.map((item) => (
            <div key={item.approval_id} className="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-sm">
              <div>
                <p className="font-medium text-slate-800">{item.spot?.spot_title}</p>
                <p className="text-slate-500">{item.spot?.locality}, {item.spot?.city}</p>
              </div>
              <Link to={`/admin/approvals/${item.spot?.spot_id}`} className="text-brand-600 hover:underline">
                Review
              </Link>
            </div>
          )) : <p className="text-sm text-slate-500">No pending approvals.</p>}
        </div>
      </Card>
    </div>
  );
};

export default AdminDashboardPage;
