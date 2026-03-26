import { List, Map, MapPinned, SplitSquareHorizontal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import CurrentLocationButton from "../../components/maps/CurrentLocationButton";
import ParkingMap from "../../components/maps/ParkingMap";
import EmptyState from "../../components/common/EmptyState";
import LoadingSkeleton from "../../components/common/LoadingSkeleton";
import PageHeader from "../../components/common/PageHeader";
import SearchFilters from "../../components/parking/SearchFilters";
import SpotCard from "../../components/parking/SpotCard";
import { useDebounce } from "../../hooks/useDebounce";
import { parkingService } from "../../services/parkingService";

const initialFilters = {
  vehicleType: "",
  maxPrice: "",
  spotType: "",
  minRating: "",
  maxDistance: "",
  sort: "nearest",
  timeRange: { start: "", end: "" },
};

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [filters, setFilters] = useState(initialFilters);
  const [viewMode, setViewMode] = useState("split");
  const [loading, setLoading] = useState(true);
  const [spots, setSpots] = useState([]);
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [mapCenter, setMapCenter] = useState(null);
  const debouncedQuery = useDebounce(query, 400);

  useEffect(() => {
    const fetchSpots = async () => {
      try {
        setLoading(true);
        const results = await parkingService.searchSpots({ ...filters, query: debouncedQuery });
        setSpots(results);
        setSelectedSpot((prev) =>
          prev ? results.find((item) => item.spot_id === prev.spot_id) || results[0] : results[0]
        );
      } finally {
        setLoading(false);
      }
    };
    fetchSpots();
  }, [debouncedQuery, filters]);

  const viewButtons = useMemo(
    () => [
      { value: "list", label: "List", icon: List },
      { value: "map", label: "Map", icon: Map },
      { value: "split", label: "Split", icon: SplitSquareHorizontal },
    ],
    []
  );

  const resultsList = (
    <div className="space-y-4">
      {loading ? (
        <LoadingSkeleton className="h-32" count={4} />
      ) : spots.length ? (
        spots.map((spot) => (
          <div key={spot.spot_id} onMouseEnter={() => setSelectedSpot(spot)} role="presentation">
            <SpotCard spot={spot} />
          </div>
        ))
      ) : (
        <EmptyState title="No parking spots match your filters." />
      )}
    </div>
  );

  const mapBlock = (
    <ParkingMap
      spots={spots}
      selectedSpot={selectedSpot}
      center={mapCenter || undefined}
      zoom={12}
      onMarkerClick={setSelectedSpot}
      className={viewMode === "split" ? "h-[calc(100vh-10rem)] min-h-[560px]" : "h-[70vh] min-h-[560px]"}
    />
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Search Parking"
        subtitle="Find by city, locality, price, rating, and map proximity."
        actions={
          <CurrentLocationButton
            onLocation={(coords) => {
              setMapCenter(coords);
            }}
          />
        }
      />

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
          <input
            className="input-base"
            placeholder="Search city, locality, address"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <select
            className="input-base min-w-44"
            value={filters.sort}
            onChange={(e) => setFilters((prev) => ({ ...prev, sort: e.target.value }))}
          >
            <option value="nearest">Nearest</option>
            <option value="lowest_price">Lowest price</option>
            <option value="highest_rated">Highest rated</option>
            <option value="newest">Newest</option>
          </select>
          <div className="flex rounded-xl bg-slate-100 p-1">
            {viewButtons.map((btn) => {
              const Icon = btn.icon;
              return (
                <button
                  type="button"
                  key={btn.value}
                  onClick={() => setViewMode(btn.value)}
                  className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium ${
                    viewMode === btn.value ? "bg-white text-brand-700 shadow" : "text-slate-600"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {btn.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[290px_1fr]">
        <SearchFilters
          filters={filters}
          setFilters={setFilters}
          onReset={() => setFilters(initialFilters)}
        />

        <div>
          {viewMode === "list" ? (
            resultsList
          ) : null}

          {viewMode === "map" ? (
            <div className="space-y-3">
              <p className="flex items-center gap-2 text-sm text-slate-600">
                <MapPinned className="h-4 w-4 text-brand-600" /> {spots.length} spots visible
              </p>
              {mapBlock}
            </div>
          ) : null}

          {viewMode === "split" ? (
            <div className="grid gap-4 xl:grid-cols-[1.1fr_1fr]">
              <div className="pr-1">{resultsList}</div>
              <div className="self-start xl:sticky xl:top-24">{mapBlock}</div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
