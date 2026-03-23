import { Stack, Typography } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import IncomeForm from "../components/forms/IncomeForm";
import IncomeTable from "../components/tables/IncomeTable";
import LoadingState from "../components/LoadingState";
import { createIncome, deleteIncomeById, getAllIncomes } from "../services/incomeService";
import { getErrorMessage } from "../utils/errorMessage";
import { normalizeIncome } from "../utils/normalizers";

const IncomePage = () => {
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadIncomes = useCallback(async () => {
    setLoading(true);

    try {
      const data = await getAllIncomes();
      setIncomes((data || []).map(normalizeIncome));
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to fetch incomes."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadIncomes();
  }, [loadIncomes]);

  const handleCreateIncome = async (incomeInput) => {
    if (!incomeInput.source || !incomeInput.amount || incomeInput.amount <= 0) {
      toast.error("Please provide valid income source and amount.");
      return;
    }

    setSubmitting(true);

    try {
      await createIncome(incomeInput);
      toast.success("Income added successfully.");
      await loadIncomes();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to add income."));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteIncome = async (incomeId) => {
    if (!incomeId) {
      toast.error("This income record cannot be deleted because ID is missing.");
      return;
    }

    const isConfirmed = window.confirm("Delete this income record?");

    if (!isConfirmed) {
      return;
    }

    try {
      await deleteIncomeById(incomeId);
      toast.success("Income deleted.");
      await loadIncomes();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to delete income."));
    }
  };

  return (
    <Stack spacing={3}>
      <Stack spacing={1}>
        <Typography variant="h4">Income Management</Typography>
        <Typography variant="body2" color="text.secondary">
          Track all income streams including salary, freelance, and other sources.
        </Typography>
      </Stack>

      <IncomeForm onSubmit={handleCreateIncome} isSubmitting={submitting} />

      {loading ? <LoadingState label="Loading incomes..." /> : <IncomeTable incomes={incomes} onDelete={handleDeleteIncome} />}
    </Stack>
  );
};

export default IncomePage;
