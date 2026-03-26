import { Menu, ParkingCircle, X } from "lucide-react";
import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { roleLandingRoutes } from "../../constants/roleRoutes";
import { useAuth } from "../../hooks/useAuth";
import { publicLinks } from "../../utils/navigation";
import Button from "../common/Button";

const activeClass = ({ isActive }) =>
  `text-sm font-medium transition ${isActive ? "text-brand-600" : "text-slate-600 hover:text-slate-900"}`;

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="rounded-xl bg-brand-600 p-2 text-white">
            <ParkingCircle className="h-5 w-5" />
          </span>
          <span className="font-display text-lg font-bold text-slate-900">
            Parking Spot Finder
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {publicLinks.map((link) => (
            <NavLink key={link.to} className={activeClass} to={link.to}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {!user ? (
            <>
              <Button variant="secondary" onClick={() => navigate("/login")}>
                Login
              </Button>
              <Button onClick={() => navigate("/register")}>Register</Button>
            </>
          ) : (
            <>
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-800">{user.full_name}</p>
                <p className="text-xs capitalize text-slate-500">{user.role}</p>
              </div>
              <Button
                variant="secondary"
                onClick={() => navigate(roleLandingRoutes[user.role] || "/")}
              >
                Dashboard
              </Button>
              <Button variant="secondary" onClick={handleLogout}>
                Logout
              </Button>
            </>
          )}
        </div>

        <button
          type="button"
          className="rounded-lg p-2 text-slate-700 md:hidden"
          onClick={() => setOpen((prev) => !prev)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-slate-200 bg-white px-4 py-3 md:hidden">
          <div className="space-y-3">
            {publicLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className="block text-sm font-medium text-slate-700"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </NavLink>
            ))}
            {!user ? (
              <div className="flex gap-2">
                <Button variant="secondary" className="w-full" onClick={() => navigate("/login")}>
                  Login
                </Button>
                <Button className="w-full" onClick={() => navigate("/register")}>
                  Register
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Button
                  className="w-full"
                  variant="secondary"
                  onClick={() => {
                    navigate(roleLandingRoutes[user.role] || "/");
                    setOpen(false);
                  }}
                >
                  Dashboard
                </Button>
                <Button className="w-full" variant="secondary" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
};

export default Navbar;
