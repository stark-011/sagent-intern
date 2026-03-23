import { useMemo, useState } from "react";
import { Alert, Button, MenuItem, Paper, Stack, TextField, Typography } from "@mui/material";

const BudgetForm = ({ categories, existingBudgets, onSubmit }) => {
  const [categoryName, setCategoryName] = useState("");
  const [limit, setLimit] = useState("");

  const categoryOptions = useMemo(() => {
    const namesFromApi = (categories || []).map((category) => category.name);
    const namesFromBudgets = Object.keys(existingBudgets || {});
    return [...new Set([...namesFromApi, ...namesFromBudgets])].sort((a, b) => a.localeCompare(b));
  }, [categories, existingBudgets]);

  const handleSubmit = (event) => {
    event.preventDefault();

    onSubmit({
      categoryName: categoryName.trim(),
      limit: Number(limit),
    });

    setLimit("");
  };

  return (
    <Paper component="form" onSubmit={handleSubmit} sx={{ p: 2.5, borderRadius: 3 }}>
      <Stack spacing={2}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          Set Monthly Budget By Category
        </Typography>

        {categoryOptions.length === 0 ? (
          <Alert severity="info">Create expense categories first so you can assign budgets to them.</Alert>
        ) : null}

        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          <TextField
            select
            label="Category"
            value={categoryName}
            onChange={(event) => setCategoryName(event.target.value)}
            sx={{ minWidth: 240 }}
            required
          >
            {categoryOptions.map((category) => (
              <MenuItem key={category} value={category}>
                {category}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Monthly Limit"
            type="number"
            value={limit}
            onChange={(event) => setLimit(event.target.value)}
            inputProps={{ min: 0, step: "0.01" }}
            required
          />

          <Button type="submit" variant="contained" sx={{ minWidth: 140 }}>
            Save Budget
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
};

export default BudgetForm;
