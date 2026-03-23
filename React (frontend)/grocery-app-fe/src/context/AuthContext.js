import { createContext, useContext, useMemo, useState } from 'react';
import { getId, normalizeRole } from '../components/appUtils';
import { loginUser, registerUser } from '../services/userService';

const AuthContext = createContext(null);

const STORAGE_KEY = 'grocery_delivery_current_user';

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return null;
    }

    try {
      const parsed = JSON.parse(saved);
      return {
        ...parsed,
        id: getId(parsed),
      };
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
  });
  const loading = false;

  const login = async (credentials) => {
    const user = await loginUser(credentials);
    const normalizedUser = {
      ...user,
      id: getId(user),
      role: normalizeRole(user.role),
    };

    setCurrentUser(normalizedUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizedUser));

    return normalizedUser;
  };

  const register = async (payload) => {
    const user = await registerUser(payload);
    return user;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const value = useMemo(
    () => ({
      currentUser,
      loading,
      login,
      register,
      logout,
      isAuthenticated: Boolean(currentUser),
    }),
    [currentUser, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}
