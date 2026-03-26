export const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const validatePhone = (phone) =>
  /^[+]?[0-9][0-9\s-]{8,14}$/.test(phone || "");

export const validateRequired = (value) =>
  value !== null && value !== undefined && String(value).trim().length > 0;

export const getDiffHours = (startTime, endTime) => {
  if (!startTime || !endTime) return 0;
  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();
  const diff = (end - start) / (1000 * 60 * 60);
  return Number(diff > 0 ? diff.toFixed(2) : 0);
};
