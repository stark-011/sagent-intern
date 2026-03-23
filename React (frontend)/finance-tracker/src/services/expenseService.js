import axiosClient from "../api/axiosClient";
import { requestWithPayloadFallback } from "../utils/httpFallback";

const cleanPayload = (payload) =>
  Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined && value !== null && value !== "")
  );

export const getAllExpenses = async () => {
  const response = await axiosClient.get("/api/expenses");
  return response.data || [];
};

export const createExpense = async (expenseInput) => {
  const amount = Number(expenseInput.amount);

  const payloads = [
    cleanPayload({
      amount,
      date: expenseInput.date,
      description: expenseInput.description,
      category: expenseInput.categoryName,
    }),
    cleanPayload({
      amount,
      date: expenseInput.date,
      description: expenseInput.description,
      categoryId: expenseInput.categoryId,
    }),
    cleanPayload({
      amount,
      date: expenseInput.date,
      description: expenseInput.description,
      category: expenseInput.categoryId
        ? {
            id: expenseInput.categoryId,
            name: expenseInput.categoryName,
          }
        : expenseInput.categoryName,
    }),
    cleanPayload({
      expenseAmount: amount,
      expenseDate: expenseInput.date,
      description: expenseInput.description,
      category: expenseInput.categoryName,
    }),
  ];

  const response = await requestWithPayloadFallback((payload) => axiosClient.post("/api/expenses", payload), payloads);
  return response.data;
};

export const deleteExpenseById = async (expenseId) => {
  await axiosClient.delete(`/api/expenses/${expenseId}`);
};
