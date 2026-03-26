import { Clock3, MapPin, Star, UserCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import BookingPanel from "../../components/booking/BookingPanel";
import Badge from "../../components/common/Badge";
import Card from "../../components/common/Card";
import LoadingSkeleton from "../../components/common/LoadingSkeleton";
import ParkingMap from "../../components/maps/ParkingMap";
import SpotGallery from "../../components/parking/SpotGallery";
import SpotCard from "../../components/parking/SpotCard";
import { formatVehicleTypes } from "../../constants/vehicleTypes";
import { useAuth } from "../../hooks/useAuth";
import { bookingService } from "../../services/bookingService";
import { parkingService } from "../../services/parkingService";
import { vehicleService } from "../../services/vehicleService";
import { walletService } from "../../services/walletService";
import { formatCurrency, formatDateTime } from "../../utils/format";

const SpotDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [spot, setSpot] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [alternativeLoading, setAlternativeLoading] = useState(false);
  const [conflictHelp, setConflictHelp] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setConflictHelp(null);
      const [spotRes, reviewsRes] = await Promise.all([
        parkingService.getSpotById(id),
        parkingService.getReviewsBySpot(id),
      ]);
      setSpot(spotRes);
      setReviews(reviewsRes);

      if (user?.role === "driver") {
        const [vehiclesRes, walletRes] = await Promise.all([
          vehicleService.getVehiclesByUser(user.user_id),
          walletService.getWalletByUser(user.user_id),
        ]);
        setVehicles(vehiclesRes);
        setWallet(walletRes);
      } else {
        setVehicles([]);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user?.user_id]);

  const getAvailableSlot = () =>
    spot?.spot_status === "active"
      ? spot?.slots?.find((item) => item.slot_status === "available")
      : null;

  const handleReserve = async () => {
    if (!user || user.role !== "driver") {
      toast.error("Only driver accounts can create reservations.");
      return;
    }
    const slot = getAvailableSlot();
    if (!slot) {
      toast.error("No slots available right now.");
      return;
    }
    await bookingService.createReservationHold({
      user_id: user.user_id,
      spot_id: spot.spot_id,
      slot_id: slot.slot_id,
    });
    toast.success("Reservation hold created for 10 minutes.");
  };

  const handleBookNow = async (form) => {
    if (!user || user.role !== "driver") {
      toast.error("Only driver accounts can book spots.");
      return;
    }
    const slot = getAvailableSlot();
    if (!slot) {
      toast.error("No slots available right now.");
      return;
    }
    try {
      setBookingLoading(true);
      setConflictHelp(null);
      await bookingService.createReservationHold({
        user_id: user.user_id,
        spot_id: spot.spot_id,
        slot_id: slot.slot_id,
      });
      const booking = await bookingService.confirmBooking({
        user_id: user.user_id,
        spot_id: spot.spot_id,
        slot_id: slot.slot_id,
        vehicle_id: form.vehicle_id,
        booked_start_time: form.booked_start_time,
        booked_end_time: form.booked_end_time,
      });
      toast.success("Booking confirmed successfully.");
      await loadData();
      navigate(`/user/bookings/${booking.booking_id}`);
    } catch (error) {
      if (isBookingConflictError(error)) {
        await loadAlternativeSpots(form, error.message);
      } else {
        toast.error(error.message);
      }
    } finally {
      setBookingLoading(false);
    }
  };

  const isBookingConflictError = (error) =>
    error?.errorCode === "BOOKING_OVERLAP" ||
    error?.status === 409 ||
    /already booked|safety buffer/i.test(error?.message || "");

  const loadAlternativeSpots = async (form, message) => {
    if (!form?.booked_start_time || !form?.booked_end_time) {
      return;
    }

    try {
      setAlternativeLoading(true);
      const alternatives = await parkingService.getAlternativeSpots(
        id,
        form.booked_start_time,
        form.booked_end_time
      );
      setConflictHelp({
        message,
        alternatives,
        booked_start_time: form.booked_start_time,
        booked_end_time: form.booked_end_time,
      });
      if (alternatives.length) {
        toast.error(`${message} Nearby alternatives are shown below.`);
      } else {
        toast.error(message);
      }
    } catch (error) {
      setConflictHelp({
        message,
        alternatives: [],
        booked_start_time: form.booked_start_time,
        booked_end_time: form.booked_end_time,
      });
      toast.error(error.message);
    } finally {
      setAlternativeLoading(false);
    }
  };

  if (loading) return <LoadingSkeleton count={8} className="h-10" />;
  if (!spot) return <p className="text-sm text-slate-600">Spot not found.</p>;

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          <SpotGallery images={spot.images} />
          <Card>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="font-display text-2xl font-bold text-slate-900">{spot.spot_title}</h1>
                <p className="mt-1 flex items-center gap-1 text-sm text-slate-600">
                  <MapPin className="h-4 w-4" />
                  {spot.address_line}, {spot.locality}, {spot.city}
                </p>
              </div>
              <Badge status={spot.approval_status} />
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-700">{spot.description}</p>
            <div className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
              <p>
                <span className="font-semibold text-slate-800">Spot Type:</span> {spot.spot_type}
              </p>
              <p>
                <span className="font-semibold text-slate-800">Slots:</span> {spot.available_slots}/
                {spot.total_slots} available
              </p>
              <p>
                <span className="font-semibold text-slate-800">Price:</span>{" "}
                {formatCurrency(spot.price_per_hour)}/hour
              </p>
              <p>
                <span className="font-semibold text-slate-800">Device Access:</span>{" "}
                Granted automatically after booking confirmation
              </p>
              <p>
                <span className="font-semibold text-slate-800">Vehicles:</span>{" "}
                {formatVehicleTypes(spot.vehicle_type_allowed)}
              </p>
              <p className="flex items-center gap-1">
                <Clock3 className="h-4 w-4" />
                {spot.availability?.[0]?.day_of_week} {spot.availability?.[0]?.start_time} -{" "}
                {spot.availability?.[0]?.end_time}
              </p>
              <p className="flex items-center gap-1 text-amber-600">
                <Star className="h-4 w-4 fill-amber-400" /> {spot.rating} ({spot.review_count}{" "}
                ratings)
              </p>
            </div>
          </Card>

          <Card>
            <h3 className="font-display text-lg font-semibold text-slate-900">Lender Details</h3>
            <p className="mt-2 flex items-center gap-2 text-sm text-slate-700">
              <UserCircle2 className="h-4 w-4 text-brand-600" />
              {spot.lender?.full_name} ({spot.lender?.phone})
            </p>
          </Card>

          <Card>
            <h3 className="font-display text-lg font-semibold text-slate-900">Reviews</h3>
            <div className="mt-3 space-y-3">
              {reviews.length ? (
                reviews.map((review) => (
                  <div key={review.review_id} className="rounded-xl bg-slate-50 p-3">
                    <p className="text-sm font-semibold text-slate-900">
                      {review.user?.full_name || "User"} - {review.rating}/5
                    </p>
                    <p className="mt-1 text-sm text-slate-600">{review.comment}</p>
                    <p className="mt-1 text-xs text-slate-500">{formatDateTime(review.created_at)}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">No reviews yet for this spot.</p>
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <BookingPanel
            spot={spot}
            vehicles={vehicles}
            wallet={wallet}
            isLoggedIn={Boolean(user)}
            onReserve={handleReserve}
            onBookNow={handleBookNow}
            onBookingConflict={loadAlternativeSpots}
            loading={bookingLoading}
          />
          {conflictHelp ? (
            <Card>
              <h3 className="font-display text-lg font-semibold text-slate-900">
                Nearby Alternative Spots
              </h3>
              <p className="mt-2 text-sm text-slate-600">{conflictHelp.message}</p>
              <p className="mt-1 text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                Requested window: {formatDateTime(conflictHelp.booked_start_time)} to{" "}
                {formatDateTime(conflictHelp.booked_end_time)}
              </p>
              {alternativeLoading ? (
                <p className="mt-4 text-sm text-slate-500">Finding nearby protected slots...</p>
              ) : conflictHelp.alternatives.length ? (
                <div className="mt-4 space-y-4">
                  {conflictHelp.alternatives.map((alternative) => (
                    <SpotCard key={alternative.spot_id} spot={alternative} compact />
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-sm text-slate-500">
                  No nearby alternative spots are available for the same time range right now.
                </p>
              )}
            </Card>
          ) : null}
          <Card>
            <h3 className="mb-3 font-display text-lg font-semibold text-slate-900">Location Map</h3>
            <ParkingMap
              spots={[spot]}
              selectedSpot={spot}
              center={[spot.latitude, spot.longitude]}
              zoom={15}
              className="h-[320px]"
            />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SpotDetailsPage;
