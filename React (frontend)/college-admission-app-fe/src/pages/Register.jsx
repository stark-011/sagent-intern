import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../services/api';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'STUDENT',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await registerUser(formData);
      setSuccess('Registration successful. Redirecting to login...');
      setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-wrapper">
      <div className="card auth-card fade-in">
        <h2>Create Account</h2>
        <p className="muted">Register as a student or admin.</p>

        <form onSubmit={handleSubmit} className="form">
          <label>Name</label>
          <input
            type="text"
            name="name"
            placeholder="Full name"
            value={formData.name}
            onChange={handleChange}
            required
          />

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
            placeholder="Create password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <label>Role</label>
          <select name="role" value={formData.role} onChange={handleChange} required>
            <option value="STUDENT">Student</option>
            <option value="ADMIN">Admin</option>
          </select>

          {error && <div className="alert error">{error}</div>}
          {success && <div className="alert success">{success}</div>}

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <span className="spinner" /> : 'Register'}
          </button>
        </form>

        <p className="auth-footnote">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </section>
  );
};

export default Register;
