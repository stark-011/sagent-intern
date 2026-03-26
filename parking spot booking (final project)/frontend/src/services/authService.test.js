import assert from "node:assert/strict";
import { afterEach, beforeEach, test } from "node:test";

import { authService } from "./authService.js";
import apiClient from "./apiClient.js";
import { clearSession, getSession, setSession } from "./storage.js";

const wrap = (data) => ({
  data: {
    data,
  },
});

const assertIsoTimestamp = (value) => {
  assert.equal(typeof value, "string");
  assert.ok(Number.isFinite(Date.parse(value)));
};

beforeEach(() => {
  clearSession();
});

afterEach(() => {
  clearSession();
});

test("login sends the expected payload, persists the session, and uses the role route fallback", async (t) => {
  const payload = {
    email: "driver@example.com",
    password: "secret123",
    role: "driver",
    ignored: "value",
  };
  const responseData = {
    token: "token-123",
    user: { id: 1, full_name: "Driver One" },
    role: "driver",
    wallet: { balance: 42 },
  };
  const post = t.mock.method(apiClient, "post", async (url, body) => {
    assert.equal(url, "/auth/login");
    assert.deepEqual(body, {
      email: "driver@example.com",
      password: "secret123",
      role: "driver",
    });
    return wrap(responseData);
  });

  const result = await authService.login(payload);

  assert.equal(post.mock.calls.length, 1);
  assert.equal(result.token, "token-123");
  assert.deepEqual(result.user, { id: 1, full_name: "Driver One" });
  assert.equal(result.role, "driver");
  assert.equal(result.redirectTo, "/user/dashboard");
  assert.deepEqual(result.wallet, { balance: 42 });
  assertIsoTimestamp(result.login_at);
  assert.deepEqual(getSession(), {
    token: "token-123",
    user: { id: 1, full_name: "Driver One" },
    login_at: result.login_at,
  });
});

test("login respects a backend redirect override and stores a null user cleanly", async (t) => {
  t.mock.method(apiClient, "post", async () =>
    wrap({
      token: "token-override",
      user: null,
      role: "unknown",
      redirect_to: "/custom-home",
      wallet: null,
    })
  );

  const result = await authService.login({
    email: "custom@example.com",
    password: "secret123",
    role: "unknown",
  });

  assert.equal(result.redirectTo, "/custom-home");
  assert.equal(result.user, null);
  assert.deepEqual(getSession(), {
    token: "token-override",
    user: null,
    login_at: result.login_at,
  });
});

test("register sends the expected payload and returns the persisted session details", async (t) => {
  const post = t.mock.method(apiClient, "post", async (url, body) => {
    assert.equal(url, "/auth/register");
    assert.deepEqual(body, {
      full_name: "New User",
      email: "new@example.com",
      phone: "5551234567",
      password: "secret123",
      confirm_password: "secret123",
      role: "lender",
    });
    return wrap({
      token: "register-token",
      user: { id: 9, full_name: "New User" },
      role: "lender",
      wallet: { balance: 0 },
    });
  });

  const result = await authService.register({
    full_name: "New User",
    email: "new@example.com",
    phone: "5551234567",
    password: "secret123",
    confirm_password: "secret123",
    role: "lender",
  });

  assert.equal(post.mock.calls.length, 1);
  assert.equal(result.token, "register-token");
  assert.deepEqual(result.user, { id: 9, full_name: "New User" });
  assert.equal(result.role, "lender");
  assert.equal(result.redirectTo, "/lender/dashboard");
  assert.deepEqual(result.wallet, { balance: 0 });
  assertIsoTimestamp(result.login_at);
  assert.deepEqual(getSession(), {
    token: "register-token",
    user: { id: 9, full_name: "New User" },
    login_at: result.login_at,
  });
});

test("me returns the backend payload and refreshes the stored user when a token exists", async (t) => {
  setSession({
    token: "existing-token",
    user: { id: 1, full_name: "Old Name" },
    login_at: "2026-03-17T10:00:00.000Z",
  });
  t.mock.method(apiClient, "get", async (url) => {
    assert.equal(url, "/auth/me");
    return wrap({
      user: { id: 1, full_name: "Updated Name" },
      wallet: { balance: 15 },
    });
  });

  const result = await authService.me();

  assert.deepEqual(result, {
    user: { id: 1, full_name: "Updated Name" },
    wallet: { balance: 15 },
  });
  assert.deepEqual(getSession(), {
    token: "existing-token",
    user: { id: 1, full_name: "Updated Name" },
    login_at: "2026-03-17T10:00:00.000Z",
  });
});

test("forgotPassword posts the email and unwraps the response", async (t) => {
  const post = t.mock.method(apiClient, "post", async (url, body) => {
    assert.equal(url, "/auth/forgot-password");
    assert.deepEqual(body, { email: "reset@example.com" });
    return wrap({ message: "Reset email sent" });
  });

  const result = await authService.forgotPassword("reset@example.com");

  assert.equal(post.mock.calls.length, 1);
  assert.deepEqual(result, { message: "Reset email sent" });
});

test("getCurrentUser returns the session user when present and null otherwise", () => {
  setSession({
    token: "token-123",
    user: { id: 3, full_name: "Current User" },
    login_at: "2026-03-17T10:00:00.000Z",
  });
  assert.deepEqual(authService.getCurrentUser(), { id: 3, full_name: "Current User" });

  clearSession();
  assert.equal(authService.getCurrentUser(), null);
});

test("getCurrentSession returns the full stored session", () => {
  const session = {
    token: "token-123",
    user: { id: 5, full_name: "Stored User" },
    login_at: "2026-03-17T10:00:00.000Z",
  };
  setSession(session);

  assert.deepEqual(authService.getCurrentSession(), session);
});

test("logout clears the session and resolves to true", async () => {
  setSession({
    token: "token-123",
    user: { id: 5, full_name: "Stored User" },
    login_at: "2026-03-17T10:00:00.000Z",
  });

  const result = await authService.logout();

  assert.equal(result, true);
  assert.equal(getSession(), null);
});

test("updateProfile sends only editable fields, returns the updated user, and refreshes the session", async (t) => {
  setSession({
    token: "profile-token",
    user: { id: 8, full_name: "Old Profile" },
    login_at: "2026-03-17T10:00:00.000Z",
  });
  const put = t.mock.method(apiClient, "put", async (url, body) => {
    assert.equal(url, "/user/profile");
    assert.deepEqual(body, {
      full_name: "Updated Profile",
      email: "updated@example.com",
      phone: "1234567890",
    });
    return wrap({
      id: 8,
      full_name: "Updated Profile",
      email: "updated@example.com",
      phone: "1234567890",
    });
  });

  const result = await authService.updateProfile(999, {
    full_name: "Updated Profile",
    email: "updated@example.com",
    phone: "1234567890",
    ignored: "value",
  });

  assert.equal(put.mock.calls.length, 1);
  assert.deepEqual(result, {
    id: 8,
    full_name: "Updated Profile",
    email: "updated@example.com",
    phone: "1234567890",
  });
  assert.deepEqual(getSession(), {
    token: "profile-token",
    user: {
      id: 8,
      full_name: "Updated Profile",
      email: "updated@example.com",
      phone: "1234567890",
    },
    login_at: "2026-03-17T10:00:00.000Z",
  });
});

test("updatePassword sends the current and new passwords and resolves to true", async (t) => {
  const put = t.mock.method(apiClient, "put", async (url, body) => {
    assert.equal(url, "/user/profile/password");
    assert.deepEqual(body, {
      current_password: "old-secret",
      new_password: "new-secret",
      confirm_password: "new-secret",
    });
    return wrap(null);
  });

  const result = await authService.updatePassword(999, "old-secret", "new-secret");

  assert.equal(put.mock.calls.length, 1);
  assert.equal(result, true);
});
