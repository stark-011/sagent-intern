import { useState } from "react";
import { Button, Grid, Paper, Stack, TextField, Typography } from "@mui/material";

const today = new Date().toISOString().slice(0, 10);

const IncomeForm = ({ onSubmit, isSubmitting }) => {
  const [formValues, setFormValues] = useState({
    source: "",
    amount: "",
    date: today,
    description: "",
  });

  const handleChange = (field) => (event) => {
    setFormValues((previous) => ({
      ...previous,
      [field]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    await onSubmit({
      source: formValues.source.trim(),
      amount: Number(formValues.amount),
      date: formValues.date,
      description: formValues.description.trim(),
    });

    setFormValues({ source: "", amount: "", date: today, description: "" });
  };

  return (
    <Paper component="form" onSubmit={handleSubmit} sx={{ p: 2.5, borderRadius: 3 }}>
      <Stack spacing={2}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          Add Income
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              label="Source"
              value={formValues.source}
              onChange={handleChange("source")}
              fullWidth
              required
            />
          </Grid>
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
          <Grid size={{ xs: 12, md: 2 }}>
            <Button
              variant="contained"
              color="primary"
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

export default IncomeForm;
