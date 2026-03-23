import { useState } from "react";
import { toast } from "sonner";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import PageHeader from "../../components/common/PageHeader";
import { useAuth } from "../../hooks/useAuth";
import { authService } from "../../services/authService";

const UserProfilePage = () => {
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState({
    full_name: user?.full_name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const updateProfile = async (e) => {
    e.preventDefault();
    try {
      await authService.updateProfile(user.user_id, profile);
      refreshUser();
      toast.success("Profile updated.");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const updatePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    try {
      await authService.updatePassword(
        user.user_id,
        passwordForm.currentPassword,
        passwordForm.newPassword
      );
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast.success("Password updated.");
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader title="Profile" subtitle="Manage personal details and security settings." />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="font-display text-lg font-semibold text-slate-900">Personal Information</h3>
          <form className="mt-3 space-y-3" onSubmit={updateProfile}>
            <input
              className="input-base"
              placeholder="Full Name"
              value={profile.full_name}
              onChange={(e) => setProfile((prev) => ({ ...prev, full_name: e.target.value }))}
            />
            <input
              className="input-base"
              placeholder="Email"
              value={profile.email}
              onChange={(e) => setProfile((prev) => ({ ...prev, email: e.target.value }))}
            />
            <input
              className="input-base"
              placeholder="Phone"
              value={profile.phone}
              onChange={(e) => setProfile((prev) => ({ ...prev, phone: e.target.value }))}
            />
            <Button type="submit">Save Profile</Button>
          </form>
        </Card>

        <Card>
          <h3 className="font-display text-lg font-semibold text-slate-900">Account Status</h3>
          <div className="mt-3 space-y-2 text-sm text-slate-700">
            <p>
              <span className="font-semibold">Role:</span> {user?.role}
            </p>
            <p className="flex items-center gap-2">
              <span className="font-semibold">Status:</span> <Badge status={user?.account_status || "active"} />
            </p>
          </div>

          <h4 className="mt-6 font-display text-base font-semibold text-slate-900">Update Password</h4>
          <form className="mt-3 space-y-3" onSubmit={updatePassword}>
            <input
              type="password"
              className="input-base"
              placeholder="Current password"
              value={passwordForm.currentPassword}
              onChange={(e) =>
                setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))
              }
            />
            <input
              type="password"
              className="input-base"
              placeholder="New password"
              value={passwordForm.newPassword}
              onChange={(e) =>
                setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))
              }
            />
            <input
              type="password"
              className="input-base"
              placeholder="Confirm new password"
              value={passwordForm.confirmPassword}
              onChange={(e) =>
                setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))
              }
            />
            <Button type="submit" variant="secondary">Update Password</Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default UserProfilePage;
