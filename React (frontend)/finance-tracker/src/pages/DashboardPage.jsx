import PaidIcon from "@mui/icons-material/Paid";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import SavingsIcon from "@mui/icons-material/Savings";
import { Alert, Grid, LinearProgress, Paper, Stack, Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import SummaryCard from "../components/SummaryCard";
import LoadingState from "../components/LoadingState";
import EmptyState from "../components/EmptyState";
import ExpensesPieChart from "../components/charts/ExpensesPieChart";
import MonthlySpendingChart from "../components/charts/MonthlySpendingChart";
import { getAllIncomes } from "../services/incomeService";
import { getAllExpenses } from "../services/expenseService";
import { getAllSavings } from "../services/savingsService";
import { getAllBalances } from "../services/balanceService";
import { getErrorMessage } from "../utils/errorMessage";
import {
  normalizeBalance,
  normalizeExpense,
  normalizeIncome,
  normalizeSavings,
  toCurrencyNumber,
} from "../utils/normalizers";
import {
  calculateGoalProgress,
  calculateSavingsTotals,
  calculateTotalAmount,
  groupExpensesByCategory,
  groupExpensesByMonth,
} from "../utils/finance";

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(toCurrencyNumber(value));

const DashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [incomes, setIncomes] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [savingsGoals, setSavingsGoals] = useState([]);
  const [balances, setBalances] = useState([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);

      try {
        const [incomeData, expenseData, savingsData, balanceData] = await Promise.all([
          getAllIncomes(),
          getAllExpenses(),
          getAllSavings(),
          getAllBalances(),
        ]);

        setIncomes((incomeData || []).map(normalizeIncome));
        setExpenses((expenseData || []).map(normalizeExpense));
        setSavingsGoals((savingsData || []).map(normalizeSavings));
        setBalances((balanceData || []).map(normalizeBalance));
      } catch (error) {
        toast.error(getErrorMessage(error, "Failed to load dashboard data."));
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const totalIncome = useMemo(() => calculateTotalAmount(incomes), [incomes]);
  const totalExpenses = useMemo(() => calculateTotalAmount(expenses), [expenses]);
  const remainingBalance = useMemo(() => totalIncome - totalExpenses, [totalIncome, totalExpenses]);
  const savingsTotals = useMemo(() => calculateSavingsTotals(savingsGoals), [savingsGoals]);
  const expensesByCategoryData = useMemo(() => groupExpensesByCategory(expenses), [expenses]);
  const monthlySpendingData = useMemo(() => groupExpensesByMonth(expenses), [expenses]);

  const latestBackendBalance = balances.length > 0 ? balances[balances.length - 1].amount : null;

  return (
    <Stack spacing={3}>
      <Stack spacing={1}>
        <Typography variant="h4">Dashboard</Typography>
        <Typography variant="body2" color="text.secondary">
          Snapshot of your incomes, expenses, and savings progress.
        </Typography>
      </Stack>

      {latestBackendBalance !== null ? (
        <Alert severity="info">
          Latest backend balance: {formatCurrency(latestBackendBalance)}. Remaining balance card uses Income - Expenses as requested.
        </Alert>
      ) : null}

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <SummaryCard
            title="Total Income"
            value={formatCurrency(totalIncome)}
            subtitle={`${incomes.length} income records`}
            icon={<PaidIcon />}
            color="#0f766e"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <SummaryCard
            title="Total Expenses"
            value={formatCurrency(totalExpenses)}
            subtitle={`${expenses.length} expense records`}
            icon={<ReceiptLongIcon />}
            color="#dc2626"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <SummaryCard
            title="Remaining Balance"
            value={formatCurrency(remainingBalance)}
            subtitle="Income - Expenses"
            icon={<AccountBalanceWalletIcon />}
            color="#2563eb"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <SummaryCard
            title="Savings Progress"
            value={`${savingsTotals.progressPercent.toFixed(1)}%`}
            subtitle={`${formatCurrency(savingsTotals.currentTotal)} of ${formatCurrency(savingsTotals.targetTotal)}`}
            icon={<SavingsIcon />}
            color="#f97316"
          />
        </Grid>
      </Grid>

      {loading ? <LoadingState label="Loading dashboard..." /> : null}

      {!loading ? (
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, lg: 6 }}>
            <ExpensesPieChart data={expensesByCategoryData} />
          </Grid>
          <Grid size={{ xs: 12, lg: 6 }}>
            <MonthlySpendingChart data={monthlySpendingData} />
          </Grid>
        </Grid>
      ) : null}

      {!loading ? (
        <Paper sx={{ p: 2.5, borderRadius: 3 }}>
          <Stack spacing={2}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Savings Goals
            </Typography>

            {savingsGoals.length === 0 ? (
              <EmptyState
                title="No savings goals"
                description="Create savings goals to track progress from this dashboard."
              />
            ) : (
              savingsGoals.map((goal) => {
                const progress = calculateGoalProgress(goal.currentAmount, goal.targetAmount);

                return (
                  <Stack key={goal.id || goal.name} spacing={1.2}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {goal.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={progress}
                      sx={{
                        height: 9,
                        borderRadius: 99,
                        bgcolor: "rgba(15, 118, 110, 0.1)",
                      }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {progress.toFixed(1)}% completed
                    </Typography>
                  </Stack>
                );
              })
            )}
          </Stack>
        </Paper>
      ) : null}
    </Stack>
  );
};

export default DashboardPage;
