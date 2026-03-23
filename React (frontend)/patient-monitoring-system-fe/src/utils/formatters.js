import dayjs from "dayjs";

export const formatDateTime = (value) => {
  if (!value) {
    return "-";
  }

  const parsed = dayjs(value);
  if (!parsed.isValid()) {
    return "-";
  }

  return parsed.format("DD MMM YYYY, HH:mm");
};

export const toDateTimeLocal = (value) => {
  if (!value) {
    return "";
  }

  const parsed = dayjs(value);
  if (!parsed.isValid()) {
    return "";
  }

  return parsed.format("YYYY-MM-DDTHH:mm");
};

export const sortByDateAsc = (items, key) => {
  return [...items].sort((a, b) => new Date(a?.[key] || 0) - new Date(b?.[key] || 0));
};

export const sortByDateDesc = (items, key) => {
  return [...items].sort((a, b) => new Date(b?.[key] || 0) - new Date(a?.[key] || 0));
};

export const getFeedbackReadFlag = (feedback) => {
  if (typeof feedback?.read === "boolean") {
    return feedback.read;
  }
  if (typeof feedback?.isRead === "boolean") {
    return feedback.isRead;
  }
  return false;
};

export const normalizeRole = (role) => {
  if (!role) {
    return "";
  }
  return String(role).trim().toUpperCase();
};

export const parseBloodPressure = (bpValue) => {
  if (!bpValue || typeof bpValue !== "string") {
    return { systolic: null, diastolic: null };
  }

  const [systolicRaw, diastolicRaw] = bpValue.split("/");
  const systolic = Number.parseInt(systolicRaw, 10);
  const diastolic = Number.parseInt(diastolicRaw, 10);

  return {
    systolic: Number.isNaN(systolic) ? null : systolic,
    diastolic: Number.isNaN(diastolic) ? null : diastolic
  };
};
