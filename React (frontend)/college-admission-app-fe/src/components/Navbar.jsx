import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const normalizeRole = (role) => {
  const normalized = (role || '').toString().toUpperCase().replace(/^ROLE_/, '');
  if (normalized === 'OFFICER' || normalized === 'ADMISSION_OFFICER') return 'ADMIN';
  return normalized;
};

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const authMode = localStorage.getItem('authMode');
  const sessionAuth = localStorage.getItem('isAuthenticated') === 'true';
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const role = normalizeRole(user?.role);
  const isAdmin = role === 'ADMIN';
  const isAuthenticated = Boolean(token) || (authMode === 'session' && sessionAuth);

  const onLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('authMode');
    localStorage.removeItem('isAuthenticated');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div
        className="brand"
        onClick={() => navigate(isAuthenticated ? (isAdmin ? '/officer' : '/dashboard') : '/login')}
      >
        College Admission
      </div>
      <div className="nav-links">
        {!isAuthenticated && (
          <>
            <NavLink to="/login">Login</NavLink>
            <NavLink to="/register">Register</NavLink>
          </>
        )}

        {isAuthenticated && !isAdmin && (
          <>
            <NavLink to="/dashboard">Dashboard</NavLink>
            <NavLink to="/apply">Apply</NavLink>
          </>
        )}

        {isAuthenticated && isAdmin && <NavLink to="/officer">Admin Panel</NavLink>}

        {isAuthenticated && (
          <button type="button" className="btn btn-outline" onClick={onLogout}>
            Logout
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
