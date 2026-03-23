import { NavLink, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { normalizeRole } from "../utils/fieldUtils";

const linkBase =
  "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors";

const navGroups = {
  MEMBER: [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/member/book-search", label: "Book Search" },
    { to: "/member/my-requests", label: "My Requests" },
    { to: "/member/my-issued-books", label: "My Issued Books" },
    { to: "/member/notifications", label: "Notifications" },
  ],
  LIBRARIAN: [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/librarian/manage-books", label: "Manage Books" },
    { to: "/librarian/manage-requests", label: "Manage Requests" },
  ],
};

const Sidebar = ({ open, onClose }) => {
  const { role } = useAuth();
  const location = useLocation();
  const currentRole = normalizeRole(role);
  const links = navGroups[currentRole] || navGroups.MEMBER;

  useEffect(() => {
    if (open) onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return (
    <>
      <div
        className={`fixed inset-0 z-30 bg-slate-900/30 transition-opacity md:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 border-r border-brand-100 bg-white shadow-soft transition-transform md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center border-b border-brand-100 px-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-500">
              Library
            </p>
            <p className="text-lg font-semibold text-slate-900">Control Panel</p>
          </div>
        </div>

        <nav className="space-y-1 p-3">
          {links.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `${linkBase} ${
                  isActive
                    ? "bg-brand-600 text-white"
                    : "text-slate-700 hover:bg-brand-50 hover:text-brand-700"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
