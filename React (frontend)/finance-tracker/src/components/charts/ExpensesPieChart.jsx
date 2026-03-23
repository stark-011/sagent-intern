import { Paper, Typography } from "@mui/material";
import { Pie, PieChart, ResponsiveContainer, Tooltip, Cell, Legend } from "recharts";
import EmptyState from "../EmptyState";

const chartColors = ["#0f766e", "#f97316", "#2563eb", "#16a34a", "#dc2626", "#8b5cf6", "#14b8a6"];

const ExpensesPieChart = ({ data }) => {
  if (!data || data.length === 0) {
    return <EmptyState title="No expense data" description="Add expenses to view category distribution." />;
  }

  return (
    <Paper sx={{ p: 2.5, borderRadius: 3, height: 360 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
        Expenses By Category
      </Typography>
      <ResponsiveContainer width="100%" height="90%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={95}>
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, "Amount"]} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </Paper>
  );
};

export default ExpensesPieChart;
