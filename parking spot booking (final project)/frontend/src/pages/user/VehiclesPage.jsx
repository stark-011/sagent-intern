import { useEffect, useState } from "react";
import { toast } from "sonner";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Modal from "../../components/common/Modal";
import PageHeader from "../../components/common/PageHeader";
import { getVehicleTypeLabel, vehicleTypeOptions } from "../../constants/vehicleTypes";
import { useAuth } from "../../hooks/useAuth";
import { vehicleService } from "../../services/vehicleService";
import { formatDate } from "../../utils/format";

const emptyVehicle = {
  vehicle_name: "",
  vehicle_number: "",
  vehicle_type: "hatchback",
  color: "",
  is_default: false,
};

const VehiclesPage = () => {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [form, setForm] = useState(emptyVehicle);
  const [editing, setEditing] = useState(null);
  const [showDelete, setShowDelete] = useState(false);

  const loadVehicles = async () => {
    const data = await vehicleService.getVehiclesByUser(user.user_id);
    setVehicles(data);
  };

  useEffect(() => {
    if (!user) return;
    loadVehicles();
  }, [user]);

  const validate = () => {
    if (!form.vehicle_name.trim()) return "Vehicle name is required.";
    if (!form.vehicle_number.trim()) return "Vehicle number is required.";
    return "";
  };

  const submit = async (e) => {
    e.preventDefault();
    const error = validate();
    if (error) {
      toast.error(error);
      return;
    }
    try {
      if (editing) {
        await vehicleService.updateVehicle(editing.vehicle_id, form);
        toast.success("Vehicle updated.");
      } else {
        await vehicleService.addVehicle(user.user_id, form);
        toast.success("Vehicle added.");
      }
      setForm(emptyVehicle);
      setEditing(null);
      loadVehicles();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const startEdit = (vehicle) => {
    setEditing(vehicle);
    setForm({
      vehicle_name: vehicle.vehicle_name,
      vehicle_number: vehicle.vehicle_number,
      vehicle_type: vehicle.vehicle_type,
      color: vehicle.color,
      is_default: vehicle.is_default,
    });
  };

  const handleDelete = async () => {
    if (!editing) return;
    await vehicleService.deleteVehicle(editing.vehicle_id);
    toast.success("Vehicle deleted.");
    setShowDelete(false);
    setEditing(null);
    setForm(emptyVehicle);
    loadVehicles();
  };

  const setDefault = async (vehicle) => {
    await vehicleService.updateVehicle(vehicle.vehicle_id, { is_default: true });
    toast.success("Default vehicle updated.");
    loadVehicles();
  };

  return (
    <div className="space-y-5">
      <PageHeader title="Vehicles" subtitle="Add, edit, remove, and set your default vehicle." />

      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <Card>
          <h3 className="font-display text-lg font-semibold text-slate-900">
            {editing ? "Edit Vehicle" : "Add Vehicle"}
          </h3>
          <form className="mt-4 space-y-3" onSubmit={submit}>
            <input
              className="input-base"
              placeholder="Vehicle name"
              value={form.vehicle_name}
              onChange={(e) => setForm((prev) => ({ ...prev, vehicle_name: e.target.value }))}
            />
            <input
              className="input-base"
              placeholder="Vehicle number"
              value={form.vehicle_number}
              onChange={(e) => setForm((prev) => ({ ...prev, vehicle_number: e.target.value }))}
            />
            <select
              className="input-base"
              value={form.vehicle_type}
              onChange={(e) => setForm((prev) => ({ ...prev, vehicle_type: e.target.value }))}
            >
              {vehicleTypeOptions.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            <input
              className="input-base"
              placeholder="Color"
              value={form.color}
              onChange={(e) => setForm((prev) => ({ ...prev, color: e.target.value }))}
            />
            <label className="inline-flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={form.is_default}
                onChange={(e) => setForm((prev) => ({ ...prev, is_default: e.target.checked }))}
              />
              Set as default vehicle
            </label>
            <div className="flex gap-2">
              <Button type="submit">{editing ? "Save Changes" : "Add Vehicle"}</Button>
              {editing ? (
                <>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setEditing(null);
                      setForm(emptyVehicle);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="button" variant="danger" onClick={() => setShowDelete(true)}>
                    Delete
                  </Button>
                </>
              ) : null}
            </div>
          </form>
        </Card>

        <Card>
          <h3 className="font-display text-lg font-semibold text-slate-900">Saved Vehicles</h3>
          <div className="mt-4 space-y-3">
            {vehicles.map((vehicle) => (
              <div key={vehicle.vehicle_id} className="rounded-xl bg-slate-50 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold text-slate-900">{vehicle.vehicle_name}</p>
                    <p className="text-sm text-slate-600">
                      {vehicle.vehicle_number} • {getVehicleTypeLabel(vehicle.vehicle_type)} •{" "}
                      {vehicle.color || "N/A"}
                    </p>
                    <p className="text-xs text-slate-500">Added {formatDate(vehicle.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {vehicle.is_default ? <Badge label="Default" className="bg-brand-100 text-brand-700" /> : null}
                    <Button variant="secondary" size="sm" onClick={() => startEdit(vehicle)}>
                      Edit
                    </Button>
                    {!vehicle.is_default ? (
                      <Button size="sm" onClick={() => setDefault(vehicle)}>
                        Set Default
                      </Button>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Modal
        open={showDelete}
        title="Delete Vehicle"
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        confirmText="Delete"
        confirmVariant="danger"
      >
        <p className="text-sm text-slate-600">Are you sure you want to delete this vehicle?</p>
      </Modal>
    </div>
  );
};

export default VehiclesPage;
