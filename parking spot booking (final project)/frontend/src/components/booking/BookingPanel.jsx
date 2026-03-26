import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { parkingService } from "../../services/parkingService";
import { estimateBookingAmount } from "../../utils/calculations";
import { formatCurrency } from "../../utils/format";
import { validateRequired } from "../../utils/validation";
import Button from "../common/Button";
import Card from "../common/Card";
import TimeSlotButtons, {
  normalizeTimeValue,
  toTimeMinutes,
} from "../common/TimeSlotButtons";

const getTodayDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const combineDateTime = (dateValue, timeValue) =>
  dateValue && timeValue ? `${dateValue}T${timeValue}` : "";

const getTimeFromDateTime = (value) => {
  if (!value || !value.includes("T")) return "";
  return value.split("T")[1].slice(0, 5);
};

const getTimeMinutesFromDateTime = (value) => {
  if (!value) return NaN;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return NaN;
  return parsed.getHours() * 60 + parsed.getMinutes();
};

const resolveWindowBlockedEnd = (window) =>
  window?.blocked_until_time || window?.blockedUntilTime || window?.buffer_end_time || window?.bufferEndTime || window?.booked_end_time || window?.bookedEndTime;

const buildBookedRanges = (bookingDate, windows = []) => {
  if (!bookingDate) return [];
  const dayStart = new Date(`${bookingDate}T00:00:00`);
  const dayEnd = new Date(`${bookingDate}T23:59:59`);
  if (Number.isNaN(dayStart.getTime()) || Number.isNaN(dayEnd.getTime())) return [];

  const ranges = windows
    .map((window) => {
      const startRaw = new Date(window.booked_start_time);
      const endRaw = new Date(resolveWindowBlockedEnd(window));
      if (Number.isNaN(startRaw.getTime()) || Number.isNaN(endRaw.getTime())) return null;

      const start = startRaw < dayStart ? dayStart : startRaw;
      const end = endRaw > dayEnd ? dayEnd : endRaw;
      if (end <= start) return null;

      const startMinute = start.getHours() * 60 + start.getMinutes();
      const endMinuteBase = end.getHours() * 60 + end.getMinutes();
      const hasTrailingSeconds = end.getSeconds() > 0 || end.getMilliseconds() > 0;
      const endMinute = Math.min(24 * 60, endMinuteBase + (hasTrailingSeconds ? 1 : 0));
      if (endMinute <= startMinute) return null;

      return { startMinute, endMinute };
    })
    .filter(Boolean)
    .sort((a, b) => a.startMinute - b.startMinute);

  const merged = [];
  ranges.forEach((range) => {
    const last = merged[merged.length - 1];
    if (!last || range.startMinute > last.endMinute) {
      merged.push({ ...range });
    } else {
      last.endMinute = Math.max(last.endMinute, range.endMinute);
    }
  });
  return merged;
};

const isTimeBookedInRanges = (ranges, minute) =>
  ranges.some((range) => minute >= range.startMinute && minute < range.endMinute);

const isRangeOverlappingInRanges = (ranges, startMinute, endMinute) =>
  ranges.some((range) => startMinute < range.endMinute && endMinute > range.startMinute);

const BookingPanel = ({
  spot,
  vehicles = [],
  wallet,
  isLoggedIn,
  onReserve,
  onBookNow,
  onBookingConflict,
  loading = false,
}) => {
  const availabilityStart = normalizeTimeValue(spot?.availability?.[0]?.start_time, "00:00");
  const availabilityEnd = normalizeTimeValue(spot?.availability?.[0]?.end_time, "23:30");
  const [form, setForm] = useState({
    vehicle_id: vehicles.find((item) => item.is_default)?.vehicle_id || vehicles[0]?.vehicle_id || "",
    booking_date: getTodayDate(),
    booked_start_time: "",
    booked_end_time: "",
  });
  const [bookedWindows, setBookedWindows] = useState([]);
  const [loadingBookedWindows, setLoadingBookedWindows] = useState(false);
  const selectedStartTime = getTimeFromDateTime(form.booked_start_time);
  const selectedEndTime = getTimeFromDateTime(form.booked_end_time);

  const bookedRanges = useMemo(
    () => buildBookedRanges(form.booking_date, bookedWindows),
    [bookedWindows, form.booking_date]
  );

  const isStartTimeBooked = (time) => {
    const minute = toTimeMinutes(time);
    return isTimeBookedInRanges(bookedRanges, minute);
  };

  const isRangeOverlappingBooked = (startMinute, endMinute) =>
    isRangeOverlappingInRanges(bookedRanges, startMinute, endMinute);

  useEffect(() => {
    let ignore = false;

    if (!spot?.spot_id || !form.booking_date) {
      setBookedWindows([]);
      return () => {
        ignore = true;
      };
    }

    setLoadingBookedWindows(true);
    parkingService
      .getSpotBookedWindows(spot.spot_id, form.booking_date)
      .then((windows) => {
        if (!ignore) setBookedWindows(Array.isArray(windows) ? windows : []);
      })
      .catch(() => {
        if (!ignore) setBookedWindows([]);
      })
      .finally(() => {
        if (!ignore) setLoadingBookedWindows(false);
      });

    return () => {
      ignore = true;
    };
  }, [spot?.spot_id, form.booking_date]);

  useEffect(() => {
    setForm((prev) => {
      const startTime = getTimeFromDateTime(prev.booked_start_time);
      const endTime = getTimeFromDateTime(prev.booked_end_time);
      if (!startTime && !endTime) return prev;

      const startMinute = toTimeMinutes(startTime);
      const endMinute = toTimeMinutes(endTime);
      const startInvalid = startTime && isStartTimeBooked(startTime);
      const endInvalid =
        startTime &&
        endTime &&
        isRangeOverlappingBooked(startMinute, endMinute);

      if (!startInvalid && !endInvalid) return prev;

      return {
        ...prev,
        booked_start_time: startInvalid ? "" : prev.booked_start_time,
        booked_end_time: "",
      };
    });
  }, [bookedRanges]);

  const estimate = useMemo(
    () =>
      estimateBookingAmount(
        form.booked_start_time,
        form.booked_end_time,
        spot?.price_per_hour || 0
      ),
    [form.booked_start_time, form.booked_end_time, spot?.price_per_hour]
  );

  const handleAction = async (action) => {
    if (!isLoggedIn) return;
    if (loadingBookedWindows) {
      toast.error("Checking latest slot availability. Please wait a moment.");
      return;
    }
    if (
      !validateRequired(form.vehicle_id) ||
      !validateRequired(form.booking_date) ||
      !validateRequired(form.booked_start_time) ||
      !validateRequired(form.booked_end_time)
    ) {
      toast.error("Select vehicle, date, start time, and end time.");
      return;
    }
    if (new Date(form.booked_end_time).getTime() <= new Date(form.booked_start_time).getTime()) {
      toast.error("End time must be after start time.");
      return;
    }

    let latestRanges = bookedRanges;
    if (spot?.spot_id && form.booking_date) {
      try {
        const latestWindows = await parkingService.getSpotBookedWindows(spot.spot_id, form.booking_date);
        const safeWindows = Array.isArray(latestWindows) ? latestWindows : [];
        setBookedWindows(safeWindows);
        latestRanges = buildBookedRanges(form.booking_date, safeWindows);
      } catch {
        latestRanges = bookedRanges;
      }
    }

    const startMinute = getTimeMinutesFromDateTime(form.booked_start_time);
    const endMinute = getTimeMinutesFromDateTime(form.booked_end_time);
    if (isRangeOverlappingInRanges(latestRanges, startMinute, endMinute)) {
      const conflictMessage = "Slot already booked for the selected time range or its safety buffer.";
      toast.error(conflictMessage);
      await onBookingConflict?.(
        {
          vehicle_id: form.vehicle_id,
          booked_start_time: form.booked_start_time,
          booked_end_time: form.booked_end_time,
        },
        conflictMessage
      );
      return;
    }
    const payload = {
      vehicle_id: form.vehicle_id,
      booked_start_time: form.booked_start_time,
      booked_end_time: form.booked_end_time,
    };
    if (action === "reserve") {
      await onReserve?.(payload);
    } else {
      await onBookNow?.(payload);
    }
  };

  return (
    <Card className="space-y-4">
      <h3 className="font-display text-lg font-semibold text-slate-900">Book This Spot</h3>
      {!isLoggedIn ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-center">
          <p className="text-sm text-slate-600">Login to continue booking this parking spot.</p>
          <Link to="/login">
            <Button className="mt-3 w-full">Login to Book</Button>
          </Link>
        </div>
      ) : (
        <>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">
              Select Vehicle
            </label>
            <select
              className="input-base"
              value={form.vehicle_id}
              onChange={(e) => setForm((prev) => ({ ...prev, vehicle_id: e.target.value }))}
            >
              <option value="">Choose vehicle</option>
              {vehicles.map((vehicle) => (
                <option key={vehicle.vehicle_id} value={vehicle.vehicle_id}>
                  {vehicle.vehicle_name} ({vehicle.vehicle_number})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">
              Booking Date
            </label>
            <input
              type="date"
              min={getTodayDate()}
              className="input-base"
              value={form.booking_date}
              onChange={(e) =>
                setForm((prev) => {
                  const bookingDate = e.target.value;
                  const startTime = getTimeFromDateTime(prev.booked_start_time);
                  const endTime = getTimeFromDateTime(prev.booked_end_time);
                  return {
                    ...prev,
                    booking_date: bookingDate,
                    booked_start_time: combineDateTime(bookingDate, startTime),
                    booked_end_time: combineDateTime(bookingDate, endTime),
                  };
                })
              }
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">
              Start Time (30 mins)
            </label>
            <p className="mb-1 text-xs font-medium text-slate-600">
              Selected: {selectedStartTime || "--:--"}
            </p>
            <TimeSlotButtons
              value={selectedStartTime}
              start={availabilityStart}
              end={availabilityEnd}
              className="max-h-36"
              disabledTimes={(time) =>
                loadingBookedWindows ||
                toTimeMinutes(time) >= toTimeMinutes(availabilityEnd) ||
                isStartTimeBooked(time)
              }
              onChange={(time) =>
                setForm((prev) => ({
                  ...prev,
                  booked_start_time: combineDateTime(prev.booking_date, time),
                  booked_end_time:
                    selectedEndTime &&
                    (toTimeMinutes(selectedEndTime) <= toTimeMinutes(time) ||
                      isRangeOverlappingBooked(toTimeMinutes(time), toTimeMinutes(selectedEndTime)))
                      ? ""
                      : prev.booked_end_time,
                }))
              }
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">
              End Time (30 mins)
            </label>
            <p className="mb-1 text-xs font-medium text-slate-600">
              Selected: {selectedEndTime || "--:--"}
            </p>
            <TimeSlotButtons
              value={selectedEndTime}
              start={availabilityStart}
              end={availabilityEnd}
              className="max-h-36"
              disabledTimes={(time) =>
                loadingBookedWindows ||
                !selectedStartTime ||
                toTimeMinutes(time) <= toTimeMinutes(selectedStartTime) ||
                isRangeOverlappingBooked(toTimeMinutes(selectedStartTime), toTimeMinutes(time))
              }
              onChange={(time) =>
                setForm((prev) => ({
                  ...prev,
                  booked_end_time: combineDateTime(prev.booking_date, time),
                }))
              }
            />
          </div>

          {bookedRanges.length > 0 ? (
            <p className="text-xs font-medium text-rose-600">
              Booked slots and the 1 hour safety buffer are disabled for the selected date.
            </p>
          ) : null}

          <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700">
            Slot reserved with safety buffer. Each booking keeps the slot protected for 1 hour
            after the booked end time, and device access is granted automatically once the booking
            is confirmed.
          </div>

          <div className="rounded-xl bg-slate-50 p-3 text-sm">
            <p className="text-slate-600">Estimated Amount</p>
            <p className="font-semibold text-slate-900">
              {formatCurrency(estimate.amount)} ({estimate.hours} hour(s))
            </p>
            <p className="mt-1 text-slate-500">
              Wallet Balance: {formatCurrency(wallet?.credit_balance || 0)}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button variant="secondary" onClick={() => handleAction("reserve")} disabled={loading}>
              Reserve Now
            </Button>
            <Button onClick={() => handleAction("book")} disabled={loading}>
              Book Now
            </Button>
          </div>
        </>
      )}
    </Card>
  );
};

export default BookingPanel;
