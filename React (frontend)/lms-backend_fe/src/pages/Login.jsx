import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Loader from "../components/Loader";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login, authReady, isAuthenticated } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (authReady && isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [authReady, isAuthenticated, navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      await login(form);
      navigate("/dashboard", { replace: true });
    } catch {
      // Error toast is handled inside AuthContext.login.
    } finally {
      setLoading(false);
    }
  };

  if (!authReady) return <Loader text="Loading session..." />;

  return (
    <div className="bg-surface flex min-h-screen items-center justify-center px-4 py-8">
      <div className="w-full max-w-md rounded-3xl border border-brand-100 bg-white/95 p-8 shadow-soft backdrop-blur">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-500">
            Library Access
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Sign in</h1>
          <p className="mt-2 text-sm text-slate-600">
            Login with your registered library email and password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-600">
          New member?{" "}
          <Link to="/register" className="font-semibold text-brand-700 hover:text-brand-800">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
