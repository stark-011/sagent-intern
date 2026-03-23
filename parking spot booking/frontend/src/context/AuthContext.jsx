import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authService } from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const session = authService.getCurrentSession();
        if (!session?.token) {
          setUser(null);
          return;
        }
        const me = await authService.me();
        setUser(me?.user || authService.getCurrentUser());
      } catch {
        await authService.logout();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    bootstrap();
  }, []);

  const login = async (payload) => {
    const session = await authService.login(payload);
    setUser(session.user);
    return session;
  };

  const register = async (payload) => {
    const session = await authService.register(payload);
    setUser(session.user);
    return session;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const me = await authService.me();
      setUser(me?.user || authService.getCurrentUser());
    } catch {
      setUser(authService.getCurrentUser());
    }
  };

  const value = useMemo(
    () => ({ user, loading, isAuthenticated: Boolean(user), login, register, logout, refreshUser }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider.");
  return ctx;
};
