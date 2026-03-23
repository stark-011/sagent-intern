import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { extractApiError } from "../api/axiosConfig";
import { loginWithBackend, createPseudoJwt } from "../api/authApi";
import { getAllDoctors } from "../api/doctorApi";
import { getAllPatients, registerPatient } from "../api/patientApi";
import { normalizeRole } from "../utils/formatters";

const TOKEN_STORAGE_KEY = "pms_token";
const USER_STORAGE_KEY = "pms_user";

const AuthContext = createContext(null);

const readStoredUser = () => {
  const rawUser = localStorage.getItem(USER_STORAGE_KEY);
  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser);
  } catch {
    return null;
  }
};

const buildSessionUser = (account, role) => ({
  id: account.id,
  fullName: account.fullName,
  contactDetails: account.contactDetails,
  role: normalizeRole(role)
});

export const roleHomePath = (role) => {
  const normalizedRole = normalizeRole(role);
  if (normalizedRole === "DOCTOR") {
    return "/doctor/dashboard";
  }
  return "/patient/dashboard";
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem(TOKEN_STORAGE_KEY));
  const [user, setUser] = useState(readStoredUser);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    setAuthLoading(false);
  }, []);

  const persistSession = (sessionToken, sessionUser) => {
    localStorage.setItem(TOKEN_STORAGE_KEY, sessionToken);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(sessionUser));
    setToken(sessionToken);
    setUser(sessionUser);
  };

  const clearSession = () => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    setToken(null);
    setUser(null);
  };

  const findAccountForRole = async (role, contactDetails) => {
    const normalizedContact = String(contactDetails).trim().toLowerCase();

    if (role === "DOCTOR") {
      const doctors = await getAllDoctors();
      return doctors.find(
        (doctor) => String(doctor.contactDetails || "").trim().toLowerCase() === normalizedContact
      );
    }

    const patients = await getAllPatients();
    return patients.find(
      (patient) => String(patient.contactDetails || "").trim().toLowerCase() === normalizedContact
    );
  };

  const login = async ({ role, contactDetails, password }) => {
    const normalizedRole = normalizeRole(role);

    try {
      setAuthLoading(true);

      const backendAuth = await loginWithBackend({
        role: normalizedRole,
        contactDetails,
        password
      });

      if (backendAuth?.token) {
        const backendUser = backendAuth.user || backendAuth.account || {};
        const sessionUser = {
          ...backendUser,
          role: normalizeRole(backendUser.role || normalizedRole)
        };

        persistSession(backendAuth.token, sessionUser);
        return sessionUser;
      }

      const account = await findAccountForRole(normalizedRole, contactDetails);
      if (!account) {
        throw new Error("Invalid credentials.");
      }

      const pseudoToken = createPseudoJwt({
        sub: account.id,
        role: normalizedRole,
        contactDetails: account.contactDetails
      });

      const sessionUser = buildSessionUser(account, normalizedRole);
      persistSession(pseudoToken, sessionUser);
      return sessionUser;
    } catch (error) {
      throw new Error(extractApiError(error));
    } finally {
      setAuthLoading(false);
    }
  };

  const registerPatientAccount = async ({
    fullName,
    age,
    contactDetails,
    password,
    primaryDoctorId
  }) => {
    try {
      setAuthLoading(true);

      const createdPatient = await registerPatient(
        {
          fullName,
          age: Number(age),
          contactDetails,
          password
        },
        primaryDoctorId || undefined
      );

      const pseudoToken = createPseudoJwt({
        sub: createdPatient.id,
        role: "PATIENT",
        contactDetails: createdPatient.contactDetails
      });

      const sessionUser = buildSessionUser(createdPatient, "PATIENT");
      persistSession(pseudoToken, sessionUser);
      return sessionUser;
    } catch (error) {
      throw new Error(extractApiError(error));
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = () => {
    clearSession();
  };

  const value = useMemo(
    () => ({
      token,
      user,
      authLoading,
      isAuthenticated: Boolean(token && user?.id),
      login,
      registerPatientAccount,
      logout
    }),
    [token, user, authLoading]
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
