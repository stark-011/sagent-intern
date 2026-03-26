/**
 * Shared API helper utilities used across all service files.
 * Centralises duplicated logic so each service file stays lean.
 */
import apiClient from "./apiClient.js";

// ── Response helpers ────────────────────────────────────────────────

/**
 * Extract the nested payload from an Axios response.
 * The backend wraps every response as `{ success, data: <payload> }`.
 *
 * @param {import("axios").AxiosResponse} response - Axios response object
 * @returns {*} The payload, or undefined
 */
export const unwrap = (response) => response?.data?.data;

// ── String / number sanitisers ──────────────────────────────────────

/**
 * Trim a value to a non-empty string, or return undefined.
 * Treats null, undefined, and blank strings as "empty".
 *
 * @param {*} value
 * @returns {string | undefined}
 */
export const toTrimmed = (value) => {
  if (value === null || value === undefined) return undefined;
  const text = String(value).trim();
  return text || undefined;
};

/**
 * Parse a value to a finite number, or return undefined.
 *
 * @param {*} value
 * @returns {number | undefined}
 */
export const toNumber = (value) => {
  if (value === null || value === undefined || value === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

/**
 * Safely convert a numeric-or-blank field to a Number, falling back to null.
 * Useful for optional pricing fields (peak_hour_rate, special_day_rate).
 *
 * @param {*} value
 * @returns {number | null}
 */
export const toOptionalNumber = (value) => {
  if (value === "" || value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

// ── Date / time helpers ─────────────────────────────────────────────

/**
 * Convert a date-like value into a `YYYY-MM-DDTHH:mm:ss` string that
 * the backend's `LocalDateTime` parser expects.
 *
 * Handles plain strings ("2025-04-01T09:30"), Date objects, and timestamps.
 *
 * @param {string | Date | number} value
 * @returns {string | undefined}
 */
export const toLocalDateTime = (value) => {
  if (!value) return undefined;

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return undefined;
    // Already "yyyy-MM-ddTHH:mm" — append seconds
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(trimmed)) {
      return `${trimmed}:00`;
    }
    // Already "yyyy-MM-ddTHH:mm:ss" — ready
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(trimmed)) {
      return trimmed;
    }
    value = trimmed;
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;

  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

/**
 * Normalise a date string to ISO `YYYY-MM-DD` format.
 * Accepts `YYYY-MM-DD` (pass-through) or `DD-MM-YYYY` (re-ordered).
 *
 * @param {*} value
 * @returns {string | undefined}
 */
export const toIsoDate = (value) => {
  const text = toTrimmed(value);
  if (!text) return undefined;

  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;

  const dmyMatch = text.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (dmyMatch) {
    const [, day, month, year] = dmyMatch;
    return `${year}-${month}-${day}`;
  }

  return text;
};

export default apiClient;
