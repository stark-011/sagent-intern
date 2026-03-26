import { NavLink, Outlet, useLocation } from "react-router-dom";
import { isMenuItemActive, roleMenus } from "../../utils/navigation";
import Footer from "./Footer";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const DashboardLayout = ({ role }) => {
  const menu = roleMenus[role] || [];
  const location = useLocation();

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="mx-auto flex w-full max-w-7xl">
        <Sidebar role={role} />
        <div className="min-h-[calc(100vh-73px)] flex-1 px-4 py-6 sm:px-6">
          <div className="mb-4 flex gap-2 overflow-x-auto lg:hidden">
            {menu.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={() =>
                  `whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium ${
                    isMenuItemActive(location.pathname, item.to)
                      ? "bg-brand-600 text-white"
                      : "bg-white text-slate-600"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
          <Outlet />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default DashboardLayout;
