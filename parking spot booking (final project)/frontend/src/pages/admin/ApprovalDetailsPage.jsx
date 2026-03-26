import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import PageHeader from "../../components/common/PageHeader";
import ParkingMap from "../../components/maps/ParkingMap";
import SpotGallery from "../../components/parking/SpotGallery";
import { formatVehicleTypes } from "../../constants/vehicleTypes";
import { useAuth } from "../../hooks/useAuth";
import { adminService } from "../../services/adminService";
import { formatCurrency } from "../../utils/format";

const ApprovalDetailsPage = () => {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [detail, setDetail] = useState(null);
  const [reason, setReason] = useState("");
  const [adminPricing, setAdminPricing] = useState({
    base_hourly_rate: "",
    peak_hour_rate: "",
    special_day_rate: "",
    effective_from: "",
    effective_to: "",
  });

  const load = async () => {
    const data = await adminService.getApprovalBySpotId(id);
    setDetail(data);
    setReason(data.approval?.rejection_reason || "");
    setAdminPricing({
      base_hourly_rate:
        data.pricing?.base_hourly_rate ??
        data.pricing?.suggested_base_hourly_rate ??
        "",
      peak_hour_rate:
        data.pricing?.peak_hour_rate ?? data.pricing?.suggested_peak_hour_rate ?? "",
      special_day_rate:
        data.pricing?.special_day_rate ??
        data.pricing?.suggested_special_day_rate ??
        "",
      effective_from: data.pricing?.effective_from || new Date().toISOString().slice(0, 10),
      effective_to: data.pricing?.effective_to || "2026-12-31",
    });
  };

  useEffect(() => {
    load();
  }, [id]);

  const approve = async () => {
    if (!Number(adminPricing.base_hourly_rate)) {
      toast.error("Please set a valid base hourly rate.");
      return;
    }
    await adminService.approveSpot(id, user.user_id, adminPricing);
    toast.success("Spot approved with admin pricing.");
    await load();
  };

  const reject = async () => {
    if (!reason.trim()) {
      toast.error("Please provide a rejection reason.");
      return;
    }
    await adminService.rejectSpot(id, user.user_id, reason);
    toast.success("Spot rejected.");
    setReason("");
    await load();
  };

  if (!detail) return <p className="text-sm text-slate-600">Loading details...</p>;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Spot Review Details"
        subtitle={detail.spot_title}
        actions={<Button variant="secondary" onClick={() => navigate(-1)}>Back</Button>}
      />

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          <SpotGallery images={detail.images} />
          <Card>
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold text-slate-900">Spot Information</h3>
              <Badge status={detail.approval?.approval_status || "pending"} />
            </div>
            <p className="mt-3 text-sm text-slate-700">{detail.description}</p>
            <div className="mt-3 grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
              <p><span className="font-semibold">Address:</span> {detail.address_line}, {detail.locality}</p>
              <p><span className="font-semibold">City:</span> {detail.city}, {detail.state}</p>
              <p><span className="font-semibold">Pincode:</span> {detail.pincode}</p>
              <p><span className="font-semibold">Type:</span> {detail.spot_type}</p>
              <p><span className="font-semibold">Slots:</span> {detail.total_slots}</p>
              <p><span className="font-semibold">Vehicles:</span> {formatVehicleTypes(detail.vehicle_type_allowed)}</p>
            </div>
          </Card>

          <Card>
            <h3 className="font-display text-lg font-semibold text-slate-900">Pricing & Availability</h3>
            <div className="mt-3 grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
              <p>
                <span className="font-semibold">Lender Suggested Base:</span>{" "}
                {formatCurrency(
                  detail.pricing?.suggested_base_hourly_rate ?? detail.pricing?.base_hourly_rate ?? 0
                )}
              </p>
              <p>
                <span className="font-semibold">Lender Suggested Peak:</span>{" "}
                {formatCurrency(
                  detail.pricing?.suggested_peak_hour_rate ?? detail.pricing?.peak_hour_rate ?? 0
                )}
              </p>
              <p>
                <span className="font-semibold">Lender Suggested Special:</span>{" "}
                {formatCurrency(
                  detail.pricing?.suggested_special_day_rate ?? detail.pricing?.special_day_rate ?? 0
                )}
              </p>
              <p>
                <span className="font-semibold">Admin Final Base:</span>{" "}
                {formatCurrency(detail.pricing?.base_hourly_rate || 0)}
              </p>
              <p><span className="font-semibold">Pricing Status:</span> {detail.pricing?.rule_status}</p>
              <p><span className="font-semibold">Availability:</span> {detail.availability?.[0]?.day_of_week}</p>
              <p><span className="font-semibold">Time:</span> {detail.availability?.[0]?.start_time} - {detail.availability?.[0]?.end_time}</p>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <h3 className="mb-3 font-display text-lg font-semibold text-slate-900">Map</h3>
            <ParkingMap
              spots={[detail]}
              selectedSpot={detail}
              center={[detail.latitude, detail.longitude]}
              zoom={15}
              className="h-[280px]"
            />
          </Card>
          <Card>
            <h3 className="font-display text-lg font-semibold text-slate-900">Lender Details</h3>
            <p className="mt-2 text-sm text-slate-700">{detail.lender?.full_name}</p>
            <p className="text-sm text-slate-600">{detail.lender?.email}</p>
            <p className="text-sm text-slate-600">{detail.lender?.phone}</p>
          </Card>
          <Card>
            <h3 className="font-display text-lg font-semibold text-slate-900">Approval Actions</h3>
            <div className="mt-3 grid gap-2">
              <input
                type="number"
                className="input-base"
                min={0}
                placeholder="Admin base hourly rate"
                value={adminPricing.base_hourly_rate}
                onChange={(e) =>
                  setAdminPricing((prev) => ({ ...prev, base_hourly_rate: e.target.value }))
                }
              />
              <input
                type="number"
                className="input-base"
                min={0}
                placeholder="Admin peak hourly rate"
                value={adminPricing.peak_hour_rate}
                onChange={(e) =>
                  setAdminPricing((prev) => ({ ...prev, peak_hour_rate: e.target.value }))
                }
              />
              <input
                type="number"
                className="input-base"
                min={0}
                placeholder="Admin special day rate"
                value={adminPricing.special_day_rate}
                onChange={(e) =>
                  setAdminPricing((prev) => ({ ...prev, special_day_rate: e.target.value }))
                }
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  className="input-base"
                  value={adminPricing.effective_from}
                  onChange={(e) =>
                    setAdminPricing((prev) => ({ ...prev, effective_from: e.target.value }))
                  }
                />
                <input
                  type="date"
                  className="input-base"
                  value={adminPricing.effective_to}
                  onChange={(e) =>
                    setAdminPricing((prev) => ({ ...prev, effective_to: e.target.value }))
                  }
                />
              </div>
              <textarea
                rows={3}
                className="input-base"
                placeholder="Rejection comment for lender"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
            <div className="mt-3 flex gap-2">
              <Button variant="success" onClick={approve}>Approve with Price</Button>
              <Button variant="danger" onClick={reject}>Reject</Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ApprovalDetailsPage;
