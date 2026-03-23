import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import DataTable from "../../components/common/DataTable";
import Modal from "../../components/common/Modal";
import PageHeader from "../../components/common/PageHeader";
import { useAuth } from "../../hooks/useAuth";
import { adminService } from "../../services/adminService";
import { formatCurrency, formatDateTime } from "../../utils/format";

const PendingApprovalsPage = () => {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [rejectState, setRejectState] = useState({ open: false, spotId: "", reason: "" });
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const data = await adminService.getPendingApprovals();
    setRows(data);
  };

  useEffect(() => {
    load();
  }, []);

  const reject = async () => {
    if (!rejectState.reason.trim()) {
      toast.error("Please provide a rejection reason.");
      return;
    }
    try {
      setLoading(true);
      await adminService.rejectSpot(rejectState.spotId, user.user_id, rejectState.reason);
      toast.success("Spot rejected.");
      setRejectState({ open: false, spotId: "", reason: "" });
      load();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: "spot_title", header: "Spot", render: (row) => row.spot?.spot_title || "-" },
    { key: "lender", header: "Lender", render: (row) => row.lender?.full_name || "-" },
    { key: "address", header: "Address", render: (row) => `${row.spot?.locality}, ${row.spot?.city}` },
    {
      key: "suggested_price",
      header: "Lender Suggested Price",
      render: (row) => {
        const suggested = row.pricing?.suggested_base_hourly_rate ?? row.pricing?.base_hourly_rate;
        return suggested ? `${formatCurrency(suggested)}/hr` : "Not provided";
      },
    },
    { key: "submitted", header: "Submitted", render: (row) => formatDateTime(row.submitted_at) },
    { key: "status", header: "Status", render: (row) => <Badge status={row.approval_status} /> },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <div className="flex flex-wrap gap-2">
          <Link to={`/admin/approvals/${row.spot?.spot_id}`}>
            <Button size="sm" variant="secondary">Review & Set Price</Button>
          </Link>
          <Button
            size="sm"
            variant="danger"
            onClick={() => setRejectState({ open: true, spotId: row.spot?.spot_id, reason: "" })}
          >
            Reject
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Pending Spot Approvals"
        subtitle="Review submitted spots and approve or reject listings."
      />
      <DataTable columns={columns} rows={rows.map((item) => ({ ...item, id: item.approval_id }))} />

      <Modal
        open={rejectState.open}
        title="Reject Spot Listing"
        onClose={() => setRejectState({ open: false, spotId: "", reason: "" })}
        onConfirm={reject}
        confirmText="Reject Spot"
        confirmVariant="danger"
        loading={loading}
      >
        <label className="mb-1 block text-sm font-medium text-slate-700">Rejection reason</label>
        <textarea
          rows={3}
          className="input-base"
          value={rejectState.reason}
          onChange={(e) => setRejectState((prev) => ({ ...prev, reason: e.target.value }))}
          placeholder="Explain why the spot is rejected..."
        />
      </Modal>
    </div>
  );
};

export default PendingApprovalsPage;
