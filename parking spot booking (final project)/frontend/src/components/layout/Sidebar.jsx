import { NavLink, useLocation } from "react-router-dom";
import { isMenuItemActive, roleMenus } from "../../utils/navigation";

const Sidebar = ({ role = "driver" }) => {
  const items = roleMenus[role] || [];
  const location = useLocation();

  return (
    <aside className="sticky top-[73px] hidden h-[calc(100vh-73px)] w-64 flex-shrink-0 border-r border-slate-200 bg-white lg:block">
      <div className="space-y-1 p-4">
        {items.map((item) => {
          const Icon = item.icon;
          const active = isMenuItemActive(location.pathname, item.to);
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={() =>
                `flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-brand-50 text-brand-700"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-800"
                }`
              }
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </aside>
  );
};

export default Sidebar;
