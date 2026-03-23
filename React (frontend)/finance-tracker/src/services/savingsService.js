import axiosClient from "../api/axiosClient";
import { requestWithPayloadFallback } from "../utils/httpFallback";

const cleanPayload = (payload) =>
  Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined && value !== null && value !== "")
  );

export const getAllSavings = async () => {
  const response = await axiosClient.get("/api/savings");
  return response.data || [];
};

export const createSavingsGoal = async (goalInput) => {
  const targetAmount = Number(goalInput.targetAmount);
  const currentAmount = Number(goalInput.currentAmount || 0);

  const payloads = [
    cleanPayload({
      name: goalInput.name,
      targetAmount,
      currentAmount,
    }),
    cleanPayload({
      goalName: goalInput.name,
      targetAmount,
      currentAmount,
    }),
    cleanPayload({
      goalName: goalInput.name,
      goalAmount: targetAmount,
      savedAmount: currentAmount,
    }),
  ];

  const response = await requestWithPayloadFallback((payload) => axiosClient.post("/api/savings", payload), payloads);
  return response.data;
};

export const deleteSavingsById = async (savingsId) => {
  await axiosClient.delete(`/api/savings/${savingsId}`);
};
