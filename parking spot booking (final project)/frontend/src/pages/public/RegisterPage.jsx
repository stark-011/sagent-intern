import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import { useAuth } from "../../hooks/useAuth";
import { validateEmail, validatePhone } from "../../utils/validation";

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    confirm_password: "",
    role: "driver",
  });

  const validate = () => {
    const next = {};
    if (!form.full_name.trim()) next.full_name = "Full name is required.";
    if (!validateEmail(form.email)) next.email = "Enter a valid email.";
    if (!validatePhone(form.phone)) next.phone = "Enter a valid phone number.";
    if (form.password.length < 8) next.password = "Minimum 8 characters.";
    if (form.password !== form.confirm_password) next.confirm_password = "Passwords do not match.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setLoading(true);
      const result = await register(form);
      toast.success("Account created successfully.");
      navigate(result.redirectTo, { replace: true });
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl">
      <Card>
        <h1 className="font-display text-2xl font-bold text-slate-900">Create account</h1>
        <p className="mt-1 text-sm text-slate-500">
          Register as a driver, lender, or admin user.
        </p>

        <form className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700">Full Name</label>
            <input
              className="input-base"
              value={form.full_name}
              onChange={(e) => setForm((prev) => ({ ...prev, full_name: e.target.value }))}
            />
            {errors.full_name ? <p className="error-text">{errors.full_name}</p> : null}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              className="input-base"
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
            />
            {errors.email ? <p className="error-text">{errors.email}</p> : null}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Phone</label>
            <input
              className="input-base"
              value={form.phone}
              onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
            />
            {errors.phone ? <p className="error-text">{errors.phone}</p> : null}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
            <input
              type="password"
              className="input-base"
              value={form.password}
              onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
            />
            {errors.password ? <p className="error-text">{errors.password}</p> : null}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Confirm Password</label>
            <input
              type="password"
              className="input-base"
              value={form.confirm_password}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, confirm_password: e.target.value }))
              }
            />
            {errors.confirm_password ? <p className="error-text">{errors.confirm_password}</p> : null}
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700">Role</label>
            <select
              className="input-base"
              value={form.role}
              onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value }))}
            >
              <option value="driver">Driver / User</option>
              <option value="lender">Spot Lender</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating account..." : "Register"}
            </Button>
          </div>
        </form>

        <p className="mt-4 text-sm text-slate-600">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-brand-600 hover:underline">
            Login
          </Link>
        </p>
      </Card>
    </div>
  );
};

export default RegisterPage;

