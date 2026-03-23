import { useEffect, useState } from "react";
import { toast } from "sonner";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import DataTable from "../../components/common/DataTable";
import PageHeader from "../../components/common/PageHeader";
import { adminService } from "../../services/adminService";
import { formatCurrency } from "../../utils/format";

const AdminAllSpotsPage = () => {
  const [filters, setFilters] = useState({ city: "", status: "", approval_status: "" });
  const [spots, setSpots] = useState([]);
  const [statusDrafts, setStatusDrafts] = useState({});
  const [updatingSpotId, setUpdatingSpotId] = useState("");
  const [updatingDeviceSpotId, setUpdatingDeviceSpotId] = useState("");

  const load = async () => {
    const data = await adminService.getAllSpots(filters);
    setSpots(data);
    setStatusDrafts(
      Object.fromEntries(data.map((item) => [item.spot_id, item.spot_status || "inactive"]))
    );
  };

  useEffect(() => {
    load();
  }, [filters.city, filters.status, filters.approval_status]);

  const handleUpdateSpotStatus = async (row) => {
    const nextStatus = statusDrafts[row.spot_id] || row.spot_status;
    if (!nextStatus) return;
    if (nextStatus === row.spot_status) {
      toast.info("Spot status is already set.");
      return;
    }

    try {
      setUpdatingSpotId(row.spot_id);
      await adminService.updateSpotStatus(row.spot_id, nextStatus);
      toast.success("Spot status updated.");
      await load();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setUpdatingSpotId("");
    }
  };

  const handleToggleDevice = async (row) => {
    const deviceOpen = Boolean(row.slots?.[0]?.device_open);

    try {
      setUpdatingDeviceSpotId(row.spot_id);
      await adminService.updateSpotDevice(row.spot_id, !deviceOpen);
      toast.success(`Spot device ${deviceOpen ? "closed" : "opened"}.`);
      await load();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setUpdatingDeviceSpotId("");
    }
  };

  const columns = [
    { key: "spot_title", header: "Spot" },
    { key: "lender", header: "Lender", render: (row) => row.lender?.full_name || "-" },
    { key: "city", header: "City" },
    { key: "price", header: "Base Price", render: (row) => formatCurrency(row.pricing?.base_hourly_rate || 0) },
    { key: "status", header: "Spot Status", render: (row) => <Badge status={row.spot_status} /> },
    { key: "approval", header: "Approval", render: (row) => <Badge status={row.approval?.approval_status || "pending"} /> },
    {
      key: "device",
      header: "Device",
      render: (row) => {
        const deviceOpen = Boolean(row.slots?.[0]?.device_open);
        return (
          <div className="space-y-1">
            <Badge
              status={deviceOpen ? "active" : "inactive"}
              label={deviceOpen ? "Open" : "Closed"}
            />
            <p className="text-xs text-slate-500">
              {row.slots?.[0]?.slot_code || "Primary device"}
            </p>
          </div>
        );
      },
    },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <div className="flex min-w-[220px] flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <select
              className="input-base min-w-[140px]"
              value={statusDrafts[row.spot_id] || row.spot_status || "inactive"}
              onChange={(e) =>
                setStatusDrafts((prev) => ({ ...prev, [row.spot_id]: e.target.value }))
              }
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="blocked">Blocked</option>
            </select>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleUpdateSpotStatus(row)}
              disabled={updatingSpotId === row.spot_id}
            >
              {updatingSpotId === row.spot_id ? "Saving..." : "Update Status"}
            </Button>
          </div>
          <Button
            size="sm"
            variant={row.slots?.[0]?.device_open ? "secondary" : "primary"}
            onClick={() => handleToggleDevice(row)}
            disabled={updatingDeviceSpotId === row.spot_id}
          >
            {updatingDeviceSpotId === row.spot_id
              ? "Saving..."
              : row.slots?.[0]?.device_open
                ? "Close Device"
                : "Open Device"}
          </Button>
          <p className="text-xs leading-5 text-slate-500">
            Admin controls the spot device here. Drivers receive device access automatically
            after booking confirmation.
          </p>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader title="All Spots" subtitle="Master spot list with city, status, and approval filters." />
      <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-3">
        <input
          className="input-base"
          placeholder="Filter by city"
          value={filters.city}
          onChange={(e) => setFilters((prev) => ({ ...prev, city: e.target.value }))}
        />
        <select
          className="input-base"
          value={filters.status}
          onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
        >
          <option value="">All Spot Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <select
          className="input-base"
          value={filters.approval_status}
          onChange={(e) => setFilters((prev) => ({ ...prev, approval_status: e.target.value }))}
        >
          <option value="">All Approvals</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>
      <DataTable columns={columns} rows={spots.map((item) => ({ ...item, id: item.spot_id }))} />
    </div>
  );
};

export default AdminAllSpotsPage;
