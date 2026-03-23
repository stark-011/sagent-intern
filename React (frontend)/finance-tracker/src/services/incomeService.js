import axiosClient from "../api/axiosClient";
import { requestWithPayloadFallback } from "../utils/httpFallback";

const cleanPayload = (payload) =>
  Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined && value !== null && value !== "")
  );

export const getAllIncomes = async () => {
  const response = await axiosClient.get("/api/incomes");
  return response.data || [];
};

export const createIncome = async (incomeInput) => {
  const amount = Number(incomeInput.amount);

  const payloads = [
    cleanPayload({
      source: incomeInput.source,
      amount,
      date: incomeInput.date,
      description: incomeInput.description,
    }),
    cleanPayload({
      source: incomeInput.source,
      incomeAmount: amount,
      incomeDate: incomeInput.date,
      description: incomeInput.description,
    }),
    cleanPayload({
      name: incomeInput.source,
      amount,
      date: incomeInput.date,
      description: incomeInput.description,
    }),
  ];

  const response = await requestWithPayloadFallback((payload) => axiosClient.post("/api/incomes", payload), payloads);
  return response.data;
};

export const deleteIncomeById = async (incomeId) => {
  await axiosClient.delete(`/api/incomes/${incomeId}`);
};
