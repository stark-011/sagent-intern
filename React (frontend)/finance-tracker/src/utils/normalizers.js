const FALLBACK_DATE = () => new Date().toISOString().slice(0, 10);

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toString = (value, fallback = "") => {
  if (typeof value === "string") {
    return value.trim() || fallback;
  }

  if (typeof value === "number") {
    return String(value);
  }

  return fallback;
};

const toDate = (value) => {
  if (!value) {
    return FALLBACK_DATE();
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return FALLBACK_DATE();
  }

  return parsed.toISOString().slice(0, 10);
};

const pickId = (item) =>
  item?.id ??
  item?.userId ??
  item?.incomeId ??
  item?.expenseId ??
  item?.categoryId ??
  item?.savingsId ??
  item?.balanceId ??
  null;

const pickFirst = (values, fallback) => {
  for (const value of values) {
    if (value !== undefined && value !== null && `${value}`.trim() !== "") {
      return value;
    }
  }

  return fallback;
};

export const normalizeUser = (user = {}) => ({
  id: pickId(user),
  name: toString(pickFirst([user.name, user.fullName], "User"), "User"),
  email: toString(user.email, ""),
  password: toString(user.password, ""),
});

export const normalizeIncome = (income = {}) => ({
  id: pickId(income),
  source: toString(pickFirst([income.source, income.type, income.name], "Income"), "Income"),
  amount: toNumber(pickFirst([income.amount, income.incomeAmount], 0)),
  date: toDate(pickFirst([income.date, income.incomeDate, income.createdAt], null)),
  description: toString(pickFirst([income.description, income.note], ""), ""),
  raw: income,
});

const extractCategoryName = (expense) => {
  if (typeof expense?.category === "string") {
    return toString(expense.category, "Uncategorized");
  }

  if (expense?.category && typeof expense.category === "object") {
    return toString(
      pickFirst([expense.category.name, expense.category.categoryName, expense.category.title], "Uncategorized"),
      "Uncategorized"
    );
  }

  return toString(pickFirst([expense?.categoryName, expense?.type], "Uncategorized"), "Uncategorized");
};

const extractCategoryId = (expense) => {
  if (expense?.category && typeof expense.category === "object") {
    return pickId(expense.category);
  }

  return pickId({ categoryId: expense?.categoryId, id: null });
};

export const normalizeExpense = (expense = {}) => ({
  id: pickId(expense),
  amount: toNumber(pickFirst([expense.amount, expense.expenseAmount], 0)),
  date: toDate(pickFirst([expense.date, expense.expenseDate, expense.createdAt], null)),
  description: toString(pickFirst([expense.description, expense.note], ""), ""),
  category: extractCategoryName(expense),
  categoryId: extractCategoryId(expense),
  raw: expense,
});

export const normalizeCategory = (category = {}) => ({
  id: pickId(category),
  name: toString(pickFirst([category.name, category.categoryName, category.title], "Category"), "Category"),
  raw: category,
});

export const normalizeSavings = (savings = {}) => ({
  id: pickId(savings),
  name: toString(pickFirst([savings.name, savings.goalName, savings.title], "Savings Goal"), "Savings Goal"),
  targetAmount: toNumber(pickFirst([savings.targetAmount, savings.goalAmount, savings.amount], 0)),
  currentAmount: toNumber(pickFirst([savings.currentAmount, savings.savedAmount, savings.progressAmount], 0)),
  raw: savings,
});

export const normalizeBalance = (balance = {}) => ({
  id: pickId(balance),
  amount: toNumber(
    pickFirst([balance.amount, balance.currentBalance, balance.balanceAmount, balance.totalBalance], 0)
  ),
  raw: balance,
});

export const normalizeAuthUser = (payload = {}) => {
  if (payload?.user && typeof payload.user === "object") {
    return normalizeUser(payload.user);
  }

  return normalizeUser(payload);
};

export const extractToken = (payload = {}) =>
  toString(pickFirst([payload.token, payload.accessToken, payload.jwt, payload.idToken], ""), "");

export const toCurrencyNumber = (value) => toNumber(value, 0);
