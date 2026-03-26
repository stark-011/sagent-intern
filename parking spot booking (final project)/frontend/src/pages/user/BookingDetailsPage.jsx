import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Badge from "../../components/common/Badge";
import Card from "../../components/common/Card";
import LoadingSkeleton from "../../components/common/LoadingSkeleton";
import PageHeader from "../../components/common/PageHeader";
import { bookingService } from "../../services/bookingService";
import { formatCurrency, formatDateTime } from "../../utils/format";

const BookingDetailsPage = () => {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([bookingService.getBookingById(id), bookingService.getBookingHistory(id)])
      .then(([bookingRes, historyRes]) => {
        setBooking(bookingRes);
        setHistory(historyRes);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSkeleton count={6} className="h-12" />;
  if (!booking) return <p className="text-sm text-slate-600">Booking not found.</p>;

  const protectedUntil =
    booking.blocked_until_time || booking.blockedUntilTime || booking.buffer_end_time || booking.booked_end_time;

  return (
    <div className="space-y-5">
      <PageHeader
        title={`Booking ${booking.booking_code}`}
        subtitle="Complete booking information and status timeline."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="font-display text-lg font-semibold text-slate-900">Booking Info</h3>
          <div className="mt-3 space-y-2 text-sm text-slate-700">
            <p><span className="font-semibold">Spot:</span> {booking.spot?.spot_title}</p>
            <p><span className="font-semibold">Location:</span> {booking.location_tag}</p>
            <p><span className="font-semibold">Slot:</span> {booking.slot?.slot_code}</p>
            <p className="flex items-center gap-2">
              <span className="font-semibold">Device Access:</span>
              <Badge
                status={booking.slot?.device_open ? "active" : "inactive"}
                label={booking.slot?.device_open ? "Granted" : "Closed"}
              />
            </p>
            <p><span className="font-semibold">Vehicle:</span> {booking.vehicle?.vehicle_name} ({booking.vehicle?.vehicle_number})</p>
            <p><span className="font-semibold">Start:</span> {formatDateTime(booking.booked_start_time)}</p>
            <p><span className="font-semibold">End:</span> {formatDateTime(booking.booked_end_time)}</p>
            <p><span className="font-semibold">Safety Buffer:</span> {booking.buffer_minutes || 60} minutes</p>
            <p><span className="font-semibold">Buffer Ends:</span> {formatDateTime(booking.buffer_end_time)}</p>
            <p><span className="font-semibold">Slot Protected Until:</span> {formatDateTime(protectedUntil)}</p>
            <p><span className="font-semibold">Checkout:</span> {formatDateTime(booking.actual_checkout_time)}</p>
            <p className="flex items-center gap-2">
              <span className="font-semibold">Status:</span> <Badge status={booking.booking_status} />
            </p>
          </div>
        </Card>

        <Card>
          <h3 className="font-display text-lg font-semibold text-slate-900">Payment Summary</h3>
          <div className="mt-3 space-y-2 text-sm text-slate-700">
            <p><span className="font-semibold">Booked Amount:</span> {formatCurrency(booking.booked_amount)}</p>
            <p><span className="font-semibold">Late Fee:</span> {formatCurrency(booking.late_fee)}</p>
            <p><span className="font-semibold">Total:</span> {formatCurrency(booking.total_amount)}</p>
            <p className="flex items-center gap-2">
              <span className="font-semibold">Payment Status:</span>{" "}
              <Badge status={booking.payment?.payment_status || "pending"} />
            </p>
            <p><span className="font-semibold">Paid At:</span> {formatDateTime(booking.payment?.paid_at)}</p>
          </div>
        </Card>
      </div>

      {booking.booking_status === "overstay" ? (
        <Card className="border border-amber-200 bg-amber-50">
          <h3 className="font-display text-lg font-semibold text-amber-900">Overstay Alert</h3>
          <p className="mt-2 text-sm text-amber-800">
            This booking exceeded the 1 hour safety buffer. The slot stayed blocked until the car
            actually left, and the late fee includes the extra overstay charge.
          </p>
        </Card>
      ) : null}

      <Card>
        <h3 className="font-display text-lg font-semibold text-slate-900">Booking History Timeline</h3>
        <div className="mt-4 space-y-3">
          {history.map((item) => (
            <div key={item.history_id} className="rounded-xl bg-slate-50 p-3 text-sm">
              <div className="flex items-center justify-between">
                <Badge status={item.status} />
                <span className="text-xs text-slate-500">{formatDateTime(item.changed_at)}</span>
              </div>
              <p className="mt-1 text-slate-700">{item.note}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default BookingDetailsPage;
