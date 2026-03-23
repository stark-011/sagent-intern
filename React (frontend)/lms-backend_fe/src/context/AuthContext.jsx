import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { toast } from "react-hot-toast";
import * as userService from "../api/userService";
import {
  extractToken,
  getLibraryId,
  getUserId,
  normalizeRole,
  safeText,
} from "../utils/fieldUtils";

const TOKEN_KEY = "lms_token";
const USER_KEY = "lms_user";

const AuthContext = createContext(null);

const parseStoredUser = () => {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return {
      ...parsed,
      role: normalizeRole(parsed.role || parsed.userRole),
    };
  } catch {
    return null;
  }
};

const getErrorMessage = (error, fallback) =>
  (!error?.response &&
  (error?.code === "ERR_NETWORK" || error?.message === "Network Error")
    ? "Cannot reach backend at http://localhost:8080. Start Spring Boot and allow CORS for http://localhost:3000."
    : null) ||
  error?.response?.data?.message ||
  (typeof error?.response?.data === "string" ? error.response.data : null) ||
  error?.message ||
  fallback;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState("");
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY) || "";
    const storedUser = parseStoredUser();

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(storedUser);
    } else {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
    setAuthReady(true);
  }, []);

  const persistSession = useCallback((nextUser, nextToken) => {
    const normalizedUser = {
      ...nextUser,
      role: normalizeRole(nextUser.role || nextUser.userRole),
    };
    localStorage.setItem(TOKEN_KEY, nextToken);
    localStorage.setItem(USER_KEY, JSON.stringify(normalizedUser));
    setToken(nextToken);
    setUser(normalizedUser);
  }, []);

  const clearSession = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken("");
    setUser(null);
  }, []);

  const register = useCallback(async (payload) => {
    try {
      const created = await userService.createUser(payload);
      const libraryId = getLibraryId(created || {});
      toast.success(
        libraryId
          ? `Registration successful. Library ID: ${libraryId}`
          : "Registration successful"
      );
      return created;
    } catch (error) {
      const message = getErrorMessage(error, "Registration failed");
      toast.error(message);
      throw error;
    }
  }, []);

  const login = useCallback(async ({ email, password }) => {
    try {
      const users = await userService.getAllUsers();
      const list = Array.isArray(users) ? users : [];

      const matchedUser = list.find((candidate) => {
        const candidateEmail = safeText(
          candidate.email || candidate.userEmail || candidate.username
        ).toLowerCase();
        const candidatePassword = safeText(
          candidate.password || candidate.userPassword
        );

        return (
          candidateEmail === safeText(email).toLowerCase() &&
          candidatePassword === safeText(password)
        );
      });

      if (!matchedUser) {
        throw new Error("Invalid email or password");
      }

      const sessionToken = extractToken(matchedUser) || `local-jwt-${Date.now()}`;
      persistSession(matchedUser, sessionToken);
      toast.success("Login successful");
      return matchedUser;
    } catch (error) {
      const message = getErrorMessage(error, "Login failed");
      toast.error(message);
      throw error;
    }
  }, [persistSession]);

  const logout = useCallback(() => {
    clearSession();
    toast.success("Logged out");
  }, [clearSession]);

  const refreshUser = useCallback(async () => {
    const id = getUserId(user || {});
    if (!id) return;

    try {
      const freshUser = await userService.getUserById(id);
      if (freshUser && typeof freshUser === "object") {
        persistSession(
          freshUser,
          token || localStorage.getItem(TOKEN_KEY) || `local-jwt-${Date.now()}`
        );
      }
    } catch {
      // Keep existing local session when refresh fails.
    }
  }, [persistSession, token, user]);

  const value = useMemo(
    () => ({
      authReady,
      token,
      user,
      role: normalizeRole(user?.role || user?.userRole),
      isAuthenticated: Boolean(token && user),
      register,
      login,
      logout,
      refreshUser,
    }),
    [authReady, login, logout, refreshUser, register, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
