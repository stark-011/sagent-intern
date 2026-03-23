import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import SpotForm from "../../components/forms/SpotForm";
import PageHeader from "../../components/common/PageHeader";
import { useAuth } from "../../hooks/useAuth";
import { parkingService } from "../../services/parkingService";

const AddSpotPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (form) => {
    try {
      setLoading(true);
      const created = await parkingService.addSpot(user.user_id, form);
      toast.success("Spot added and sent for approval.");
      navigate(`/lender/spots/${created.spot_id}`);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Add Parking Spot"
        subtitle="Lenders can add multiple spots in different places. Each spot has one slot and one car at a time."
      />
      <SpotForm onSubmit={handleSubmit} submitLabel="Create Spot" loading={loading} />
    </div>
  );
};

export default AddSpotPage;
