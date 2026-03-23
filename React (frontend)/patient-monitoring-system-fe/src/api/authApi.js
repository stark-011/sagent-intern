import api from "./axiosConfig";

const AUTH_LOGIN_ENDPOINT = import.meta.env.VITE_AUTH_LOGIN_ENDPOINT || "/api/auth/login";

const encodeBase64Url = (value) => {
  const utf8 = encodeURIComponent(value).replace(
    /%([0-9A-F]{2})/g,
    (_, hex) => String.fromCharCode(Number.parseInt(hex, 16))
  );
  return btoa(utf8).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
};

export const createPseudoJwt = (payload) => {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "HS256", typ: "JWT" };
  const body = {
    iat: now,
    exp: now + 60 * 60 * 24,
    ...payload
  };

  const encodedHeader = encodeBase64Url(JSON.stringify(header));
  const encodedBody = encodeBase64Url(JSON.stringify(body));
  return `${encodedHeader}.${encodedBody}.mock_signature`;
};

export const loginWithBackend = async (payload) => {
  try {
    const { data } = await api.post(AUTH_LOGIN_ENDPOINT, payload);
    return data;
  } catch (error) {
    const status = error?.response?.status;
    if (status === 404 || status === 405) {
      return null;
    }
    throw error;
  }
};
