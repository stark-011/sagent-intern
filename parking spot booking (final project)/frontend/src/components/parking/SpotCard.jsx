import { Clock3, MapPin, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { getVehicleTypeLabel } from "../../constants/vehicleTypes";
import { formatCurrency } from "../../utils/format";
import Badge from "../common/Badge";
import Card from "../common/Card";
import Button from "../common/Button";

const SpotCard = ({ spot, compact = false }) => (
  <Card className={`overflow-hidden p-0 ${compact ? "" : ""}`}>
    <img
      src={spot.primary_image}
      alt={spot.spot_title}
      className={`w-full object-cover ${compact ? "h-32" : "h-44"}`}
    />
    <div className="space-y-3 p-4">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display text-lg font-semibold text-slate-900">{spot.spot_title}</h3>
        <Badge status={spot.spot_status} />
      </div>
      <p className="flex items-center gap-1 text-sm text-slate-600">
        <MapPin className="h-4 w-4" />
        {spot.locality}, {spot.city}
      </p>
      <div className="flex flex-wrap gap-2">
        {spot.vehicle_type_allowed.map((vehicleType) => (
          <span
            key={`${spot.spot_id}-${vehicleType}`}
            className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600"
          >
            {getVehicleTypeLabel(vehicleType)}
          </span>
        ))}
      </div>
      <div className="flex items-center justify-between text-sm">
        <p className="font-semibold text-brand-700">
          {formatCurrency(spot.price_per_hour)}/hr
        </p>
        <p className="flex items-center gap-1 text-amber-600">
          <Star className="h-4 w-4 fill-amber-400" />
          {spot.rating} ({spot.review_count})
        </p>
      </div>
      <div className="flex items-center justify-between text-sm text-slate-600">
        <p className="flex items-center gap-1">
          <Clock3 className="h-4 w-4" />
          {spot.availability?.[0]?.start_time || "00:00"} -{" "}
          {spot.availability?.[0]?.end_time || "23:59"}
        </p>
        <p>{spot.available_slots} slots free</p>
      </div>
      <Link to={`/spots/${spot.spot_id}`} className="block">
        <Button className="w-full">View Details</Button>
      </Link>
    </div>
  </Card>
);

export default SpotCard;
