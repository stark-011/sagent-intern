import { toCurrencyNumber } from "./normalizers";

export const calculateTotalAmount = (items) =>
  items.reduce((total, item) => total + toCurrencyNumber(item.amount), 0);

export const formatMonthLabel = (dateValue) => {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return date.toLocaleString("en-US", { month: "short", year: "numeric" });
};

export const groupExpensesByCategory = (expenses) => {
  const grouped = expenses.reduce((accumulator, expense) => {
    const category = expense.category || "Uncategorized";
    accumulator[category] = (accumulator[category] || 0) + toCurrencyNumber(expense.amount);
    return accumulator;
  }, {});

  return Object.entries(grouped)
    .map(([name, value]) => ({ name, value }))
    .sort((first, second) => second.value - first.value);
};

export const groupExpensesByMonth = (expenses) => {
  const grouped = expenses.reduce((accumulator, expense) => {
    const month = formatMonthLabel(expense.date);
    accumulator[month] = (accumulator[month] || 0) + toCurrencyNumber(expense.amount);
    return accumulator;
  }, {});

  return Object.entries(grouped)
    .map(([month, total]) => ({ month, total }))
    .sort((first, second) => new Date(`1 ${first.month}`) - new Date(`1 ${second.month}`));
};

export const calculateGoalProgress = (currentAmount, targetAmount) => {
  const target = toCurrencyNumber(targetAmount);

  if (target <= 0) {
    return 0;
  }

  const progress = (toCurrencyNumber(currentAmount) / target) * 100;
  return Math.max(0, Math.min(progress, 100));
};

export const calculateSavingsTotals = (goals) => {
  const targetTotal = goals.reduce((sum, goal) => sum + toCurrencyNumber(goal.targetAmount), 0);
  const currentTotal = goals.reduce((sum, goal) => sum + toCurrencyNumber(goal.currentAmount), 0);

  return {
    targetTotal,
    currentTotal,
    progressPercent: calculateGoalProgress(currentTotal, targetTotal),
  };
};

export const calculateCategorySpendMap = (expenses) =>
  expenses.reduce((accumulator, expense) => {
    const category = expense.category || "Uncategorized";
    accumulator[category] = (accumulator[category] || 0) + toCurrencyNumber(expense.amount);
    return accumulator;
  }, {});
