import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { normalizeRole, ROLES } from './appUtils';

function Navbar() {
  const navigate = useNavigate();
  const { currentUser, logout, isAuthenticated } = useAuth();
  const role = normalizeRole(currentUser?.role);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="app-header">
      <div>
        <h1>Grocery Delivery App</h1>
        {isAuthenticated && (
          <p className="subtitle">
            Logged in as <strong>{currentUser?.name || currentUser?.contact || 'User'}</strong> ({role})
          </p>
        )}
      </div>

      <nav className="nav-links">
        {!isAuthenticated && <NavLink to="/register">Register</NavLink>}
        {!isAuthenticated && <NavLink to="/login">Login</NavLink>}

        {isAuthenticated && <NavLink to="/dashboard">Dashboard</NavLink>}

        {isAuthenticated && role === ROLES.CUSTOMER && <NavLink to="/products">Products</NavLink>}
        {isAuthenticated && role === ROLES.CUSTOMER && <NavLink to="/cart">Cart</NavLink>}
        {isAuthenticated && role === ROLES.CUSTOMER && <NavLink to="/orders">Orders</NavLink>}

        {isAuthenticated && role === ROLES.STORE_ADMIN && <NavLink to="/store">Store</NavLink>}
        {isAuthenticated && role === ROLES.DELIVERY_PERSON && <NavLink to="/delivery">Delivery</NavLink>}

        {isAuthenticated && <NavLink to="/notifications">Notifications</NavLink>}

        {isAuthenticated && (
          <button type="button" onClick={handleLogout} className="button-secondary">
            Logout
          </button>
        )}
      </nav>
    </header>
  );
}

export default Navbar;
