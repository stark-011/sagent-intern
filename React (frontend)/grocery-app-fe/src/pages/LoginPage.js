import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import ErrorState from '../components/ErrorState';
import { getErrorMessage } from '../components/appUtils';
import { useAuth } from '../context/AuthContext';

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [form, setForm] = useState({
    contact: '',
    password: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const from = location.state?.from?.pathname || '/dashboard';

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await login(form);
      navigate(from, { replace: true });
    } catch (submitError) {
      setError(getErrorMessage(submitError, 'Login failed.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="card narrow-card">
      <h2>Login</h2>
      <p>Sign in using your contact and password.</p>

      <ErrorState message={error} />

      <form className="form-grid" onSubmit={handleSubmit}>
        <label>
          Contact
          <input
            name="contact"
            value={form.contact}
            onChange={handleChange}
            placeholder="Phone or email"
            required
          />
        </label>

        <label>
          Password
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </label>

        <div className="form-actions">
          <button type="submit" disabled={submitting}>
            {submitting ? 'Signing in...' : 'Login'}
          </button>
        </div>
      </form>

      <p className="muted-text">
        New user? <Link to="/register">Register</Link>
      </p>
    </section>
  );
}

export default LoginPage;
