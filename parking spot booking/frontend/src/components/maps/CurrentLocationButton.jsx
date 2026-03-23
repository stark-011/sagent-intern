import { LocateFixed } from "lucide-react";
import { toast } from "sonner";
import Button from "../common/Button";

const CurrentLocationButton = ({ onLocation }) => {
  const handleClick = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported in this browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => onLocation?.([pos.coords.latitude, pos.coords.longitude]),
      () => toast.error("Unable to fetch current location.")
    );
  };

  return (
    <Button variant="secondary" onClick={handleClick}>
      <LocateFixed className="h-4 w-4" />
      Current Location
    </Button>
  );
};

export default CurrentLocationButton;
