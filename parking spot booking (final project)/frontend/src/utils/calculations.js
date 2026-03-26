import { getDiffHours } from "./validation";

export const estimateBookingAmount = (startTime, endTime, hourlyRate = 0) => {
  const hours = Math.max(1, Math.ceil(getDiffHours(startTime, endTime)));
  return { hours, amount: hours * Number(hourlyRate || 0) };
};
