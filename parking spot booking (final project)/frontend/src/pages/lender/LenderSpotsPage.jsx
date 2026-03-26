import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import DataTable from "../../components/common/DataTable";
import PageHeader from "../../components/common/PageHeader";
import { formatVehicleTypes } from "../../constants/vehicleTypes";
import { useAuth } from "../../hooks/useAuth";
import { lenderService } from "../../services/lenderService";
import { parkingService } from "../../services/parkingService";
import { formatCurrency } from "../../utils/format";

const LenderSpotsPage = () => {
  const { user } = useAuth();
  const [spots, setSpots] = useState([]);
  const [deletingSpotId, setDeletingSpotId] = useState("");
  const [expandedSpotId, setExpandedSpotId] = useState("");

  const loadSpots = async () => {
    if (!user) return;
    try {
      const rows = await lenderService.getSpots(user.user_id);
      setSpots(rows);
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    loadSpots();
  }, [user]);

  const handleDeleteSpot = async (row) => {
    const confirmed = window.confirm(
      `Delete parking spot "${row.spot_title}"? This will remove spot data from database.`
    );
    if (!confirmed) return;

    try {
      setDeletingSpotId(row.spot_id);
      await parkingService.deleteSpot(row.spot_id);
      toast.success("Parking spot deleted.");
      await loadSpots();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setDeletingSpotId("");
    }
  };

  const getRejectionReason = (row) =>
    row.approval_details?.rejection_reason || row.approval?.rejection_reason || "";

  const toggleSpotActions = (spotId) => {
    setExpandedSpotId((current) => (current === spotId ? "" : spotId));
  };

  const renderSpotActions = (row) => (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
        Spot Actions
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        <Link to={`/lender/spots/${row.spot_id}`}>
          <Button size="sm" variant="secondary" className="w-full">
            View
          </Button>
        </Link>
        <Link to={`/lender/spots/${row.spot_id}/edit`}>
          <Button size="sm" variant="secondary" className="w-full">
            Edit
          </Button>
        </Link>
        <Link to={`/lender/spots/${row.spot_id}?section=availability`}>
          <Button size="sm" variant="secondary" className="w-full">
            Availability
          </Button>
        </Link>
        <Link to={`/lender/bookings?status=upcoming&spotId=${encodeURIComponent(row.spot_id)}`}>
          <Button size="sm" variant="secondary" className="w-full">
            Upcoming
          </Button>
        </Link>
        <Button
          size="sm"
          variant="danger"
          className="w-full"
          onClick={() => handleDeleteSpot(row)}
          disabled={deletingSpotId === row.spot_id}
        >
          {deletingSpotId === row.spot_id ? "Deleting..." : "Delete Spot"}
        </Button>
      </div>
    </div>
  );

  const columns = [
    {
      key: "spot_title",
      header: "Spot Title",
      render: (row) => {
        const isExpanded = expandedSpotId === row.spot_id;

        return (
          <div className="min-w-[220px] space-y-3">
            <button
              type="button"
              onClick={() => toggleSpotActions(row.spot_id)}
              className="w-full rounded-2xl border border-slate-200 bg-white p-3 text-left transition hover:border-brand-200 hover:bg-brand-50/40"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-base font-semibold text-slate-900">{row.spot_title}</p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Tap to manage this spot
                  </p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  {isExpanded ? "Hide" : "Manage"}
                </span>
              </div>
            </button>

            {isExpanded ? renderSpotActions(row) : null}
          </div>
        );
      },
    },
    { key: "address", header: "Address", render: (row) => `${row.locality}, ${row.city}` },
    { key: "total_slots", header: "Total Slots" },
    { key: "spot_status", header: "Status", render: (row) => <Badge status={row.spot_status} /> },
    {
      key: "approval_status",
      header: "Approval",
      render: (row) => <Badge status={row.approval_status} />,
    },
    {
      key: "admin_comment",
      header: "Admin Comment",
      render: (row) =>
        row.approval_status === "rejected" && getRejectionReason(row)
          ? getRejectionReason(row)
          : "-",
    },
    {
      key: "price",
      header: "Pricing",
      render: (row) =>
        row.pricing?.base_hourly_rate
          ? `Final: ${formatCurrency(row.pricing?.base_hourly_rate)}`
          : row.pricing?.suggested_base_hourly_rate
            ? `Suggested: ${formatCurrency(row.pricing?.suggested_base_hourly_rate)}`
            : "Not suggested",
    },
    { key: "vehicle_type_allowed", header: "Vehicles", render: (row) => formatVehicleTypes(row.vehicle_type_allowed) },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="My Parking Spots"
        subtitle="Lender can manage multiple spots and update availability windows. Slot/device control is automated by admin."
        actions={
          <Link to="/lender/spots/new">
            <Button>Add Spot</Button>
          </Link>
        }
      />
      <DataTable columns={columns} rows={spots.map((item) => ({ ...item, id: item.spot_id }))} />
    </div>
  );
};

export default LenderSpotsPage;
