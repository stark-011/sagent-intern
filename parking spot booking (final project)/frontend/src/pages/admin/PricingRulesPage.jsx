import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import DataTable from "../../components/common/DataTable";
import PageHeader from "../../components/common/PageHeader";
import { adminService } from "../../services/adminService";
import { parkingService } from "../../services/parkingService";
import { formatCurrency, formatDate } from "../../utils/format";

const getTodayDate = () => new Date().toISOString().slice(0, 10);

const getFutureDate = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
};

const buildDefaultForm = () => ({
  spot_id: "",
  pricing_type: "hourly",
  base_hourly_rate: 80,
  peak_hour_rate: 110,
  peak_start_time: "18:00",
  peak_end_time: "22:00",
  enable_special_day: false,
  special_day_rate: "",
  special_day_date: "",
  effective_from: getTodayDate(),
  effective_to: getFutureDate(365),
});

const toMinutes = (value) => {
  if (!value) return -1;
  const [hour, minute] = String(value).split(":").map((part) => Number(part));
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return -1;
  return hour * 60 + minute;
};

const shortTime = (value) => (value ? String(value).slice(0, 5) : "");

const PricingRulesPage = () => {
  const [rules, setRules] = useState([]);
  const [spots, setSpots] = useState([]);
  const [form, setForm] = useState(buildDefaultForm());
  const [spotSearch, setSpotSearch] = useState("");

  const filteredSpots = useMemo(() => {
    const query = spotSearch.trim().toLowerCase();
    if (!query) return spots;

    return spots.filter((spot) =>
      [spot.spot_title, spot.locality, spot.city]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query))
    );
  }, [spots, spotSearch]);

  const selectedSpot = useMemo(
    () => spots.find((spot) => spot.spot_id === form.spot_id) || null,
    [spots, form.spot_id]
  );

  const visibleSpots = useMemo(() => {
    if (!selectedSpot) return filteredSpots;
    if (filteredSpots.some((spot) => spot.spot_id === selectedSpot.spot_id)) {
      return filteredSpots;
    }
    return [selectedSpot, ...filteredSpots];
  }, [filteredSpots, selectedSpot]);

  const load = async () => {
    const [ruleRes, spotRes] = await Promise.all([
      adminService.getPricingRules(),
      parkingService.getAllSpots(),
    ]);
    setRules(ruleRes);
    setSpots(spotRes);
  };

  useEffect(() => {
    load();
  }, []);

  const createRule = async (e) => {
    e.preventDefault();
    if (form.effective_from > form.effective_to) {
      toast.error("Effective from date must be before effective to date.");
      return;
    }

    if ((form.peak_start_time && !form.peak_end_time) || (!form.peak_start_time && form.peak_end_time)) {
      toast.error("Provide both peak start and peak end time.");
      return;
    }

    if (
      form.peak_start_time &&
      form.peak_end_time &&
      toMinutes(form.peak_end_time) <= toMinutes(form.peak_start_time)
    ) {
      toast.error("Peak end time must be after peak start time.");
      return;
    }

    if (form.enable_special_day) {
      if (!form.special_day_date) {
        toast.error("Select a special day date.");
        return;
      }
      if (Number(form.special_day_rate || 0) <= 0) {
        toast.error("Enter a valid special day rate.");
        return;
      }
    }

    const payload = {
      ...form,
      special_day_rate: form.enable_special_day ? form.special_day_rate : "",
      special_day_date: form.enable_special_day ? form.special_day_date : "",
    };

    try {
      await adminService.createPricingRule(payload);
      toast.success("Pricing rule created.");
      setForm(buildDefaultForm());
      setSpotSearch("");
      load();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const toggleRule = async (ruleId) => {
    await adminService.togglePricingRule(ruleId);
    toast.success("Rule status updated.");
    load();
  };

  const columns = [
    { key: "spot", header: "Spot", render: (row) => row.spot?.spot_title || "-" },
    {
      key: "suggested_base",
      header: "Lender Suggested",
      render: (row) =>
        formatCurrency(row.suggested_base_hourly_rate ?? row.base_hourly_rate ?? 0),
    },
    { key: "base", header: "Admin Final Base", render: (row) => formatCurrency(row.base_hourly_rate) },
    { key: "peak", header: "Peak", render: (row) => formatCurrency(row.peak_hour_rate) },
    {
      key: "peak_window",
      header: "Peak Window",
      render: (row) =>
        row.peak_start_time && row.peak_end_time
          ? `${shortTime(row.peak_start_time)} - ${shortTime(row.peak_end_time)}`
          : "-",
    },
    {
      key: "special",
      header: "Special Day",
      render: (row) =>
        row.special_day_date
          ? `${formatDate(row.special_day_date)} (${formatCurrency(row.special_day_rate)})`
          : Number(row.special_day_rate || 0) > 0
            ? formatCurrency(row.special_day_rate)
            : "-",
    },
    { key: "effective", header: "Effective", render: (row) => `${formatDate(row.effective_from)} - ${formatDate(row.effective_to)}` },
    { key: "status", header: "Status", render: (row) => <Badge status={row.rule_status} /> },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <Button size="sm" variant="secondary" onClick={() => toggleRule(row.pricing_rule_id)}>
          Toggle Status
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Pricing Rules"
        subtitle="Admin-managed pricing. Lender suggestions are visible for reference."
      />
      <Card>
        <h3 className="font-display text-lg font-semibold text-slate-900">Create Pricing Rule</h3>
        <form className="mt-3 grid gap-3 md:grid-cols-3" onSubmit={createRule}>
          <div className="md:col-span-3">
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Select Spot
            </label>
            <div className="space-y-2">
              <input
                className="input-base"
                value={spotSearch}
                onChange={(e) => setSpotSearch(e.target.value)}
                placeholder="Search spot by title, city, or locality"
              />
              <select
                className="input-base"
                value={form.spot_id}
                onChange={(e) => setForm((prev) => ({ ...prev, spot_id: e.target.value }))}
                required
              >
                <option value="">
                  {visibleSpots.length ? "Select spot" : "No matching parking spots"}
                </option>
                {visibleSpots.map((spot) => (
                  <option key={spot.spot_id} value={spot.spot_id}>
                    {[spot.spot_title, spot.locality, spot.city].filter(Boolean).join(" - ")}
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-500">
                {visibleSpots.length} parking spot{visibleSpots.length === 1 ? "" : "s"} shown
              </p>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Base Hourly Rate
            </label>
            <input
              type="number"
              className="input-base"
              value={form.base_hourly_rate}
              placeholder="Base hourly rate"
              onChange={(e) => setForm((prev) => ({ ...prev, base_hourly_rate: e.target.value }))}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Peak Hourly Rate
            </label>
            <input
              type="number"
              className="input-base"
              value={form.peak_hour_rate}
              placeholder="Peak hourly rate"
              onChange={(e) => setForm((prev) => ({ ...prev, peak_hour_rate: e.target.value }))}
            />
          </div>
          <div className="grid gap-2 sm:grid-cols-2 md:col-span-3">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Peak Start Time
              </label>
              <input
                type="time"
                className="input-base"
                value={form.peak_start_time}
                onChange={(e) => setForm((prev) => ({ ...prev, peak_start_time: e.target.value }))}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Peak End Time
              </label>
              <input
                type="time"
                className="input-base"
                value={form.peak_end_time}
                onChange={(e) => setForm((prev) => ({ ...prev, peak_end_time: e.target.value }))}
              />
            </div>
          </div>
          <label className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 md:col-span-3">
            <input
              type="checkbox"
              checked={form.enable_special_day}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  enable_special_day: e.target.checked,
                  special_day_rate: e.target.checked ? prev.special_day_rate : "",
                  special_day_date: e.target.checked ? prev.special_day_date : "",
                }))
              }
            />
            Enable special day pricing
          </label>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Special Day Rate
            </label>
            <input
              type="number"
              className="input-base"
              value={form.special_day_rate}
              placeholder="Special day rate"
              onChange={(e) => setForm((prev) => ({ ...prev, special_day_rate: e.target.value }))}
              disabled={!form.enable_special_day}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Special Day Date
            </label>
            <input
              type="date"
              className="input-base"
              value={form.special_day_date}
              onChange={(e) => setForm((prev) => ({ ...prev, special_day_date: e.target.value }))}
              disabled={!form.enable_special_day}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Effective From
            </label>
            <input
              type="date"
              className="input-base"
              value={form.effective_from}
              onChange={(e) => setForm((prev) => ({ ...prev, effective_from: e.target.value }))}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Effective To
            </label>
            <input
              type="date"
              className="input-base"
              value={form.effective_to}
              onChange={(e) => setForm((prev) => ({ ...prev, effective_to: e.target.value }))}
            />
          </div>
          <div className="md:col-span-3">
            <Button type="submit">Create Rule</Button>
          </div>
        </form>
      </Card>
      <DataTable columns={columns} rows={rules.map((item) => ({ ...item, id: item.pricing_rule_id }))} />
    </div>
  );
};

export default PricingRulesPage;
