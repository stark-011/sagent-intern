import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import PageHeader from "../../components/common/PageHeader";
import SpotForm from "../../components/forms/SpotForm";
import { parkingService } from "../../services/parkingService";

const EditSpotPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [initialValues, setInitialValues] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    parkingService.getSpotById(id).then((spot) => {
      setInitialValues({
        ...spot,
        base_hourly_rate:
          spot.pricing?.suggested_base_hourly_rate ?? spot.pricing?.base_hourly_rate ?? "",
        peak_hour_rate:
          spot.pricing?.suggested_peak_hour_rate ?? spot.pricing?.peak_hour_rate ?? "",
        special_day_rate:
          spot.pricing?.suggested_special_day_rate ??
          spot.pricing?.special_day_rate ??
          "",
        effective_from: spot.pricing?.effective_from || "",
        effective_to: spot.pricing?.effective_to || "",
        pricing_type: spot.pricing?.pricing_type || "hourly",
        day_of_week: spot.availability?.[0]?.day_of_week || "all",
        start_time: spot.availability?.[0]?.start_time || "06:00",
        end_time: spot.availability?.[0]?.end_time || "23:00",
        image_url: spot.images?.[0]?.image_url || "",
      });
    });
  }, [id]);

  const handleSubmit = async (form) => {
    try {
      setLoading(true);
      await parkingService.updateSpot(id, form);
      toast.success("Spot updated successfully.");
      navigate(`/lender/spots/${id}`);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Edit Spot"
        subtitle="Update spot/location and optional suggested pricing for admin review."
      />
      {initialValues ? (
        <SpotForm
          initialValues={initialValues}
          onSubmit={handleSubmit}
          submitLabel="Save Changes"
          loading={loading}
        />
      ) : (
        <p className="text-sm text-slate-600">Loading...</p>
      )}
    </div>
  );
};

export default EditSpotPage;
