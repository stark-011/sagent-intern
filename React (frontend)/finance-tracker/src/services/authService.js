import axiosClient from "../api/axiosClient";
import { createUser, getAllUsers } from "./userService";
import { isAuthEndpointUnavailable, requestWithEndpointFallback } from "../utils/httpFallback";
import { extractToken, normalizeAuthUser } from "../utils/normalizers";

const AUTH_LOGIN_ENDPOINTS = ["/api/auth/login", "/auth/login", "/api/users/login"];
const AUTH_REGISTER_ENDPOINTS = ["/api/auth/register", "/auth/register"];
const SHOULD_TRY_AUTH_ENDPOINTS = process.env.REACT_APP_ENABLE_AUTH_ENDPOINTS === "true";

const createLocalToken = (email) => {
  const safeEmail = (email || "user@example.com").toLowerCase();
  return `local-${btoa(`${safeEmail}:${Date.now()}`)}`;
};

const buildAuthResult = (payload, fallbackUser, fallbackWarning = "") => {
  const token = extractToken(payload);
  const user = normalizeAuthUser(payload.user ? payload.user : payload);
  const resolvedUser = user.email ? user : normalizeAuthUser(fallbackUser);

  if (token) {
    return {
      token,
      user: resolvedUser,
      isFallbackAuth: false,
      warning: fallbackWarning,
    };
  }

  return {
    token: createLocalToken(resolvedUser.email),
    user: resolvedUser,
    isFallbackAuth: true,
    warning:
      fallbackWarning ||
      "Using local JWT fallback because auth token was not returned by backend login endpoints.",
  };
};

const loginViaDedicatedAuthEndpoint = async (credentials) => {
  const response = await requestWithEndpointFallback(
    AUTH_LOGIN_ENDPOINTS.map((endpoint) => () => axiosClient.post(endpoint, credentials))
  );

  return buildAuthResult(response.data, { email: credentials.email });
};

const loginViaUsersControllerFallback = async (credentials) => {
  const users = await getAllUsers();
  const matchedUser = users.find(
    (user) => (user.email || "").toLowerCase() === (credentials.email || "").toLowerCase()
  );

  if (!matchedUser) {
    throw new Error("No user found for this email. Please register first.");
  }

  if (matchedUser.password && matchedUser.password !== credentials.password) {
    throw new Error("Invalid credentials.");
  }

  return {
    token: createLocalToken(matchedUser.email),
    user: normalizeAuthUser(matchedUser),
    isFallbackAuth: true,
    warning:
      "Using /api/users fallback login because dedicated auth endpoints are not available in backend.",
  };
};

export const loginUser = async (credentials) => {
  if (!SHOULD_TRY_AUTH_ENDPOINTS) {
    return loginViaUsersControllerFallback(credentials);
  }

  try {
    return await loginViaDedicatedAuthEndpoint(credentials);
  } catch (error) {
    if (!isAuthEndpointUnavailable(error)) {
      throw error;
    }

    return loginViaUsersControllerFallback(credentials);
  }
};

const registerViaAuthEndpoint = async (registrationPayload) => {
  const response = await requestWithEndpointFallback(
    AUTH_REGISTER_ENDPOINTS.map((endpoint) => () => axiosClient.post(endpoint, registrationPayload))
  );

  return buildAuthResult(response.data, registrationPayload);
};

export const registerUser = async (registrationPayload) => {
  if (!SHOULD_TRY_AUTH_ENDPOINTS) {
    const createdUser = await createUser(registrationPayload);

    return {
      token: createLocalToken(createdUser.email || registrationPayload.email),
      user: normalizeAuthUser(createdUser),
      isFallbackAuth: true,
      warning:
        "Using /api/users registration because auth endpoints are disabled by default. Set REACT_APP_ENABLE_AUTH_ENDPOINTS=true to use /api/auth endpoints.",
    };
  }

  try {
    return await registerViaAuthEndpoint(registrationPayload);
  } catch (error) {
    if (!isAuthEndpointUnavailable(error)) {
      throw error;
    }

    const createdUser = await createUser(registrationPayload);

    return {
      token: createLocalToken(createdUser.email || registrationPayload.email),
      user: normalizeAuthUser(createdUser),
      isFallbackAuth: true,
      warning:
        "Using /api/users fallback registration because dedicated auth endpoints are not available in backend.",
    };
  }
};
