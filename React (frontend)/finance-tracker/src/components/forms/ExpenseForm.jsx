import { useMemo, useState } from "react";
import { Button, Grid, Paper, MenuItem, Stack, TextField, Typography } from "@mui/material";

const today = new Date().toISOString().slice(0, 10);

const ExpenseForm = ({ categories, onSubmit, isSubmitting }) => {
  const [formValues, setFormValues] = useState({
    amount: "",
    date: today,
    description: "",
    categoryId: "",
    categoryName: "",
  });

  const categoryOptions = useMemo(
    () => (categories || []).map((category) => ({ id: category.id, name: category.name })),
    [categories]
  );

  const handleChange = (field) => (event) => {
    const value = event.target.value;

    if (field === "categoryId") {
      const selectedCategory = categoryOptions.find((category) => String(category.id) === String(value));
      setFormValues((previous) => ({
        ...previous,
        categoryId: value,
        categoryName: selectedCategory?.name || "",
      }));
      return;
    }

    setFormValues((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    await onSubmit({
      amount: Number(formValues.amount),
      date: formValues.date,
      description: formValues.description.trim(),
      categoryId: formValues.categoryId ? Number(formValues.categoryId) : null,
      categoryName: formValues.categoryName.trim(),
    });

    setFormValues({ amount: "", date: today, description: "", categoryId: "", categoryName: "" });
  };

  return (
    <Paper component="form" onSubmit={handleSubmit} sx={{ p: 2.5, borderRadius: 3 }}>
      <Stack spacing={2}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          Add Expense
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 3 }}>
            <TextField
              label="Amount"
              value={formValues.amount}
              onChange={handleChange("amount")}
              type="number"
              inputProps={{ min: 0, step: "0.01" }}
              fullWidth
              required
            />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <TextField
              label="Date"
              value={formValues.date}
              onChange={handleChange("date")}
              type="date"
              fullWidth
              required
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            {categoryOptions.length > 0 ? (
              <TextField
                select
                label="Category"
                value={formValues.categoryId}
                onChange={handleChange("categoryId")}
                fullWidth
                required
              >
                {categoryOptions.map((category) => (
                  <MenuItem key={category.id || category.name} value={category.id || category.name}>
                    {category.name}
                  </MenuItem>
                ))}
              </TextField>
            ) : (
              <TextField
                label="Category"
                value={formValues.categoryName}
                onChange={handleChange("categoryName")}
                placeholder="Food, Travel, Shopping..."
                fullWidth
                required
              />
            )}
          </Grid>
          <Grid size={{ xs: 12, md: 2 }}>
            <Button
              variant="contained"
              color="error"
              type="submit"
              disabled={isSubmitting}
              fullWidth
              sx={{ height: "100%", minHeight: 56 }}
            >
              Add
            </Button>
          </Grid>
          <Grid size={12}>
            <TextField
              label="Description"
              value={formValues.description}
              onChange={handleChange("description")}
              fullWidth
            />
          </Grid>
        </Grid>
      </Stack>
    </Paper>
  );
};

export default ExpenseForm;
