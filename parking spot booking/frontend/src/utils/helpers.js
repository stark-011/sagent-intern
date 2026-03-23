export const uid = (prefix = "id") =>
  `${prefix}_${Math.random().toString(36).slice(2, 8)}${Date.now()
    .toString()
    .slice(-4)}`;

export const sleep = (ms = 400) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

export const clamp = (num, min, max) => Math.min(Math.max(num, min), max);
