import { useState } from "react";
import { toast } from "sonner";
import { vehicleTypeOptions } from "../../constants/vehicleTypes";
import Button from "../common/Button";
import Card from "../common/Card";
import TimeSlotButtons, {
  normalizeTimeValue,
  toTimeMinutes,
} from "../common/TimeSlotButtons";

const defaultValues = {
  spot_title: "",
  description: "",
  address_line: "",
  locality: "",
  city: "",
  state: "",
  pincode: "",
  latitude: "",
  longitude: "",
  vehicle_type_allowed: ["hatchback"],
  total_slots: 1,
  spot_type: "covered",
  image_url: "",
  day_of_week: "all",
  start_time: "06:00",
  end_time: "23:00",
  pricing_type: "hourly",
  base_hourly_rate: "",
  peak_hour_rate: "",
  special_day_rate: "",
  effective_from: "2026-03-01",
  effective_to: "2026-12-31",
};

const buildInitialForm = (initialValues = {}) => ({
  ...defaultValues,
  ...initialValues,
  start_time: normalizeTimeValue(initialValues.start_time, defaultValues.start_time),
  end_time: normalizeTimeValue(initialValues.end_time, defaultValues.end_time),
});

const SpotForm = ({ initialValues, onSubmit, submitLabel = "Save Spot", loading = false }) => {
  const [form, setForm] = useState(() => buildInitialForm(initialValues));

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const toggleVehicleType = (type) => {
    setForm((prev) => {
      const exists = prev.vehicle_type_allowed.includes(type);
      const next = exists
        ? prev.vehicle_type_allowed.filter((item) => item !== type)
        : [...prev.vehicle_type_allowed, type];
      return { ...prev, vehicle_type_allowed: next.length ? next : [type] };
    });
  };

  const validate = () => {
    const requiredFields = [
      "spot_title",
      "description",
      "address_line",
      "locality",
      "city",
      "state",
      "pincode",
      "latitude",
      "longitude",
    ];
    for (const field of requiredFields) {
      if (!String(form[field]).trim()) {
        toast.error(`Please fill ${field.replace(/_/g, " ")}.`);
        return false;
      }
    }
    const latitude = Number(form.latitude);
    const longitude = Number(form.longitude);
    if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
      toast.error("Latitude must be a valid number between -90 and 90.");
      return false;
    }
    if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
      toast.error("Longitude must be a valid number between -180 and 180.");
      return false;
    }
    if (!Array.isArray(form.vehicle_type_allowed) || form.vehicle_type_allowed.length === 0) {
      toast.error("Please select at least one vehicle type.");
      return false;
    }
    if (!form.start_time || !form.end_time) {
      toast.error("Select both start and end time.");
      return false;
    }
    if (toTimeMinutes(form.end_time) <= toTimeMinutes(form.start_time)) {
      toast.error("End time must be after start time.");
      return false;
    }
    if (form.effective_from && form.effective_to && form.effective_from > form.effective_to) {
      toast.error("Effective from date must be before effective to date.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(form);
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <Card>
        <h3 className="font-display text-lg font-semibold text-slate-900">Basic Info</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <input
            className="input-base md:col-span-2"
            placeholder="Spot title"
            value={form.spot_title}
            onChange={(e) => update("spot_title", e.target.value)}
          />
          <textarea
            className="input-base md:col-span-2"
            rows={3}
            placeholder="Description"
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
          />
          <select
            className="input-base"
            value={form.spot_type}
            onChange={(e) => update("spot_type", e.target.value)}
          >
            <option value="covered">Covered</option>
            <option value="open">Open</option>
            <option value="multilevel">Multilevel</option>
            <option value="residential">Residential</option>
          </select>
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
            Single-slot mode: one slot, one car at a time.
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="font-display text-lg font-semibold text-slate-900">Address & Coordinates</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <input
            className="input-base md:col-span-2"
            placeholder="Address line"
            value={form.address_line}
            onChange={(e) => update("address_line", e.target.value)}
          />
          <input
            className="input-base"
            placeholder="Locality"
            value={form.locality}
            onChange={(e) => update("locality", e.target.value)}
          />
          <input
            className="input-base"
            placeholder="City"
            value={form.city}
            onChange={(e) => update("city", e.target.value)}
          />
          <input
            className="input-base"
            placeholder="State"
            value={form.state}
            onChange={(e) => update("state", e.target.value)}
          />
          <input
            className="input-base"
            placeholder="Pincode"
            value={form.pincode}
            onChange={(e) => update("pincode", e.target.value)}
          />
          <input
            className="input-base"
            placeholder="Latitude"
            value={form.latitude}
            onChange={(e) => update("latitude", e.target.value)}
          />
          <input
            className="input-base"
            placeholder="Longitude"
            value={form.longitude}
            onChange={(e) => update("longitude", e.target.value)}
          />
        </div>
      </Card>

      <Card>
        <h3 className="font-display text-lg font-semibold text-slate-900">Vehicle, Availability & Images</h3>
        <div className="mt-3 space-y-3">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase text-slate-500">Vehicle Type Allowed</p>
            <div className="flex flex-wrap gap-2">
              {vehicleTypeOptions.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => toggleVehicleType(type.value)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    form.vehicle_type_allowed.includes(type.value)
                      ? "bg-brand-100 text-brand-700"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>
          <input
            className="input-base"
            placeholder="Image URL"
            value={form.image_url}
            onChange={(e) => update("image_url", e.target.value)}
          />
          <div className="grid gap-3 md:grid-cols-3">
            <select
              className="input-base"
              value={form.day_of_week}
              onChange={(e) => update("day_of_week", e.target.value)}
            >
              <option value="all">All Days</option>
              <option value="mon-fri">Mon - Fri</option>
              <option value="mon-sat">Mon - Sat</option>
              <option value="sat-sun">Weekend</option>
            </select>
            <div className="md:col-span-2">
              <p className="mb-2 text-xs font-semibold uppercase text-slate-500">
                Select Time Window (30 mins)
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                <div>
                  <p className="mb-1 text-xs font-medium text-slate-600">
                    Start: {form.start_time || "--:--"}
                  </p>
                  <TimeSlotButtons
                    value={form.start_time}
                    onChange={(time) =>
                      setForm((prev) => ({
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
                <div>
                  <p className="mb-1 text-xs font-medium text-slate-600">
                    End: {form.end_time || "--:--"}
                  </p>
                  <TimeSlotButtons
                    value={form.end_time}
                    onChange={(time) => update("end_time", time)}
                    disabledTimes={(time) =>
                      !form.start_time || toTimeMinutes(time) <= toTimeMinutes(form.start_time)
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="font-display text-lg font-semibold text-slate-900">
          Suggested Pricing (Optional)
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Lender can suggest a price. Final price is set by admin during approval.
        </p>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <select
            className="input-base"
            value={form.pricing_type}
            onChange={(e) => update("pricing_type", e.target.value)}
          >
            <option value="hourly">Hourly</option>
          </select>
          <input
            type="number"
            className="input-base"
            min={0}
            placeholder="Suggested base hourly rate"
            value={form.base_hourly_rate}
            onChange={(e) => update("base_hourly_rate", e.target.value)}
          />
          <input
            type="number"
            className="input-base"
            min={0}
            placeholder="Suggested peak hour rate"
            value={form.peak_hour_rate}
            onChange={(e) => update("peak_hour_rate", e.target.value)}
          />
          <input
            type="number"
            className="input-base"
            min={0}
            placeholder="Suggested special day rate"
            value={form.special_day_rate}
            onChange={(e) => update("special_day_rate", e.target.value)}
          />
          <input
            type="date"
            className="input-base"
            value={form.effective_from}
            onChange={(e) => update("effective_from", e.target.value)}
          />
          <input
            type="date"
            className="input-base"
            value={form.effective_to}
            onChange={(e) => update("effective_to", e.target.value)}
          />
        </div>
      </Card>

      <Button type="submit" disabled={loading}>
        {loading ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
};

export default SpotForm;
