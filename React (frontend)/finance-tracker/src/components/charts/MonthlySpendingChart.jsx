import { Paper, Typography } from "@mui/material";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import EmptyState from "../EmptyState";

const MonthlySpendingChart = ({ data }) => {
  if (!data || data.length === 0) {
    return <EmptyState title="No monthly spending data" description="Add expenses to populate this chart." />;
  }

  return (
    <Paper sx={{ p: 2.5, borderRadius: 3, height: 360 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
        Monthly Spending
      </Typography>
      <ResponsiveContainer width="100%" height="90%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, "Spent"]} />
          <Bar dataKey="total" fill="#0f766e" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  );
};

export default MonthlySpendingChart;
