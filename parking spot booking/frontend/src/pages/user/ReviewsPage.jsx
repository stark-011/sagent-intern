import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import PageHeader from "../../components/common/PageHeader";
import { useAuth } from "../../hooks/useAuth";
import { bookingService } from "../../services/bookingService";
import { formatDateTime } from "../../utils/format";

const ReviewsPage = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const preferredBooking = searchParams.get("booking");
  const [reviews, setReviews] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [form, setForm] = useState({
    booking_id: preferredBooking || "",
    rating: 5,
    comment: "",
  });

  const loadData = async () => {
    const [reviewRes, bookingRes] = await Promise.all([
      bookingService.getReviewsByUser(user.user_id),
      bookingService.getBookingsByUser(user.user_id),
    ]);
    setReviews(reviewRes);
    setBookings(bookingRes);
  };

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  const eligibleBookings = useMemo(() => {
    const reviewedIds = new Set(reviews.map((item) => item.booking_id));
    return bookings.filter(
      (item) =>
        ["completed", "overstay"].includes(item.booking_status) &&
        !reviewedIds.has(item.booking_id)
    );
  }, [bookings, reviews]);

  const submitReview = async (e) => {
    e.preventDefault();
    const booking = bookings.find((item) => item.booking_id === form.booking_id);
    if (!booking) {
      toast.error("Select a completed or overstay booking.");
      return;
    }
    if (!form.comment.trim()) {
      toast.error("Please enter review comments.");
      return;
    }
    try {
      await bookingService.submitReview({
        booking_id: booking.booking_id,
        spot_id: booking.spot.spot_id,
        user_id: user.user_id,
        rating: Number(form.rating),
        comment: form.comment,
      });
      toast.success("Review submitted.");
      setForm({ booking_id: "", rating: 5, comment: "" });
      loadData();
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader title="Reviews" subtitle="Write and manage your parking spot reviews." />

      <Card>
        <h3 className="font-display text-lg font-semibold text-slate-900">Submit Review</h3>
        <form className="mt-3 grid gap-3 md:grid-cols-3" onSubmit={submitReview}>
          <select
            className="input-base md:col-span-2"
            value={form.booking_id}
            onChange={(e) => setForm((prev) => ({ ...prev, booking_id: e.target.value }))}
          >
            <option value="">Select completed or overstay booking</option>
            {eligibleBookings.map((booking) => (
              <option key={booking.booking_id} value={booking.booking_id}>
                {booking.booking_code} - {booking.spot?.spot_title}
              </option>
            ))}
          </select>
          <select
            className="input-base"
            value={form.rating}
            onChange={(e) => setForm((prev) => ({ ...prev, rating: e.target.value }))}
          >
            {[5, 4, 3, 2, 1].map((rating) => (
              <option key={rating} value={rating}>
                {rating} Star
              </option>
            ))}
          </select>
          <textarea
            className="input-base md:col-span-3"
            rows={3}
            placeholder="Share your experience..."
            value={form.comment}
            onChange={(e) => setForm((prev) => ({ ...prev, comment: e.target.value }))}
          />
          <div className="md:col-span-3">
            <Button type="submit">Submit Review</Button>
          </div>
        </form>
      </Card>

      <Card>
        <h3 className="font-display text-lg font-semibold text-slate-900">Submitted Reviews</h3>
        <div className="mt-3 space-y-3">
          {reviews.map((review) => (
            <div key={review.review_id} className="rounded-xl bg-slate-50 p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold text-slate-900">{review.spot?.spot_title}</p>
                <Badge label={`${review.rating} stars`} className="bg-amber-100 text-amber-700" />
              </div>
              <p className="mt-1 text-sm text-slate-600">{review.comment}</p>
              <p className="mt-1 text-xs text-slate-500">{formatDateTime(review.created_at)}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default ReviewsPage;
