import { Grid, Stack, Typography } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import CategoryForm from "../components/forms/CategoryForm";
import ExpenseForm from "../components/forms/ExpenseForm";
import ExpenseTable from "../components/tables/ExpenseTable";
import LoadingState from "../components/LoadingState";
import { createCategory, getAllCategories } from "../services/categoryService";
import { createExpense, deleteExpenseById, getAllExpenses } from "../services/expenseService";
import { getErrorMessage } from "../utils/errorMessage";
import { normalizeCategory, normalizeExpense } from "../utils/normalizers";

const ExpensePage = () => {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submittingExpense, setSubmittingExpense] = useState(false);
  const [submittingCategory, setSubmittingCategory] = useState(false);

  const loadPageData = useCallback(async () => {
    setLoading(true);

    try {
      const [expenseData, categoryData] = await Promise.all([getAllExpenses(), getAllCategories()]);
      setExpenses((expenseData || []).map(normalizeExpense));
      setCategories((categoryData || []).map(normalizeCategory));
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to fetch expenses and categories."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPageData();
  }, [loadPageData]);

  const handleCreateCategory = async (categoryInput) => {
    setSubmittingCategory(true);

    try {
      await createCategory(categoryInput);
      toast.success("Category created.");
      await loadPageData();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to create category."));
    } finally {
      setSubmittingCategory(false);
    }
  };

  const handleCreateExpense = async (expenseInput) => {
    if (!expenseInput.amount || expenseInput.amount <= 0) {
      toast.error("Expense amount must be greater than 0.");
      return;
    }

    if (!expenseInput.categoryName && !expenseInput.categoryId) {
      toast.error("Please provide an expense category.");
      return;
    }

    setSubmittingExpense(true);

    const selectedCategory = categories.find(
      (category) => String(category.id) === String(expenseInput.categoryId)
    );

    try {
      await createExpense({
        ...expenseInput,
        categoryName: expenseInput.categoryName || selectedCategory?.name || "Uncategorized",
      });
      toast.success("Expense added successfully.");
      await loadPageData();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to add expense."));
    } finally {
      setSubmittingExpense(false);
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    if (!expenseId) {
      toast.error("This expense record cannot be deleted because ID is missing.");
      return;
    }

    const isConfirmed = window.confirm("Delete this expense record?");

    if (!isConfirmed) {
      return;
    }

    try {
      await deleteExpenseById(expenseId);
      toast.success("Expense deleted.");
      await loadPageData();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to delete expense."));
    }
  };

  return (
    <Stack spacing={3}>
      <Stack spacing={1}>
        <Typography variant="h4">Expense Management</Typography>
        <Typography variant="body2" color="text.secondary">
          Capture daily spending, assign categories, and keep your expense history organized.
        </Typography>
      </Stack>

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <ExpenseForm
            categories={categories}
            onSubmit={handleCreateExpense}
            isSubmitting={submittingExpense}
          />
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <CategoryForm onSubmit={handleCreateCategory} isSubmitting={submittingCategory} />
        </Grid>
      </Grid>

      {loading ? (
        <LoadingState label="Loading expenses..." />
      ) : (
        <ExpenseTable expenses={expenses} onDelete={handleDeleteExpense} />
      )}
    </Stack>
  );
};

export default ExpensePage;
