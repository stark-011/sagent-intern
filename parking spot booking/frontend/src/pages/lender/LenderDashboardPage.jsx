import { Building2, ClipboardCheck, DollarSign, ParkingCircle, PlusCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import Card from "../../components/common/Card";
import PageHeader from "../../components/common/PageHeader";
import StatCard from "../../components/common/StatCard";
import { useAuth } from "../../hooks/useAuth";
import { lenderService } from "../../services/lenderService";
import { formatCurrency, formatDateTime } from "../../utils/format";
import { useEffect, useState } from "react";

const LenderDashboardPage = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    if (!user) return;
    lenderService
      .getDashboardSummary(user.user_id)
      .then(setSummary)
      .catch((error) => toast.error(error.message));
  }, [user]);

  return (
    <div className="space-y-6">
      <PageHeader title="Lender Dashboard" subtitle="Performance overview for your parking inventory." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard title="Total Spots" value={summary?.totalSpots || 0} icon={<Building2 className="h-5 w-5" />} />
        <StatCard title="Active Spots" value={summary?.activeSpots || 0} icon={<ParkingCircle className="h-5 w-5" />} accent="text-emerald-600" />
        <StatCard title="Pending Approval" value={summary?.pendingApprovals || 0} icon={<ClipboardCheck className="h-5 w-5" />} accent="text-amber-600" />
        <StatCard title="Bookings" value={summary?.totalBookings || 0} icon={<ClipboardCheck className="h-5 w-5" />} accent="text-sky-600" />
        <StatCard title="Earnings" value={formatCurrency(summary?.totalEarnings || 0)} icon={<DollarSign className="h-5 w-5" />} accent="text-emerald-600" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="font-display text-lg font-semibold text-slate-900">Quick Actions</h3>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Link className="quick-action" to="/lender/spots/new">
              <PlusCircle className="h-4 w-4" /> Add Spot
            </Link>
            <Link className="quick-action" to="/lender/spots">
              Manage Spots
            </Link>
            <Link className="quick-action" to="/lender/bookings">
              View Bookings
            </Link>
            <Link className="quick-action" to="/lender/earnings">
              Earnings
            </Link>
          </div>
        </Card>

        <Card>
          <h3 className="font-display text-lg font-semibold text-slate-900">Latest Spot Bookings</h3>
          <div className="mt-3 space-y-2">
            {summary?.latestBookings?.length ? summary.latestBookings.map((booking) => (
              <div key={booking.booking_id} className="rounded-xl bg-slate-50 p-3 text-sm">
                <p className="font-medium text-slate-800">{booking.spot?.spot_title}</p>
                <p className="text-slate-600">{booking.booking_code}</p>
                <p className="text-xs text-slate-500">{formatDateTime(booking.booked_start_time)}</p>
              </div>
            )) : <p className="text-sm text-slate-500">No recent bookings for your spots.</p>}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default LenderDashboardPage;
