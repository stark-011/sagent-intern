import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import Badge from "../../components/common/Badge";
import DataTable from "../../components/common/DataTable";
import PageHeader from "../../components/common/PageHeader";
import { useAuth } from "../../hooks/useAuth";
import { lenderService } from "../../services/lenderService";
import { formatCurrency, formatDateTime } from "../../utils/format";

const SpotBookingsPage = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [bookings, setBookings] = useState([]);
  const [spots, setSpots] = useState([]);

  const status = searchParams.get("status") || "";
  const date = searchParams.get("date") || "";
  const spotId = searchParams.get("spotId") || "";

  const updateFilter = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    setSearchParams(next, { replace: true });
  };

  const load = async () => {
    if (!user) return;
    try {
      const [bookingRows, spotRows] = await Promise.all([
        lenderService.getBookings(user.user_id, { status, date, spotId }),
        lenderService.getSpots(user.user_id),
      ]);
      setBookings(bookingRows);
      setSpots(spotRows);
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    load();
  }, [user, status, date, spotId]);

  const columns = [
    { key: "booking_code", header: "Booking Code" },
    { key: "spot", header: "Spot", render: (row) => row.spot?.spot_title || "-" },
    { key: "driver", header: "Driver", render: (row) => row.user?.full_name || "-" },
    { key: "slot", header: "Slot", render: (row) => row.slot?.slot_code || "-" },
    { key: "time", header: "Booking Time", render: (row) => formatDateTime(row.booked_start_time) },
    { key: "amount", header: "Amount", render: (row) => formatCurrency(row.total_amount) },
    { key: "status", header: "Status", render: (row) => <Badge status={row.booking_status} /> },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Spot Bookings"
        subtitle={spotId ? "Filtered bookings for selected spot." : "Bookings for all spots owned by you."}
      />
      <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">Status</label>
          <select className="input-base" value={status} onChange={(e) => updateFilter("status", e.target.value)}>
            <option value="">All</option>
            <option value="active">Active</option>
            <option value="upcoming">Upcoming</option>
            <option value="overstay">Overstay</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">Date</label>
          <input
            type="date"
            className="input-base"
            value={date}
            onChange={(e) => updateFilter("date", e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">Spot</label>
          <select
            className="input-base"
            value={spotId}
            onChange={(e) => updateFilter("spotId", e.target.value)}
          >
            <option value="">All Spots</option>
            {spots.map((spot) => (
              <option key={spot.spot_id} value={spot.spot_id}>
                {spot.spot_title}
              </option>
            ))}
          </select>
        </div>
      </div>
      <DataTable columns={columns} rows={bookings.map((item) => ({ ...item, id: item.booking_id }))} />
    </div>
  );
};

export default SpotBookingsPage;
