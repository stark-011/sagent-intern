import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import DataTable from "../../components/common/DataTable";
import PageHeader from "../../components/common/PageHeader";
import Tabs from "../../components/common/Tabs";
import { useAuth } from "../../hooks/useAuth";
import { bookingService } from "../../services/bookingService";
import { formatCurrency, formatDateTime } from "../../utils/format";

const UserBookingsPage = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");

  const loadBookings = useCallback(async (silent = false) => {
    if (!user) return;
    try {
      const items = await bookingService.getBookingsByUser(user.user_id);
      setBookings(items);
    } catch (error) {
      if (!silent) {
        toast.error(error.message);
      }
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    loadBookings();
    const timer = window.setInterval(() => {
      loadBookings(true);
    }, 15000);
    return () => window.clearInterval(timer);
  }, [user, loadBookings]);

  const bookingsWithLiveStatus = useMemo(
    () =>
      bookings.map((item) => {
        if (item.booking_status !== "upcoming") {
          return { ...item, live_status: item.booking_status };
        }

        if (!item.booked_start_time) {
          return { ...item, live_status: item.booking_status };
        }

        const start = new Date(item.booked_start_time);
        if (Number.isNaN(start.getTime())) {
          return { ...item, live_status: item.booking_status };
        }

        return {
          ...item,
          live_status: start.getTime() <= Date.now() ? "active" : item.booking_status,
        };
      }),
    [bookings]
  );

  const filtered = bookingsWithLiveStatus.filter((item) =>
    statusFilter === "all" ? true : item.live_status === statusFilter
  );

  const handleCancel = async (bookingId) => {
    try {
      await bookingService.cancelBooking(bookingId);
      toast.success("Booking cancelled.");
      loadBookings();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleCheckout = async (bookingId) => {
    try {
      await bookingService.checkoutBooking(bookingId, new Date().toISOString());
      toast.success("Checked out successfully.");
      loadBookings();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const columns = [
    { key: "booking_code", header: "Booking Code" },
    { key: "spot", header: "Spot", render: (row) => row.spot?.spot_title || "-" },
    { key: "slot", header: "Slot", render: (row) => row.slot?.slot_code || "-" },
    {
      key: "booked_start_time",
      header: "Start / End",
      render: (row) => (
        <div>
          <p>{formatDateTime(row.booked_start_time)}</p>
          <p className="text-xs text-slate-500">{formatDateTime(row.booked_end_time)}</p>
        </div>
      ),
    },
    { key: "total_amount", header: "Amount", render: (row) => formatCurrency(row.total_amount) },
    { key: "late_fee", header: "Late Fee", render: (row) => formatCurrency(row.late_fee) },
    { key: "booking_status", header: "Status", render: (row) => <Badge status={row.live_status} /> },
    { key: "location_tag", header: "Location", render: (row) => <Badge label={row.location_tag} className="bg-sky-100 text-sky-700" /> },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <div className="flex flex-wrap gap-2">
          <Link to={`/user/bookings/${row.booking_id}`}>
            <Button size="sm" variant="secondary">View</Button>
          </Link>
          {["active", "upcoming"].includes(row.live_status) ? (
            <Button size="sm" variant="danger" onClick={() => handleCancel(row.booking_id)}>
              Cancel
            </Button>
          ) : null}
          {row.live_status === "active" ? (
            <Button size="sm" variant="success" onClick={() => handleCheckout(row.booking_id)}>
              Check Out
            </Button>
          ) : null}
          {["completed", "overstay"].includes(row.live_status) ? (
            <Link to={`/user/reviews?booking=${row.booking_id}`}>
              <Button size="sm" variant="secondary">Write Review</Button>
            </Link>
          ) : null}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="My Bookings"
        subtitle="Track current, upcoming, overstay, completed, and cancelled bookings."
      />
      <Tabs
        tabs={[
          { label: "All", value: "all" },
          { label: "Active", value: "active" },
          { label: "Upcoming", value: "upcoming" },
          { label: "Overstay", value: "overstay" },
          { label: "Completed", value: "completed" },
          { label: "Cancelled", value: "cancelled" },
        ]}
        activeTab={statusFilter}
        onChange={setStatusFilter}
      />
      <DataTable columns={columns} rows={filtered.map((item) => ({ ...item, id: item.booking_id }))} />
    </div>
  );
};

export default UserBookingsPage;
