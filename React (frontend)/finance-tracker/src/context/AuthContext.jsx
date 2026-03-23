import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { AUTH_TOKEN_STORAGE_KEY, AUTH_USER_STORAGE_KEY } from "../api/axiosClient";
import { loginUser, registerUser } from "../services/authService";
import { normalizeAuthUser } from "../utils/normalizers";

const AuthContext = createContext(null);

const readStoredUser = () => {
  try {
    const rawUser = localStorage.getItem(AUTH_USER_STORAGE_KEY);

    if (!rawUser) {
      return null;
    }

    return normalizeAuthUser(JSON.parse(rawUser));
  } catch {
    return null;
  }
};

const readStoredToken = () => localStorage.getItem(AUTH_TOKEN_STORAGE_KEY) || "";

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(readStoredToken);
  const [user, setUser] = useState(readStoredUser);

  const persistAuthState = useCallback((nextToken, nextUser) => {
    setToken(nextToken);
    setUser(nextUser);

    localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, nextToken);
    localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(nextUser));
  }, []);

  const clearAuthState = useCallback(() => {
    setToken("");
    setUser(null);

    localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    localStorage.removeItem(AUTH_USER_STORAGE_KEY);
  }, []);

  const login = useCallback(
    async (credentials) => {
      const authResult = await loginUser(credentials);
      persistAuthState(authResult.token, authResult.user);
      return authResult;
    },
    [persistAuthState]
  );

  const register = useCallback(
    async (registrationPayload) => {
      const authResult = await registerUser(registrationPayload);
      persistAuthState(authResult.token, authResult.user);
      return authResult;
    },
    [persistAuthState]
  );

  const logout = useCallback(() => {
    clearAuthState();
  }, [clearAuthState]);

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token),
      login,
      register,
      logout,
    }),
    [token, user, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }

  return context;
};
