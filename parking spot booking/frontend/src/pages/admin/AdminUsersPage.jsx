import { useEffect, useState } from "react";
import { toast } from "sonner";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import DataTable from "../../components/common/DataTable";
import PageHeader from "../../components/common/PageHeader";
import { adminService } from "../../services/adminService";
import { formatCurrency } from "../../utils/format";

const canManageStatus = (role) =>
  ["driver", "lender", "admin"].includes(String(role || "").toLowerCase());

const AdminUsersPage = () => {
  const [filters, setFilters] = useState({ role: "", status: "" });
  const [users, setUsers] = useState([]);
  const [statusDrafts, setStatusDrafts] = useState({});
  const [updatingUserId, setUpdatingUserId] = useState("");

  const load = async () => {
    const data = await adminService.getUsers(filters);
    setUsers(data);
    setStatusDrafts(
      Object.fromEntries(data.map((item) => [item.user_id, item.account_status || "active"]))
    );
  };

  useEffect(() => {
    load();
  }, [filters.role, filters.status]);

  const handleUpdateStatus = async (row) => {
    if (!canManageStatus(row.role)) return;
    const nextStatus = statusDrafts[row.user_id] || row.account_status;
    if (!nextStatus) return;
    if (nextStatus === row.account_status) {
      toast.info("Status is already set.");
      return;
    }

    try {
      setUpdatingUserId(row.user_id);
      await adminService.updateUserStatus(row.user_id, nextStatus);
      toast.success("User status updated.");
      await load();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setUpdatingUserId("");
    }
  };

  const columns = [
    { key: "full_name", header: "Name" },
    { key: "email", header: "Email" },
    { key: "phone", header: "Phone" },
    { key: "role", header: "Role", render: (row) => <Badge label={row.role} className="bg-indigo-100 text-indigo-700" /> },
    { key: "status", header: "Status", render: (row) => <Badge status={row.account_status} /> },
    { key: "spots", header: "Spots" },
    { key: "bookings", header: "Bookings" },
    { key: "wallet", header: "Wallet", render: (row) => formatCurrency(row.wallet?.credit_balance || 0) },
    {
      key: "actions",
      header: "Actions",
      render: (row) =>
        canManageStatus(row.role) ? (
          <div className="flex flex-wrap items-center gap-2">
            <select
              className="input-base min-w-[130px]"
              value={statusDrafts[row.user_id] || row.account_status || "active"}
              onChange={(e) =>
                setStatusDrafts((prev) => ({ ...prev, [row.user_id]: e.target.value }))
              }
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="blocked">Blocked</option>
            </select>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleUpdateStatus(row)}
              disabled={updatingUserId === row.user_id}
            >
              {updatingUserId === row.user_id ? "Saving..." : "Update"}
            </Button>
          </div>
        ) : (
          <span className="text-slate-400">-</span>
        ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader title="Users" subtitle="Filter user accounts by role and status." />
      <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-2">
        <select
          className="input-base"
          value={filters.role}
          onChange={(e) => setFilters((prev) => ({ ...prev, role: e.target.value }))}
        >
          <option value="">All Roles</option>
          <option value="driver">Driver</option>
          <option value="lender">Lender</option>
          <option value="admin">Admin</option>
        </select>
        <select
          className="input-base"
          value={filters.status}
          onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="blocked">Blocked</option>
        </select>
      </div>
      <DataTable columns={columns} rows={users.map((item) => ({ ...item, id: item.user_id }))} />
    </div>
  );
};

export default AdminUsersPage;
