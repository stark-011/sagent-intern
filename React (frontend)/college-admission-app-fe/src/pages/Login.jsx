import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { loginUser } from '../services/api';

const extractToken = (payload) => {
  if (!payload) return '';
  if (typeof payload === 'string') return payload.replace(/^Bearer\s+/i, '').trim();

  const directKeys = [
    'token',
    'jwt',
    'jwtToken',
    'accessToken',
    'access_token',
    'authToken',
    'idToken',
  ];

  for (const key of directKeys) {
    if (typeof payload[key] === 'string' && payload[key].trim()) {
      return payload[key].replace(/^Bearer\s+/i, '').trim();
    }
  }

  const headers = payload?._meta?.headers || payload?.headers;
  const headerToken =
    headers?.authorization || headers?.Authorization || headers?.['x-auth-token'] || '';
  if (typeof headerToken === 'string' && headerToken.trim()) {
    return headerToken.replace(/^Bearer\s+/i, '').trim();
  }

  const nestedKeys = ['data', 'result', 'response', 'body', 'payload'];
  for (const key of nestedKeys) {
    if (payload[key]) {
      const nestedToken = extractToken(payload[key]);
      if (nestedToken) return nestedToken;
    }
  }

  const deepScan = (node) => {
    if (!node || typeof node !== 'object') return '';
    for (const [key, value] of Object.entries(node)) {
      if (typeof value === 'string' && key.toLowerCase().includes('token') && value.trim()) {
        return value.replace(/^Bearer\s+/i, '').trim();
      }
      if (value && typeof value === 'object') {
        const token = deepScan(value);
        if (token) return token;
      }
    }
    return '';
  };

  return deepScan(payload);
};

const parseRole = (sourceRole) => {
  if (!sourceRole) return '';
  const normalized = sourceRole.toString().toUpperCase().replace(/^ROLE_/, '');
  if (normalized === 'ADMIN' || normalized === 'OFFICER' || normalized === 'ADMISSION_OFFICER') {
    return 'ADMIN';
  }
  return normalized || 'STUDENT';
};

const resolveRole = (payload) => {
  const directRole =
    payload?.role ||
    payload?.user?.role ||
    payload?.profile?.role ||
    payload?.data?.role ||
    payload?.data?.user?.role ||
    payload?.result?.role ||
    payload?.result?.user?.role;
  if (directRole) return parseRole(directRole);

  const rawAuthorities =
    payload?.authorities ||
    payload?.roles ||
    payload?.user?.authorities ||
    payload?.user?.roles ||
    payload?.data?.authorities ||
    payload?.data?.roles ||
    payload?.data?.user?.authorities ||
    payload?.data?.user?.roles;

  if (Array.isArray(rawAuthorities) && rawAuthorities.length > 0) {
    const values = rawAuthorities
      .map((item) => (typeof item === 'string' ? item : item?.authority || item?.role || ''))
      .filter(Boolean)
      .join(',');

    if (/ADMIN|OFFICER/i.test(values)) return 'ADMIN';
  }

  return 'STUDENT';
};

const extractUser = (payload, email) => {
  if (!payload || typeof payload === 'string') {
    return {
      name: email.split('@')[0],
      email,
      role: 'STUDENT',
    };
  }

  const user =
    payload.user ||
    payload.profile ||
    payload.account ||
    payload.data?.user ||
    payload.data?.profile ||
    payload.result?.user;

  if (user) {
    return {
      userId: user.userId || user.id || payload.userId || payload.id || null,
      name: user.name || user.fullName || email.split('@')[0],
      email: user.email || email,
      role: parseRole(user.role) || resolveRole(payload),
    };
  }

  return {
    userId: payload.userId || payload.id || payload.data?.userId || payload.data?.id || null,
    name: payload.name || payload.fullName || email.split('@')[0],
    email: payload.email || email,
    role: resolveRole(payload),
  };
};

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await loginUser(formData);
      if (response?.success === false) {
        throw new Error(response?.message || 'Login failed.');
      }

      const token = extractToken(response);
      const user = extractUser(response, formData.email);
      if (token) {
        localStorage.setItem('token', token);
        localStorage.setItem('authMode', 'jwt');
      } else {
        localStorage.removeItem('token');
        localStorage.setItem('authMode', 'session');
      }
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('user', JSON.stringify(user));

      const role = (user.role || '').toUpperCase();
      if (role === 'ADMIN') {
        navigate('/officer');
      } else {
        navigate(from === '/officer' ? '/dashboard' : from);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-wrapper">
      <div className="card auth-card fade-in">
        <h2>Login</h2>
        <p className="muted">Sign in to continue your admission journey.</p>

        <form onSubmit={handleSubmit} className="form">
          <label>Email</label>
          <input
            type="email"
            name="email"
            placeholder="student@example.com"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <label>Password</label>
          <input
            type="password"
            name="password"
            placeholder="Enter password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          {error && <div className="alert error">{error}</div>}

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <span className="spinner" /> : 'Login'}
          </button>
        </form>

        <p className="auth-footnote">
          New user? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </section>
  );
};

export default Login;
