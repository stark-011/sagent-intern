import DeleteIcon from "@mui/icons-material/Delete";
import {
  IconButton,
  LinearProgress,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import EmptyState from "../components/EmptyState";
import LoadingState from "../components/LoadingState";
import SavingsGoalForm from "../components/forms/SavingsGoalForm";
import { createSavingsGoal, deleteSavingsById, getAllSavings } from "../services/savingsService";
import { getErrorMessage } from "../utils/errorMessage";
import { calculateGoalProgress, calculateSavingsTotals } from "../utils/finance";
import { normalizeSavings } from "../utils/normalizers";

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(Number(value || 0));

const SavingsPage = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadGoals = useCallback(async () => {
    setLoading(true);

    try {
      const data = await getAllSavings();
      setGoals((data || []).map(normalizeSavings));
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to fetch savings goals."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  const totals = useMemo(() => calculateSavingsTotals(goals), [goals]);

  const handleCreateGoal = async (goalInput) => {
    if (!goalInput.name || !goalInput.targetAmount || goalInput.targetAmount <= 0) {
      toast.error("Please provide valid goal name and target amount.");
      return;
    }

    setSubmitting(true);

    try {
      await createSavingsGoal(goalInput);
      toast.success("Savings goal created.");
      await loadGoals();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to create savings goal."));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteGoal = async (goalId) => {
    if (!goalId) {
      toast.error("This goal cannot be deleted because ID is missing.");
      return;
    }

    const isConfirmed = window.confirm("Delete this savings goal?");

    if (!isConfirmed) {
      return;
    }

    try {
      await deleteSavingsById(goalId);
      toast.success("Savings goal deleted.");
      await loadGoals();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to delete savings goal."));
    }
  };

  return (
    <Stack spacing={3}>
      <Stack spacing={1}>
        <Typography variant="h4">Savings Goals</Typography>
        <Typography variant="body2" color="text.secondary">
          Track progress toward each financial milestone.
        </Typography>
      </Stack>

      <Paper sx={{ p: 2.5, borderRadius: 3 }}>
        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={1}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Overall Progress
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {formatCurrency(totals.currentTotal)} / {formatCurrency(totals.targetTotal)} ({totals.progressPercent.toFixed(1)}%)
          </Typography>
        </Stack>
        <LinearProgress
          variant="determinate"
          value={totals.progressPercent}
          sx={{
            mt: 1.5,
            height: 10,
            borderRadius: 100,
            bgcolor: "rgba(249, 115, 22, 0.2)",
            "& .MuiLinearProgress-bar": {
              bgcolor: "secondary.main",
            },
          }}
        />
      </Paper>

      <SavingsGoalForm onSubmit={handleCreateGoal} isSubmitting={submitting} />

      {loading ? (
        <LoadingState label="Loading savings goals..." />
      ) : goals.length === 0 ? (
        <EmptyState title="No savings goals" description="Create your first goal to begin tracking progress." />
      ) : (
        <Stack spacing={2}>
          {goals.map((goal) => {
            const progress = calculateGoalProgress(goal.currentAmount, goal.targetAmount);

            return (
              <Paper key={goal.id || goal.name} sx={{ p: 2.5, borderRadius: 3 }}>
                <Stack spacing={1.5}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                    <Stack>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {goal.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {formatCurrency(goal.currentAmount)} of {formatCurrency(goal.targetAmount)}
                      </Typography>
                    </Stack>
                    <Tooltip title="Delete goal">
                      <IconButton color="error" onClick={() => handleDeleteGoal(goal.id)} disabled={!goal.id}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={progress}
                    sx={{
                      height: 9,
                      borderRadius: 100,
                      bgcolor: "rgba(15, 118, 110, 0.14)",
                    }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {progress.toFixed(1)}% completed
                  </Typography>
                </Stack>
              </Paper>
            );
          })}
        </Stack>
      )}
    </Stack>
  );
};

export default SavingsPage;
