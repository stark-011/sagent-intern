import { Alert, Stack, Typography } from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import BudgetForm from "../components/forms/BudgetForm";
import BudgetStatusTable from "../components/tables/BudgetStatusTable";
import LoadingState from "../components/LoadingState";
import { getAllCategories } from "../services/categoryService";
import { getAllExpenses } from "../services/expenseService";
import { getBudgetLimits, removeBudgetLimit, saveBudgetLimit } from "../services/budgetService";
import { calculateCategorySpendMap } from "../utils/finance";
import { getErrorMessage } from "../utils/errorMessage";
import { normalizeCategory, normalizeExpense } from "../utils/normalizers";

const BudgetPage = () => {
  const [categories, setCategories] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [budgetMap, setBudgetMap] = useState({});
  const [loading, setLoading] = useState(true);

  const loadBudgetData = useCallback(async () => {
    setLoading(true);

    try {
      const [categoryData, expenseData] = await Promise.all([getAllCategories(), getAllExpenses()]);
      setCategories((categoryData || []).map(normalizeCategory));
      setExpenses((expenseData || []).map(normalizeExpense));
      setBudgetMap(getBudgetLimits());
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to load budget page data."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBudgetData();
  }, [loadBudgetData]);

  const spendingByCategory = useMemo(() => calculateCategorySpendMap(expenses), [expenses]);

  const budgetRows = useMemo(
    () =>
      Object.entries(budgetMap)
        .map(([category, limit]) => {
          const spent = spendingByCategory[category] || 0;
          return {
            category,
            limit,
            spent,
            remaining: limit - spent,
          };
        })
        .sort((first, second) => first.category.localeCompare(second.category)),
    [budgetMap, spendingByCategory]
  );

  const exceededBudgets = useMemo(
    () => budgetRows.filter((row) => row.remaining < 0),
    [budgetRows]
  );

  const handleSaveBudget = ({ categoryName, limit }) => {
    if (!categoryName) {
      toast.error("Please choose a category.");
      return;
    }

    if (!Number.isFinite(limit) || limit <= 0) {
      toast.error("Budget limit must be greater than 0.");
      return;
    }

    saveBudgetLimit(categoryName, limit);
    setBudgetMap(getBudgetLimits());
    toast.success("Budget saved.");
  };

  const handleRemoveBudget = (categoryName) => {
    removeBudgetLimit(categoryName);
    setBudgetMap(getBudgetLimits());
    toast.success(`Removed budget for ${categoryName}.`);
  };

  return (
    <Stack spacing={3}>
      <Stack spacing={1}>
        <Typography variant="h4">Budget Setting</Typography>
        <Typography variant="body2" color="text.secondary">
          Set monthly limits by category and get immediate warnings when spending exceeds targets.
        </Typography>
      </Stack>

      <BudgetForm categories={categories} existingBudgets={budgetMap} onSubmit={handleSaveBudget} />

      {exceededBudgets.map((row) => (
        <Alert key={row.category} severity="warning">
          Budget exceeded for {row.category}: over by ${Math.abs(row.remaining).toFixed(2)}.
        </Alert>
      ))}

      {loading ? (
        <LoadingState label="Loading budgets..." />
      ) : (
        <BudgetStatusTable rows={budgetRows} onRemoveBudget={handleRemoveBudget} />
      )}
    </Stack>
  );
};

export default BudgetPage;
