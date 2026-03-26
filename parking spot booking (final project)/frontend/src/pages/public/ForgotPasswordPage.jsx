import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import { authService } from "../../services/authService";

const EMAIL_STEP = "email";
const OTP_STEP = "otp";
const PASSWORD_STEP = "password";
const DONE_STEP = "done";

const stepOrder = [EMAIL_STEP, OTP_STEP, PASSWORD_STEP];

const ForgotPasswordPage = () => {
  const [step, setStep] = useState(EMAIL_STEP);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });

  const activeStepIndex = useMemo(() => {
    if (step === DONE_STEP) return stepOrder.length - 1;
    return Math.max(stepOrder.indexOf(step), 0);
  }, [step]);

  const updateField = (field, value) => {
    const nextValue =
      field === "otp" ? value.replace(/\D/g, "").slice(0, 6) : value;

    setForm((prev) => ({ ...prev, [field]: nextValue }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateEmailStep = () => {
    const nextErrors = {};
    const email = form.email.trim();

    if (!email) {
      nextErrors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      nextErrors.email = "Enter a valid email address.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const validateOtpStep = () => {
    const nextErrors = {};

    if (!/^\d{6}$/.test(form.otp)) {
      nextErrors.otp = "Enter the 6-digit OTP sent to your email.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const validatePasswordStep = () => {
    const nextErrors = {};

    if (form.newPassword.length < 6) {
      nextErrors.newPassword = "Password must be at least 6 characters.";
    }

    if (!form.confirmPassword) {
      nextErrors.confirmPassword = "Please confirm your new password.";
    } else if (form.newPassword !== form.confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const resetToEmailStep = () => {
    setStep(EMAIL_STEP);
    setMessage("");
    setErrors({});
    setForm((prev) => ({
      ...prev,
      otp: "",
      newPassword: "",
      confirmPassword: "",
    }));
  };

  const handleRequestOtp = async (e) => {
    e?.preventDefault();
    if (!validateEmailStep()) return;

    try {
      setLoading(true);
      const response = await authService.forgotPassword(form.email.trim());
      setMessage(response.message);
      setStep(OTP_STEP);
      toast.success("OTP sent to your email.");
    } catch (error) {
      toast.error(error.message);
      setMessage("");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!validateOtpStep()) return;

    try {
      setLoading(true);
      const response = await authService.verifyOtp({
        email: form.email.trim(),
        otp: form.otp,
      });
      setMessage(response.message);
      setStep(PASSWORD_STEP);
      toast.success("OTP verified.");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!validatePasswordStep()) return;

    try {
      setLoading(true);
      const response = await authService.resetPassword({
        email: form.email.trim(),
        otp: form.otp,
        newPassword: form.newPassword,
        confirmPassword: form.confirmPassword,
      });
      setMessage(response.message);
      setStep(DONE_STEP);
      setErrors({});
      setForm((prev) => ({
        ...prev,
        newPassword: "",
        confirmPassword: "",
      }));
      toast.success("Password reset successful.");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <Card className="space-y-5">
        <h1 className="font-display text-2xl font-bold text-slate-900">Forgot password</h1>
        <p className="text-sm text-slate-500">
          Enter your email, verify the OTP from your inbox, and choose a new password.
        </p>

        <div className="grid grid-cols-3 gap-2">
          {[
            { key: EMAIL_STEP, label: "1. Email" },
            { key: OTP_STEP, label: "2. OTP" },
            { key: PASSWORD_STEP, label: "3. Password" },
          ].map((item, index) => {
            const isActive = step !== DONE_STEP && step === item.key;
            const isComplete = step === DONE_STEP || index < activeStepIndex;

            return (
              <div
                key={item.key}
                className={`rounded-xl border px-3 py-2 text-center text-xs font-semibold ${
                  isActive
                    ? "border-brand-500 bg-brand-50 text-brand-700"
                    : isComplete
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-slate-200 bg-slate-50 text-slate-500"
                }`}
              >
                {item.label}
              </div>
            );
          })}
        </div>

        {message ? (
          <p className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p>
        ) : null}

        {(step === OTP_STEP || step === PASSWORD_STEP || step === DONE_STEP) && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
            Resetting password for <span className="font-semibold text-slate-900">{form.email.trim()}</span>
          </div>
        )}

        {step === EMAIL_STEP && (
          <form className="space-y-4" onSubmit={handleRequestOtp}>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
              <input
                type="email"
                className="input-base"
                placeholder="name@example.com"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                required
              />
              {errors.email ? <p className="error-text">{errors.email}</p> : null}
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Sending OTP..." : "Send OTP"}
            </Button>
          </form>
        )}

        {step === OTP_STEP && (
          <form className="space-y-4" onSubmit={handleVerifyOtp}>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Enter OTP</label>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                className="input-base text-center text-lg tracking-[0.4em]"
                placeholder="123456"
                value={form.otp}
                onChange={(e) => updateField("otp", e.target.value)}
                maxLength={6}
                required
              />
              {errors.otp ? <p className="error-text">{errors.otp}</p> : null}
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? "Verifying..." : "Verify OTP"}
              </Button>
              <Button type="button" variant="secondary" onClick={handleRequestOtp} disabled={loading}>
                Resend OTP
              </Button>
            </div>
            <Button type="button" variant="ghost" className="w-full" onClick={resetToEmailStep} disabled={loading}>
              Use a different email
            </Button>
          </form>
        )}

        {step === PASSWORD_STEP && (
          <form className="space-y-4" onSubmit={handleResetPassword}>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">New password</label>
              <input
                type="password"
                autoComplete="new-password"
                className="input-base"
                value={form.newPassword}
                onChange={(e) => updateField("newPassword", e.target.value)}
                required
              />
              {errors.newPassword ? <p className="error-text">{errors.newPassword}</p> : null}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Confirm password</label>
              <input
                type="password"
                autoComplete="new-password"
                className="input-base"
                value={form.confirmPassword}
                onChange={(e) => updateField("confirmPassword", e.target.value)}
                required
              />
              {errors.confirmPassword ? <p className="error-text">{errors.confirmPassword}</p> : null}
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Resetting password..." : "Reset password"}
            </Button>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                className="flex-1"
                onClick={() => setStep(OTP_STEP)}
                disabled={loading}
              >
                Back to OTP
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="flex-1"
                onClick={resetToEmailStep}
                disabled={loading}
              >
                Change email
              </Button>
            </div>
          </form>
        )}

        {step === DONE_STEP && (
          <div className="space-y-4">
            <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
              Your password has been updated. You can now log in with the new password.
            </p>
            <Link
              to="/login"
              className="inline-flex w-full items-center justify-center rounded-xl bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-soft transition hover:bg-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              Back to Login
            </Link>
            <Button type="button" variant="ghost" className="w-full" onClick={resetToEmailStep}>
              Start another reset
            </Button>
          </div>
        )}

        {step !== DONE_STEP && (
          <Link to="/login" className="inline-block text-sm text-brand-600 hover:underline">
            Back to Login
          </Link>
        )}
      </Card>
    </div>
  );
};

export default ForgotPasswordPage;
