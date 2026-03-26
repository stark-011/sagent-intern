import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams, useParams } from "react-router-dom";
import { toast } from "sonner";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import PageHeader from "../../components/common/PageHeader";
import TimeSlotButtons, {
  normalizeTimeValue,
  toTimeMinutes,
} from "../../components/common/TimeSlotButtons";
import ParkingMap from "../../components/maps/ParkingMap";
import { formatVehicleTypes } from "../../constants/vehicleTypes";
import { lenderService } from "../../services/lenderService";
import { parkingService } from "../../services/parkingService";
import { formatCurrency, formatDateTime } from "../../utils/format";

const DAY_WINDOW_LABELS = {
  all: "All days",
  "mon-fri": "Monday to Friday",
  "mon-sat": "Monday to Saturday",
  "sat-sun": "Weekend",
};

const getTodayDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getFutureDate = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const normalizeDateValue = (value, fallback = "") => {
  if (!value) return fallback;
  return String(value).slice(0, 10);
};

const toLocalDateValue = (value) => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getBookingStatusValue = (booking) =>
  String(booking?.booking_status ?? booking?.bookingStatus ?? "").toLowerCase();

const getBookingStartValue = (booking) => booking?.booked_start_time ?? booking?.bookedStartTime ?? "";

const getBookingEndValue = (booking) => booking?.booked_end_time ?? booking?.bookedEndTime ?? "";

const getProtectedBookingEndValue = (booking) =>
  booking?.blocked_until_time ??
  booking?.blockedUntilTime ??
  booking?.buffer_end_time ??
  booking?.bufferEndTime ??
  getBookingEndValue(booking);

const matchesAvailabilityDay = (dayOfWeek, value) => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return true;

  const dayIndex = date.getDay();
  switch (dayOfWeek) {
    case "mon-fri":
      return dayIndex >= 1 && dayIndex <= 5;
    case "mon-sat":
      return dayIndex >= 1 && dayIndex <= 6;
    case "sat-sun":
      return dayIndex === 0 || dayIndex === 6;
    case "all":
    default:
      return true;
  }
};

const isProtectedFutureBooking = (booking) => {
  const status = getBookingStatusValue(booking);
  if (!["active", "upcoming", "completed", "overstay"].includes(status)) {
    return false;
  }

  const end = new Date(getProtectedBookingEndValue(booking));
  return !Number.isNaN(end.getTime()) && end.getTime() > Date.now();
};

const doesAvailabilityCoverBooking = (form, booking) => {
  if (!form.is_available) {
    return false;
  }

  const start = new Date(getBookingStartValue(booking));
  const end = new Date(getProtectedBookingEndValue(booking));
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return true;
  }

  const bookingStartDate = toLocalDateValue(start);
  const bookingEndDate = toLocalDateValue(end);
  if (form.effective_from && bookingStartDate < form.effective_from) {
    return false;
  }
  if (form.effective_to && bookingEndDate > form.effective_to) {
    return false;
  }

  if (
    !matchesAvailabilityDay(form.day_of_week, start) ||
    !matchesAvailabilityDay(form.day_of_week, end)
  ) {
    return false;
  }

  const bookingStartTime = `${String(start.getHours()).padStart(2, "0")}:${String(start.getMinutes()).padStart(2, "0")}`;
  const bookingEndTime = `${String(end.getHours()).padStart(2, "0")}:${String(end.getMinutes()).padStart(2, "0")}`;
  return (
    toTimeMinutes(bookingStartTime) >= toTimeMinutes(form.start_time) &&
    toTimeMinutes(bookingEndTime) <= toTimeMinutes(form.end_time)
  );
};

const buildAvailabilityConflictMessage = (booking) => {
  const bookingCode = booking?.booking_code ?? booking?.bookingCode ?? booking?.booking_id ?? "booking";
  return `Availability conflicts with protected booking ${bookingCode} (${formatDateTime(
    getBookingStartValue(booking)
  )} - ${formatDateTime(getProtectedBookingEndValue(booking))})`;
};

const LenderSpotDetailsPage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [spot, setSpot] = useState(null);
  const [savingAvailability, setSavingAvailability] = useState(false);
  const [loadingFutureBookings, setLoadingFutureBookings] = useState(true);
  const [futureBookings, setFutureBookings] = useState([]);
  const [availabilityForm, setAvailabilityForm] = useState({
    day_of_week: "all",
    start_time: normalizeTimeValue("06:00"),
    end_time: normalizeTimeValue("23:00"),
    effective_from: getTodayDate(),
    effective_to: getFutureDate(365),
    is_available: true,
  });

  const availabilityRef = useRef(null);

  const loadSpot = async () => {
    setLoadingFutureBookings(true);
    try {
      const [details, bookingRows] = await Promise.all([
        parkingService.getLenderSpotById(id),
        lenderService.getBookings(undefined, { spotId: id }),
      ]);

      setSpot(details);

      const currentAvailability = details?.availability?.[0];
      setAvailabilityForm({
        day_of_week: currentAvailability?.day_of_week || "all",
        start_time: normalizeTimeValue(currentAvailability?.start_time, "06:00"),
        end_time: normalizeTimeValue(currentAvailability?.end_time, "23:00"),
        effective_from: normalizeDateValue(currentAvailability?.effective_from, getTodayDate()),
        effective_to: normalizeDateValue(currentAvailability?.effective_to, getFutureDate(365)),
        is_available: currentAvailability?.available ?? currentAvailability?.is_available ?? true,
      });

      const protectedBookings = (Array.isArray(bookingRows) ? bookingRows : [])
        .filter(isProtectedFutureBooking)
        .sort(
          (left, right) =>
            new Date(getBookingStartValue(left)).getTime() -
            new Date(getBookingStartValue(right)).getTime()
        );
      setFutureBookings(protectedBookings);
    } finally {
      setLoadingFutureBookings(false);
    }
  };

  useEffect(() => {
    loadSpot().catch((error) => {
      toast.error(error.message);
    });
  }, [id]);

  useEffect(() => {
    if (!spot) return;
    const section = searchParams.get("section");
    if (section === "availability") {
      availabilityRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [spot, searchParams]);

  const conflictingFutureBookings = futureBookings.filter(
    (booking) => !doesAvailabilityCoverBooking(availabilityForm, booking)
  );

  const handleUpdateAvailability = async () => {
    if (loadingFutureBookings) {
      toast.error("Checking protected bookings. Please wait a moment.");
      return;
    }
    if (!availabilityForm.start_time || !availabilityForm.end_time) {
      toast.error("Start and end time are required.");
      return;
    }
    if (toTimeMinutes(availabilityForm.end_time) <= toTimeMinutes(availabilityForm.start_time)) {
      toast.error("End time must be after start time.");
      return;
    }
    if (
      availabilityForm.effective_from &&
      availabilityForm.effective_to &&
      availabilityForm.effective_from > availabilityForm.effective_to
    ) {
      toast.error("Availability start date must be before end date.");
      return;
    }
    if (conflictingFutureBookings.length > 0) {
      toast.error(buildAvailabilityConflictMessage(conflictingFutureBookings[0]));
      return;
    }

    try {
      setSavingAvailability(true);
      await parkingService.updateSpotAvailability(id, availabilityForm);
      toast.success("Availability updated.");
      await loadSpot();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSavingAvailability(false);
    }
  };

  if (!spot) return <p className="text-sm text-slate-600">Loading spot details...</p>;

  const rejectionReason =
    spot.approval_details?.rejection_reason || spot.approval?.rejection_reason || "";
  const currentAvailability = spot.availability?.[0];
  const currentScheduleLabel = `${normalizeTimeValue(
    currentAvailability?.start_time,
    "06:00"
  )} - ${normalizeTimeValue(currentAvailability?.end_time, "23:00")}`;
  const availabilityStatusTone = conflictingFutureBookings.length
    ? "border-amber-200 bg-amber-50"
    : futureBookings.length
      ? "border-emerald-200 bg-emerald-50"
      : "border-slate-200 bg-slate-50";
  const availabilityStatusText = conflictingFutureBookings.length
    ? `Your current draft conflicts with ${conflictingFutureBookings.length} protected booking${
        conflictingFutureBookings.length > 1 ? "s" : ""
      }.`
    : futureBookings.length
      ? `Your current draft keeps ${futureBookings.length} protected future booking${
          futureBookings.length > 1 ? "s" : ""
        } safe.`
      : "No future bookings are scheduled for this spot.";

  return (
    <div className="space-y-5">
      <PageHeader
        title={spot.spot_title}
        subtitle={`${spot.locality}, ${spot.city}`}
        actions={
          <div className="flex flex-wrap gap-3">
            <Link to={`/lender/bookings?spotId=${encodeURIComponent(id)}`}>
              <Button variant="secondary">View Bookings</Button>
            </Link>
            <Link to={`/lender/spots/${id}/edit`}>
              <Button>Edit Spot</Button>
            </Link>
          </div>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(320px,360px)] 2xl:grid-cols-[minmax(0,1.18fr)_minmax(340px,420px)]">
        <div className="space-y-4">
          <Card className="space-y-5">
            <div className="flex flex-col gap-4 border-b border-slate-100 pb-4 md:flex-row md:items-start md:justify-between">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-600">
                  Spot Summary
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge status={spot.spot_status} />
                  <Badge status={spot.approval_status} />
                </div>
                <p className="max-w-2xl text-sm leading-6 text-slate-600">
                  {spot.description || "No description added for this spot yet."}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Current Schedule
                </p>
                <p className="mt-1 font-semibold text-slate-900">
                  {DAY_WINDOW_LABELS[currentAvailability?.day_of_week || "all"] || "All days"}
                </p>
                <p className="text-slate-600">{currentScheduleLabel}</p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Address
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{spot.address_line}</p>
                <p className="mt-1 text-sm text-slate-600">
                  {spot.locality}, {spot.city}
                </p>
                <p className="mt-1 text-sm text-slate-500">Pincode: {spot.pincode}</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Pricing
                </p>
                <p className="mt-2 text-sm text-slate-600">Lender suggested</p>
                <p className="text-base font-semibold text-slate-900">
                  {formatCurrency(
                    spot.pricing?.suggested_base_hourly_rate ?? spot.pricing?.base_hourly_rate ?? 0
                  )}
                </p>
                <p className="mt-2 text-sm text-slate-600">Admin final price / hour</p>
                <p className="text-sm font-semibold text-slate-900">
                  {spot.final_price_set
                    ? formatCurrency(spot.price_per_hour)
                    : "Pending admin pricing"}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Spot Info
                </p>
                <p className="mt-2 text-sm text-slate-600">Spot type</p>
                <p className="text-sm font-semibold capitalize text-slate-900">{spot.spot_type}</p>
                <p className="mt-2 text-sm text-slate-600">Total slots</p>
                <p className="text-sm font-semibold text-slate-900">{spot.total_slots}</p>
                <p className="mt-2 text-sm text-slate-600">Vehicles</p>
                <p className="text-sm font-semibold text-slate-900">
                  {formatVehicleTypes(spot.vehicle_type_allowed)}
                </p>
              </div>
            </div>
          </Card>

          {spot.approval_status === "rejected" && rejectionReason ? (
            <Card>
              <h3 className="font-display text-lg font-semibold text-slate-900">
                Admin Rejection Comment
              </h3>
              <p className="mt-2 whitespace-pre-wrap text-sm text-rose-700">{rejectionReason}</p>
            </Card>
          ) : null}

          <div ref={availabilityRef}>
            <Card className="space-y-5">
              <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-600">
                    Availability
                  </p>
                  <h3 className="mt-1 font-display text-lg font-semibold text-slate-900">
                    Manage Availability
                  </h3>
                  <p className="mt-1 max-w-2xl text-sm text-slate-500">
                    Update the day window, date range, and operating hours. Future protected
                    bookings must remain inside the schedule you save.
                  </p>
                </div>
                <Link to={`/lender/bookings?status=upcoming&spotId=${encodeURIComponent(id)}`}>
                  <Button variant="secondary" size="sm">
                    See Upcoming Bookings
                  </Button>
                </Link>
              </div>

              <div className={`rounded-2xl border p-4 ${availabilityStatusTone}`}>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Protected booking check</p>
                    <p className="mt-1 text-sm text-slate-600">
                      {loadingFutureBookings ? "Checking future bookings..." : availabilityStatusText}
                    </p>
                  </div>
                  {!loadingFutureBookings && futureBookings.length > 0 ? (
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      {futureBookings.length} active/upcoming
                    </p>
                  ) : null}
                </div>

                {!loadingFutureBookings && futureBookings.length > 0 ? (
                  <div className="mt-3 grid gap-2">
                    {futureBookings.slice(0, 3).map((booking) => {
                      const bookingId =
                        booking.booking_id ?? booking.bookingId ?? booking.booking_code ?? booking.bookingCode;
                      const isConflict = conflictingFutureBookings.some(
                        (item) =>
                          (item.booking_id ?? item.bookingId ?? item.booking_code ?? item.bookingCode) ===
                          bookingId
                      );

                      return (
                        <div
                          key={bookingId}
                          className={`rounded-xl border px-3 py-2 text-sm ${
                            isConflict
                              ? "border-amber-200 bg-white text-amber-900"
                              : "border-white/70 bg-white/80 text-slate-700"
                          }`}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="font-semibold text-slate-900">
                              {booking.booking_code || booking.bookingCode}
                            </p>
                            <Badge status={getBookingStatusValue(booking)} />
                          </div>
                          <p className="mt-1 text-xs text-slate-600">
                            {formatDateTime(getBookingStartValue(booking))} to{" "}
                            {formatDateTime(getProtectedBookingEndValue(booking))}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                ) : null}
              </div>

              <div className="space-y-5">
                <div className="grid gap-4 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
                  <div className="space-y-4">
                    <div>
                      <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Day Window
                      </label>
                      <select
                        className="input-base"
                        value={availabilityForm.day_of_week}
                        onChange={(e) =>
                          setAvailabilityForm((prev) => ({ ...prev, day_of_week: e.target.value }))
                        }
                      >
                        <option value="all">All Days</option>
                        <option value="mon-fri">Mon - Fri</option>
                        <option value="mon-sat">Mon - Sat</option>
                        <option value="sat-sun">Weekend</option>
                      </select>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <label className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                          checked={availabilityForm.is_available}
                          onChange={(e) =>
                            setAvailabilityForm((prev) => ({
                              ...prev,
                              is_available: e.target.checked,
                            }))
                          }
                        />
                        <span>
                          <span className="block text-sm font-semibold text-slate-900">
                            Spot is available for bookings
                          </span>
                          <span className="mt-1 block text-sm text-slate-500">
                            Turning this off will be blocked if protected future bookings already
                            exist.
                          </span>
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Availability Start Date
                      </label>
                      <input
                        type="date"
                        className="input-base"
                        value={availabilityForm.effective_from}
                        onChange={(e) =>
                          setAvailabilityForm((prev) => ({
                            ...prev,
                            effective_from: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Availability End Date
                      </label>
                      <input
                        type="date"
                        className="input-base"
                        value={availabilityForm.effective_to}
                        onChange={(e) =>
                          setAvailabilityForm((prev) => ({
                            ...prev,
                            effective_to: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 2xl:grid-cols-2">
                  <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                          Start Time
                        </p>
                        <p className="mt-1 text-sm text-slate-500">30 minute slots</p>
                      </div>
                      <span className="rounded-full bg-brand-50 px-3 py-1 text-sm font-semibold text-brand-700">
                        {availabilityForm.start_time || "--:--"}
                      </span>
                    </div>
                    <TimeSlotButtons
                      value={availabilityForm.start_time}
                      className="max-h-64 bg-white"
                      gridClassName="md:grid-cols-4 xl:grid-cols-5"
                      onChange={(time) =>
                        setAvailabilityForm((prev) => ({
                          ...prev,
                          start_time: time,
                          end_time:
                            prev.end_time && toTimeMinutes(prev.end_time) <= toTimeMinutes(time)
                              ? ""
                              : prev.end_time,
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                          End Time
                        </p>
                        <p className="mt-1 text-sm text-slate-500">Must be after start time</p>
                      </div>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
                        {availabilityForm.end_time || "--:--"}
                      </span>
                    </div>
                    <TimeSlotButtons
                      value={availabilityForm.end_time}
                      className="max-h-64 bg-white"
                      gridClassName="md:grid-cols-4 xl:grid-cols-5"
                      onChange={(time) =>
                        setAvailabilityForm((prev) => ({ ...prev, end_time: time }))
                      }
                      disabledTimes={(time) =>
                        !availabilityForm.start_time ||
                        toTimeMinutes(time) <= toTimeMinutes(availabilityForm.start_time)
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-500">
                  {conflictingFutureBookings.length
                    ? "Adjust the draft until all protected bookings fit inside the selected window."
                    : "Changes are saved immediately after the availability check passes."}
                </p>
                <Button
                  onClick={handleUpdateAvailability}
                  disabled={
                    savingAvailability ||
                    loadingFutureBookings ||
                    conflictingFutureBookings.length > 0
                  }
                >
                  {savingAvailability ? "Updating..." : "Update Availability"}
                </Button>
              </div>
            </Card>
          </div>
        </div>

        <div className="space-y-4">
          <Card>
            <h3 className="font-display text-lg font-semibold text-slate-900">Slot & Device</h3>
            <p className="mt-1 text-sm text-slate-500">
              Slot and device control are automated by admin. Lender can only update spot details
              and availability windows.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Slot Code
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-900">
                  {spot.slots?.[0]?.slot_code || "S-01"}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Slot Status
                </p>
                <p className="mt-2 text-sm font-semibold capitalize text-slate-900">
                  {spot.slots?.[0]?.slot_status || "available"}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Device State
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-900">
                  {spot.slots?.[0]?.device_open ? "Open" : "Closed"}
                </p>
              </div>
            </div>
          </Card>

          <Card className="overflow-hidden">
            <div className="mb-3">
              <h3 className="font-display text-lg font-semibold text-slate-900">Spot Location</h3>
              <p className="mt-1 text-sm text-slate-500">
                Exact map preview for this parking spot.
              </p>
            </div>
            <ParkingMap
              spots={[spot]}
              selectedSpot={spot}
              center={[spot.latitude, spot.longitude]}
              zoom={15}
              className="h-[420px]"
            />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LenderSpotDetailsPage;
