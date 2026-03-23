import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { formatCurrency } from "../../utils/format";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const FitBounds = ({ spots }) => {
  const map = useMap();
  useEffect(() => {
    if (!spots?.length) return;
    if (spots.length === 1) {
      map.setView([spots[0].latitude, spots[0].longitude], 14);
      return;
    }
    const bounds = L.latLngBounds(spots.map((spot) => [spot.latitude, spot.longitude]));
    map.fitBounds(bounds.pad(0.2));
  }, [map, spots]);
  return null;
};

const SpotMarker = ({ spot, selected, onMarkerClick }) => {
  const markerRef = useRef(null);

  useEffect(() => {
    if (selected) {
      markerRef.current?.openPopup();
    }
  }, [selected]);

  return (
    <Marker
      ref={markerRef}
      position={[Number(spot.latitude), Number(spot.longitude)]}
      zIndexOffset={selected ? 1000 : 0}
      opacity={selected ? 1 : 0.9}
      eventHandlers={{
        click: () => onMarkerClick?.(spot),
      }}
    >
      <Popup>
        <div className="min-w-44">
          <p className="font-semibold text-slate-900">{spot.spot_title}</p>
          <p className="text-sm text-slate-600">
            {spot.locality}, {spot.city}
          </p>
          <p className="mt-1 text-sm font-medium text-brand-600">
            {formatCurrency(spot.price_per_hour || 0)}/hr
          </p>
          <Link
            className="mt-2 inline-block text-xs font-semibold text-brand-700 underline"
            to={`/spots/${spot.spot_id}`}
          >
            View Details
          </Link>
        </div>
      </Popup>
    </Marker>
  );
};

const ParkingMap = ({
  spots = [],
  selectedSpot = null,
  center,
  zoom = 12,
  onMarkerClick,
  className = "h-[420px]",
}) => {
  const validSpots = useMemo(
    () =>
      (spots || []).filter(
        (spot) =>
          Number.isFinite(Number(spot?.latitude)) &&
          Number.isFinite(Number(spot?.longitude))
      ),
    [spots]
  );

  const defaultCenter = useMemo(() => {
    if (center) return center;
    if (validSpots.length) return [validSpots[0].latitude, validSpots[0].longitude];
    return [12.9716, 77.5946];
  }, [center, validSpots]);

  return (
    <div className={`overflow-hidden rounded-2xl border border-slate-200 ${className}`}>
      <MapContainer center={defaultCenter} zoom={zoom} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {!center ? <FitBounds spots={validSpots} /> : null}
        {validSpots.map((spot) => (
          <SpotMarker
            key={spot.spot_id}
            spot={spot}
            selected={selectedSpot?.spot_id === spot.spot_id}
            onMarkerClick={onMarkerClick}
          />
        ))}
      </MapContainer>
    </div>
  );
};

export default ParkingMap;
