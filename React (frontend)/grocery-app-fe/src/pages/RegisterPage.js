import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ErrorState from '../components/ErrorState';
import { getErrorMessage, ROLE_OPTIONS } from '../components/appUtils';
import { useAuth } from '../context/AuthContext';

const initialForm = {
  name: '',
  address: '',
  contact: '',
  role: 'customer',
  password: '',
};

function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      await register(form);
      setSuccess('Registration successful. You can now login.');
      setForm(initialForm);
      navigate('/login');
    } catch (submitError) {
      setError(getErrorMessage(submitError, 'Failed to register user.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="card">
      <h2>Register</h2>
      <p>Create your account for Grocery Delivery App.</p>

      <ErrorState message={error} />
      {success && <p className="status success">{success}</p>}

      <form className="form-grid" onSubmit={handleSubmit}>
        <label>
          Name
          <input name="name" value={form.name} onChange={handleChange} required />
        </label>

        <label>
          Address
          <input name="address" value={form.address} onChange={handleChange} required />
        </label>

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
          Role
          <select name="role" value={form.role} onChange={handleChange} required>
            {ROLE_OPTIONS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
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
            {submitting ? 'Creating...' : 'Register'}
          </button>
        </div>
      </form>

      <p className="muted-text">
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </section>
  );
}

export default RegisterPage;
