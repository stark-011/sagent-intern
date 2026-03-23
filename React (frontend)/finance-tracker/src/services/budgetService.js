const BUDGET_STORAGE_KEY = "finance_tracker_budget_limits";

const readBudgets = () => {
  try {
    const rawValue = localStorage.getItem(BUDGET_STORAGE_KEY);

    if (!rawValue) {
      return {};
    }

    const parsedValue = JSON.parse(rawValue);
    return parsedValue && typeof parsedValue === "object" ? parsedValue : {};
  } catch {
    return {};
  }
};

const writeBudgets = (budgets) => {
  localStorage.setItem(BUDGET_STORAGE_KEY, JSON.stringify(budgets));
};

export const getBudgetLimits = () => readBudgets();

export const saveBudgetLimit = (categoryName, monthlyLimit) => {
  const normalizedCategory = (categoryName || "").trim();

  if (!normalizedCategory) {
    return;
  }

  const parsedLimit = Number(monthlyLimit);

  if (!Number.isFinite(parsedLimit) || parsedLimit < 0) {
    return;
  }

  const currentBudgets = readBudgets();

  currentBudgets[normalizedCategory] = parsedLimit;
  writeBudgets(currentBudgets);
};

export const removeBudgetLimit = (categoryName) => {
  const normalizedCategory = (categoryName || "").trim();

  if (!normalizedCategory) {
    return;
  }

  const currentBudgets = readBudgets();

  delete currentBudgets[normalizedCategory];
  writeBudgets(currentBudgets);
};
