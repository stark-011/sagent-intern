import { CalendarClock, CreditCard, ParkingCircle, Wallet } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import Card from "../../components/common/Card";
import PageHeader from "../../components/common/PageHeader";
import StatCard from "../../components/common/StatCard";
import { useAuth } from "../../hooks/useAuth";
import { bookingService } from "../../services/bookingService";
import { walletService } from "../../services/walletService";
import { formatCurrency, formatDateTime } from "../../utils/format";
import { useEffect, useMemo, useState } from "react";

const UserDashboardPage = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      bookingService.getBookingsByUser(user.user_id),
      walletService.getWalletByUser(user.user_id),
      walletService.getTransactionsByUser(user.user_id),
    ])
      .then(([bookingRes, walletRes, txnRes]) => {
        setBookings(bookingRes);
        setWallet(walletRes);
        setTransactions(txnRes.slice(0, 5));
      })
      .catch((error) => toast.error(error.message));
  }, [user]);

  const summary = useMemo(() => {
    const statusOf = (item) => item.booking_status || item.bookingStatus || "";
    const amountOf = (item) => item.total_amount ?? item.totalAmount ?? 0;
    const active = bookings.filter((item) => statusOf(item) === "active").length;
    const upcoming = bookings.filter((item) => statusOf(item) === "upcoming").length;
    return {
      total: bookings.length,
      active,
      upcoming,
      spent: bookings.reduce((sum, item) => sum + Number(amountOf(item) || 0), 0),
    };
  }, [bookings]);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome, ${user?.full_name || "Driver"}`}
        subtitle="Overview of your bookings, wallet, and recent activity."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Wallet Balance" value={formatCurrency(wallet?.credit_balance || 0)} icon={<Wallet className="h-5 w-5" />} />
        <StatCard title="Active Bookings" value={summary.active} icon={<ParkingCircle className="h-5 w-5" />} accent="text-emerald-600" />
        <StatCard title="Upcoming Bookings" value={summary.upcoming} icon={<CalendarClock className="h-5 w-5" />} accent="text-sky-600" />
        <StatCard title="Total Spent" value={formatCurrency(summary.spent)} icon={<CreditCard className="h-5 w-5" />} accent="text-amber-600" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="font-display text-lg font-semibold text-slate-900">Quick Actions</h3>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Link className="quick-action" to="/search">Search Spots</Link>
            <Link className="quick-action" to="/user/bookings">My Bookings</Link>
            <Link className="quick-action" to="/user/wallet">Add Credits</Link>
            <Link className="quick-action" to="/user/reviews">Write Review</Link>
          </div>
        </Card>

        <Card>
          <h3 className="font-display text-lg font-semibold text-slate-900">Recent Transactions</h3>
          <div className="mt-3 space-y-2">
            {transactions.map((txn) => (
              <div key={txn.wallet_txn_id} className="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-sm">
                <div>
                  <p className="font-medium text-slate-800">{txn.description}</p>
                  <p className="text-xs text-slate-500">{formatDateTime(txn.created_at)}</p>
                </div>
                <p className={(txn.txn_type || txn.txnType) === "credit" ? "text-emerald-600" : "text-rose-600"}>
                  {(txn.txn_type || txn.txnType) === "credit" ? "+" : "-"}
                  {formatCurrency(txn.amount)}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="font-display text-lg font-semibold text-slate-900">Recent Booked Spots</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          {bookings.slice(0, 3).map((booking) => (
            <div key={booking.booking_id} className="rounded-xl bg-slate-50 p-3">
              <p className="font-semibold text-slate-900">{booking.spot?.spot_title || "-"}</p>
              <p className="text-sm text-slate-600">{booking.location_tag}</p>
              <p className="mt-1 text-sm text-slate-500">{formatDateTime(booking.booked_start_time)}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default UserDashboardPage;
