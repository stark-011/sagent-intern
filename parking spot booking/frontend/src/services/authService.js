import { roleLandingRoutes } from "../constants/roleRoutes.js";
import apiClient from "./apiClient.js";
import { unwrap } from "./apiHelpers.js";
import { clearSession, getSession, setSession } from "./storage.js";

const sanitizeUser = (user) => user || null;

const persistSession = (token, user) => {
  const session = {
    token,
    user: sanitizeUser(user),
    login_at: new Date().toISOString(),
  };
  setSession(session);
  return session;
};

export const authService = {
  async login(payload) {
    const body = {
      email: payload.email,
      password: payload.password,
      role: payload.role,
    };
    const res = await apiClient.post("/auth/login", body);
    const data = unwrap(res);
    const session = persistSession(data.token, data.user);
    return {
      ...session,
      role: data.role,
      redirectTo: data.redirect_to || roleLandingRoutes[data.role] || "/",
      wallet: data.wallet,
    };
  },

  async register(payload) {
    const body = {
      full_name: payload.full_name,
      email: payload.email,
      phone: payload.phone,
      password: payload.password,
      confirm_password: payload.confirm_password,
      role: payload.role,
    };
    const res = await apiClient.post("/auth/register", body);
    const data = unwrap(res);
    const session = persistSession(data.token, data.user);
    return {
      ...session,
      role: data.role,
      redirectTo: data.redirect_to || roleLandingRoutes[data.role] || "/",
      wallet: data.wallet,
    };
  },

  async me() {
    const res = await apiClient.get("/auth/me");
    const data = unwrap(res);
    const current = getSession();
    if (current?.token && data?.user) {
      setSession({ ...current, user: data.user });
    }
    return data;
  },

  async forgotPassword(email) {
    const res = await apiClient.post("/auth/forgot-password", { email });
    return unwrap(res);
  },

  async verifyOtp(payload) {
    const res = await apiClient.post("/auth/verify-otp", {
      email: payload.email,
      otp: payload.otp,
    });
    return unwrap(res);
  },

  async resetPassword(payload) {
    const res = await apiClient.post("/auth/reset-password", {
      email: payload.email,
      otp: payload.otp,
      new_password: payload.newPassword,
      confirm_password: payload.confirmPassword,
    });
    return unwrap(res);
  },

  getCurrentUser() {
    return getSession()?.user || null;
  },

  getCurrentSession() {
    return getSession();
  },

  async logout() {
    clearSession();
    return true;
  },

  async updateProfile(_userId, updates) {
    const body = {
      full_name: updates.full_name,
      email: updates.email,
      phone: updates.phone,
    };
    const res = await apiClient.put("/user/profile", body);
    const updated = unwrap(res);
    const current = getSession();
    if (current?.token) {
      setSession({ ...current, user: updated });
    }
    return updated;
  },

  async updatePassword(_userId, currentPassword, newPassword) {
    await apiClient.put("/user/profile/password", {
      current_password: currentPassword,
      new_password: newPassword,
      confirm_password: newPassword,
    });
    return true;
  },
};
