import { useMemo } from "react";

export const toTimeMinutes = (value) => {
  if (!value || !value.includes(":")) return NaN;
  const [hourPart, minutePart] = value.split(":");
  const hours = Number.parseInt(hourPart, 10);
  const minutes = Number.parseInt(minutePart, 10);
  if (!Number.isInteger(hours) || !Number.isInteger(minutes)) return NaN;
  return hours * 60 + minutes;
};

const toTimeString = (minutes) => {
  const hrs = Math.floor(minutes / 60)
    .toString()
    .padStart(2, "0");
  const mins = (minutes % 60).toString().padStart(2, "0");
  return `${hrs}:${mins}`;
};

const formatLabel = (value) => {
  const total = toTimeMinutes(value);
  if (Number.isNaN(total)) return value;
  const hours24 = Math.floor(total / 60);
  const mins = total % 60;
  const period = hours24 >= 12 ? "PM" : "AM";
  const hours12 = hours24 % 12 || 12;
  return `${hours12}:${mins.toString().padStart(2, "0")} ${period}`;
};

export const normalizeTimeValue = (value, fallback = "00:00") => {
  if (!value) return fallback;
  const text = String(value).trim();
  if (text.length >= 5 && text.includes(":")) {
    return text.slice(0, 5);
  }
  return fallback;
};

const generateSlots = (start, end, intervalMinutes) => {
  const from = toTimeMinutes(normalizeTimeValue(start, "00:00"));
  const to = toTimeMinutes(normalizeTimeValue(end, "23:30"));
  if (Number.isNaN(from) || Number.isNaN(to) || intervalMinutes <= 0) return [];

  const [minValue, maxValue] = from <= to ? [from, to] : [to, from];
  const slots = [];
  for (let cursor = minValue; cursor <= maxValue; cursor += intervalMinutes) {
    slots.push(toTimeString(cursor));
  }
  if (slots.length === 0 || slots[slots.length - 1] !== toTimeString(maxValue)) {
    slots.push(toTimeString(maxValue));
  }
  return slots;
};

const TimeSlotButtons = ({
  value = "",
  onChange,
  start = "00:00",
  end = "23:30",
  intervalMinutes = 30,
  disabledTimes,
  className = "",
  gridClassName = "",
  buttonClassName = "",
}) => {
  const slots = useMemo(
    () => generateSlots(start, end, intervalMinutes),
    [start, end, intervalMinutes]
  );

  return (
    <div
      className={`max-h-44 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50/90 p-2.5 ${className}`}
    >
      <div className={`grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4 ${gridClassName}`}>
        {slots.map((slot) => {
          const active = slot === value;
          const disabled = Boolean(disabledTimes?.(slot));
          return (
            <button
              key={slot}
              type="button"
              disabled={disabled}
              onClick={() => onChange?.(slot)}
              className={`rounded-lg px-2 py-1.5 text-xs font-medium transition ${
                active
                  ? "border border-brand-200 bg-brand-50 text-brand-700 shadow-sm"
                  : "border border-slate-200 bg-white text-slate-700 hover:border-brand-200 hover:bg-brand-50/70 hover:text-brand-700"
              } ${
                disabled
                  ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400 opacity-70 hover:border-slate-200 hover:bg-slate-100 hover:text-slate-400"
                  : ""
              } min-h-[42px] rounded-xl px-2.5 py-2 text-[11px] font-semibold leading-tight ${buttonClassName}`}
            >
              {formatLabel(slot)}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TimeSlotButtons;
