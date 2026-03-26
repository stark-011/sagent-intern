import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../../hooks/useAuth";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: "user@example.com",
    password: "Password@123",
    role: "driver",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const result = await login(form);
      toast.success("Logged in successfully.");
      const fallback = location.state?.from || result.redirectTo || "/";
      navigate(fallback, { replace: true });
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const quickFill = (role) => {
    const presets = {
      driver: { email: "user@example.com", password: "Password@123", role: "driver" },
      lender: { email: "lender@example.com", password: "Password@123", role: "lender" },
      admin: { email: "admin@example.com", password: "Password@123", role: "admin" },
    };
    setForm(presets[role]);
  };

  return (
    <div className="mx-auto max-w-md">
      <Card className="space-y-5">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Welcome back</h1>
          <p className="text-sm text-slate-500">Sign in to your Parking Spot Finder account.</p>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              className="input-base"
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
            <input
              type="password"
              className="input-base"
              value={form.password}
              onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Role</label>
            <select
              className="input-base"
              value={form.role}
              onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value }))}
            >
              <option value="driver">Driver</option>
              <option value="lender">Lender</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Login"}
          </Button>
        </form>

        <div className="space-y-2 rounded-xl bg-slate-50 p-3">
          <p className="text-xs font-semibold uppercase text-slate-500">Quick account login</p>
          <div className="grid grid-cols-3 gap-2">
            <Button variant="secondary" size="sm" onClick={() => quickFill("driver")}>
              Driver
            </Button>
            <Button variant="secondary" size="sm" onClick={() => quickFill("lender")}>
              Lender
            </Button>
            <Button variant="secondary" size="sm" onClick={() => quickFill("admin")}>
              Admin
            </Button>
          </div>
        </div>
        <div className="flex items-center justify-between text-sm">
          <Link to="/forgot-password" className="text-brand-600 hover:underline">
            Forgot password?
          </Link>
          <Link to="/register" className="text-slate-600 hover:text-slate-900">
            Create account
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;
