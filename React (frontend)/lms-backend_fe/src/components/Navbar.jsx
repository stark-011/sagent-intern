import { useAuth } from "../context/AuthContext";
import {
  getLibraryId,
  getUserDisplayName,
  normalizeRole,
} from "../utils/fieldUtils";

const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const displayName = getUserDisplayName(user || {});
  const role = normalizeRole(user?.role || user?.userRole);
  const libraryId = getLibraryId(user || {});

  return (
    <header className="sticky top-0 z-30 border-b border-brand-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-brand-100 text-brand-700 md:hidden"
            onClick={onToggleSidebar}
            aria-label="Open sidebar"
          >
            <span className="text-lg leading-none">|||</span>
          </button>
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-brand-500">
              Library Hub
            </p>
            <h1 className="text-lg font-semibold text-slate-900">LMS Dashboard</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden rounded-lg border border-brand-100 bg-brand-50 px-3 py-2 text-right sm:block">
            <p className="text-sm font-semibold text-slate-900">{displayName}</p>
            <p className="text-xs text-slate-600">
              {role}
              {libraryId ? ` | Library ID: ${libraryId}` : ""}
            </p>
          </div>

          <button type="button" className="btn-secondary" onClick={logout}>
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
