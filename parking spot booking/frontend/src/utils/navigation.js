import {
  Car,
  CreditCard,
  Home,
  LayoutDashboard,
  MapPinned,
  ParkingCircle,
  ShieldCheck,
  Star,
  User,
  Users,
  Wallet,
  ClipboardCheck,
  CircleDollarSign,
  FileBarChart2,
  Settings2,
} from "lucide-react";

export const publicLinks = [
  { to: "/", label: "Home" },
  { to: "/search", label: "Search Parking" },
];

export const roleMenus = {
  driver: [
    { to: "/user/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/search", label: "Search Spots", icon: MapPinned },
    { to: "/user/bookings", label: "My Bookings", icon: ParkingCircle },
    { to: "/user/wallet", label: "Wallet", icon: Wallet },
    { to: "/user/vehicles", label: "Vehicles", icon: Car },
    { to: "/user/reviews", label: "Reviews", icon: Star },
    { to: "/user/profile", label: "Profile", icon: User },
  ],
  lender: [
    { to: "/lender/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/lender/spots", label: "My Parking Spots", icon: ParkingCircle },
    { to: "/lender/spots/new", label: "Add Spot", icon: Home },
    { to: "/lender/bookings", label: "Spot Bookings", icon: ClipboardCheck },
    { to: "/lender/earnings", label: "Earnings", icon: CircleDollarSign },
    { to: "/lender/profile", label: "Profile", icon: User },
  ],
  admin: [
    { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/admin/approvals", label: "Pending Approvals", icon: ShieldCheck },
    { to: "/admin/spots", label: "All Spots", icon: ParkingCircle },
    { to: "/admin/pricing", label: "Pricing Rules", icon: CreditCard },
    { to: "/admin/users", label: "Users", icon: Users },
    { to: "/admin/reports", label: "Reports", icon: FileBarChart2 },
    { to: "/admin/profile", label: "Profile", icon: Settings2 },
  ],
};

export const isMenuItemActive = (pathname, itemTo) => {
  if (!pathname || !itemTo) return false;

  // Prevent parent "/lender/spots" from also activating on "/lender/spots/new".
  if (itemTo === "/lender/spots") {
    if (pathname === "/lender/spots/new") return false;
    return pathname === "/lender/spots" || pathname.startsWith("/lender/spots/");
  }

  if (pathname === itemTo) return true;
  return pathname.startsWith(`${itemTo}/`);
};
