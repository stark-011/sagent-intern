import Button from "../common/Button";
import Card from "../common/Card";
import TimeSlotButtons, { toTimeMinutes } from "../common/TimeSlotButtons";
import { vehicleTypeOptions } from "../../constants/vehicleTypes";

const SearchFilters = ({ filters, setFilters, onReset }) => {
  const update = (key, value) => setFilters((prev) => ({ ...prev, [key]: value }));
  const updateTimeRange = (key, value) => {
    setFilters((prev) => {
      const next = { ...(prev.timeRange || {}), [key]: value };
      if (next.start && next.end && toTimeMinutes(next.end) <= toTimeMinutes(next.start)) {
        if (key === "start") {
          next.end = "";
        } else {
          return prev;
        }
      }
      return { ...prev, timeRange: next };
    });
  };

  return (
    <Card>
      <h3 className="mb-4 font-display text-lg font-semibold text-slate-900">Filters</h3>
      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">
            Vehicle Type
          </label>
          <select
            className="input-base"
            value={filters.vehicleType}
            onChange={(e) => update("vehicleType", e.target.value)}
          >
            <option value="">All</option>
            {vehicleTypeOptions.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">
            Spot Type
          </label>
          <select
            className="input-base"
            value={filters.spotType}
            onChange={(e) => update("spotType", e.target.value)}
          >
            <option value="">All</option>
            <option value="covered">Covered</option>
            <option value="open">Open</option>
            <option value="multilevel">Multilevel</option>
            <option value="residential">Residential</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">
            Max Price / Hour
          </label>
          <input
            type="number"
            min="0"
            className="input-base"
            value={filters.maxPrice}
            onChange={(e) => update("maxPrice", e.target.value)}
            placeholder="Any"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">
            Min Rating
          </label>
          <select
            className="input-base"
            value={filters.minRating}
            onChange={(e) => update("minRating", e.target.value)}
          >
            <option value="">Any</option>
            <option value="3">3+</option>
            <option value="4">4+</option>
            <option value="4.5">4.5+</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">
            Max Distance (KM)
          </label>
          <input
            type="number"
            min="1"
            className="input-base"
            value={filters.maxDistance}
            onChange={(e) => update("maxDistance", e.target.value)}
            placeholder="Any"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold uppercase text-slate-500">
              Start Time
            </label>
            <button
              type="button"
              className="text-xs font-medium text-brand-600 hover:text-brand-700"
              onClick={() => update("timeRange", { start: "", end: "" })}
            >
              Clear Time
            </button>
          </div>
          <div>
            <p className="mb-1 text-xs font-medium text-slate-600">
              Selected: {filters.timeRange.start || "--:--"}
            </p>
            <TimeSlotButtons
              value={filters.timeRange.start}
              onChange={(time) => updateTimeRange("start", time)}
              className="max-h-36"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">
              End Time
            </label>
            <p className="mb-1 text-xs font-medium text-slate-600">
              Selected: {filters.timeRange.end || "--:--"}
            </p>
            <TimeSlotButtons
              value={filters.timeRange.end}
              onChange={(time) => updateTimeRange("end", time)}
              disabledTimes={(time) =>
                !filters.timeRange.start ||
                toTimeMinutes(time) <= toTimeMinutes(filters.timeRange.start)
              }
              className="max-h-36"
            />
          </div>
        </div>

        <Button variant="secondary" className="w-full" onClick={onReset}>
          Clear Filters
        </Button>
      </div>
    </Card>
  );
};

export default SearchFilters;
