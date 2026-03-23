import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getLibraryId } from "../utils/fieldUtils";

const Register = () => {
  const { register } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "MEMBER",
  });
  const [loading, setLoading] = useState(false);
  const [createdLibraryId, setCreatedLibraryId] = useState(null);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const created = await register(form);
      setCreatedLibraryId(getLibraryId(created || {}));
      setForm({
        name: "",
        email: "",
        password: "",
        role: "MEMBER",
      });
    } catch {
      // Error toast is handled inside AuthContext.register.
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface flex min-h-screen items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg rounded-3xl border border-brand-100 bg-white/95 p-8 shadow-soft backdrop-blur">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-500">
            Member Registration
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Create account</h1>
          <p className="mt-2 text-sm text-slate-600">
            Register to borrow books, manage requests, and track notifications.
          </p>
        </div>

        {createdLibraryId && (
          <div className="mb-5 rounded-xl border border-brand-200 bg-brand-50 p-3 text-sm text-brand-800">
            Unique Library ID: <span className="font-semibold">{createdLibraryId}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label" htmlFor="name">
              Name
            </label>
            <input
              id="name"
              name="name"
              className="input"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="input"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              className="input"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="label" htmlFor="role">
              Role
            </label>
            <select
              id="role"
              name="role"
              className="input"
              value={form.role}
              onChange={handleChange}
            >
              <option value="MEMBER">Member</option>
              <option value="LIBRARIAN">Librarian</option>
            </select>
          </div>

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-600">
          Already registered?{" "}
          <Link to="/login" className="font-semibold text-brand-700 hover:text-brand-800">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
