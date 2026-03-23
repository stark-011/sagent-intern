import {
  ArrowRight,
  Building2,
  MapPinned,
  ShieldCheck,
  Star,
  Wallet,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { parkingService } from "../../services/parkingService";
import SpotCard from "../../components/parking/SpotCard";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";

const HomePage = () => {
  const [query, setQuery] = useState("");
  const [featuredSpots, setFeaturedSpots] = useState([]);
  const [platformStats, setPlatformStats] = useState({
    totalSpots: 0,
    activeDrivers: 0,
    totalLenders: 0,
    totalCities: 0,
  });
  const [recentReviews, setRecentReviews] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [stats, featured] = await Promise.all([
          parkingService.getPublicStats(),
          parkingService.getFeaturedSpots(),
        ]);
        setPlatformStats(stats);
        setFeaturedSpots(featured);

        const reviewGroups = await Promise.all(
          featured.slice(0, 4).map((spot) =>
            parkingService.getReviewsBySpot(spot.spot_id).catch(() => [])
          )
        );
        const merged = reviewGroups
          .flat()
          .filter((review) => review?.comment && review?.user?.full_name)
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 3);
        setRecentReviews(merged);
      } catch (error) {
        toast.error(error.message);
      }
    };

    loadHomeData();
  }, []);

  const formatCount = (value) => new Intl.NumberFormat("en-IN").format(Number(value || 0));

  const stats = [
    { label: "Parking Spots", value: formatCount(platformStats.totalSpots) },
    { label: "Active Drivers", value: formatCount(platformStats.activeDrivers) },
    { label: "Lenders", value: formatCount(platformStats.totalLenders) },
    { label: "Cities", value: formatCount(platformStats.totalCities) },
  ];

  const features = [
    { title: "Map-first search", icon: MapPinned, text: "Explore available spots with live map markers and filters." },
    { title: "Trusted approvals", icon: ShieldCheck, text: "Admin moderation ensures reliable and secure parking listings." },
    { title: "Fast wallet checkout", icon: Wallet, text: "Pay in one tap using wallet credits and view complete history." },
    { title: "Dynamic pricing", icon: Zap, text: "Smart pricing rules for peak hours, special days, and demand." },
  ];

  return (
    <div className="space-y-14 pb-6">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-blue-900 to-emerald-700 px-6 py-12 text-white sm:px-10">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-emerald-300/20 blur-3xl" />
        <div className="relative z-10 grid gap-8 lg:grid-cols-[1.3fr_1fr]">
          <div>
            <p className="mb-3 inline-flex rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider">
              Smart Parking Marketplace
            </p>
            <h1 className="font-display text-4xl font-bold leading-tight sm:text-5xl">
              Find, reserve, and manage parking in minutes.
            </h1>
            <p className="mt-4 max-w-xl text-white/90">
              Parking Spot Finder connects drivers with verified spot lenders across the city using live availability and map-based booking.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                variant="secondary"
                className="border-white/60 bg-white text-slate-900 hover:bg-slate-100"
                onClick={() => navigate("/search")}
              >
                Search Parking
              </Button>
              <Link to="/register">
                <Button variant="secondary" className="border-white/30 bg-white/10 text-white hover:bg-white/20">
                  Become a Lender
                </Button>
              </Link>
            </div>
            <form
              className="mt-6 flex flex-col gap-2 rounded-2xl bg-white/10 p-3 backdrop-blur sm:flex-row"
              onSubmit={(e) => {
                e.preventDefault();
                navigate(`/search?q=${encodeURIComponent(query)}`);
              }}
            >
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by city, locality, or address"
                className="h-11 flex-1 rounded-xl border border-white/30 bg-white/80 px-4 text-sm text-slate-800 placeholder:text-slate-500 focus:border-white focus:outline-none"
              />
              <Button type="submit" className="h-11">
                Find Spots <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          </div>
          <Card className="bg-white/95">
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">How It Works</p>
            <ol className="mt-4 space-y-4 text-sm text-slate-700">
              <li className="rounded-xl bg-slate-50 p-3">1. Search nearby parking by area, price, and vehicle type.</li>
              <li className="rounded-xl bg-slate-50 p-3">2. Reserve your slot and pay instantly with wallet credits.</li>
              <li className="rounded-xl bg-slate-50 p-3">3. Navigate, park, and check out with full booking history.</li>
            </ol>
          </Card>
        </div>
      </section>

      <section>
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold text-slate-900">Featured Parking Spots</h2>
            <p className="text-sm text-slate-500">Top-rated approved spots popular among drivers.</p>
          </div>
          <Link to="/search" className="text-sm font-semibold text-brand-600">
            Browse all spots
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {featuredSpots.map((spot) => (
            <SpotCard key={spot.spot_id} spot={spot} compact />
          ))}
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="bg-gradient-to-br from-white to-slate-100">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{stat.label}</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{stat.value}</p>
          </Card>
        ))}
      </section>

      <section className="space-y-6">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-900">Why drivers and lenders choose us</h2>
          <p className="text-sm text-slate-500">Built as a modern parking marketplace with SaaS-grade workflows.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title}>
                <div className="mb-3 inline-flex rounded-xl bg-brand-50 p-2 text-brand-700">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-display text-lg font-semibold text-slate-900">{feature.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{feature.text}</p>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {recentReviews.length ? (
          recentReviews.map((review) => (
            <Card key={review.review_id}>
              <Star className="h-5 w-5 text-amber-500" />
              <p className="mt-3 text-sm text-slate-700">"{review.comment}"</p>
              <p className="mt-4 text-sm font-semibold text-slate-900">{review.user?.full_name}</p>
              <p className="text-xs text-slate-500">Driver review</p>
            </Card>
          ))
        ) : (
          <Card className="md:col-span-3">
            <Building2 className="h-5 w-5 text-brand-600" />
            <p className="mt-3 text-sm text-slate-700">
              Live customer reviews will appear here once bookings are completed and reviewed.
            </p>
          </Card>
        )}
      </section>
    </div>
  );
};

export default HomePage;
