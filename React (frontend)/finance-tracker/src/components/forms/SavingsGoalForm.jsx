import { useState } from "react";
import { Button, Grid, Paper, Stack, TextField, Typography } from "@mui/material";

const SavingsGoalForm = ({ onSubmit, isSubmitting }) => {
  const [formValues, setFormValues] = useState({
    name: "",
    targetAmount: "",
    currentAmount: "0",
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
      name: formValues.name.trim(),
      targetAmount: Number(formValues.targetAmount),
      currentAmount: Number(formValues.currentAmount || 0),
    });

    setFormValues({ name: "", targetAmount: "", currentAmount: "0" });
  };

  return (
    <Paper component="form" onSubmit={handleSubmit} sx={{ p: 2.5, borderRadius: 3 }}>
      <Stack spacing={2}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          Create Savings Goal
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              label="Goal Name"
              value={formValues.name}
              onChange={handleChange("name")}
              fullWidth
              required
            />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <TextField
              label="Target Amount"
              type="number"
              value={formValues.targetAmount}
              onChange={handleChange("targetAmount")}
              inputProps={{ min: 0, step: "0.01" }}
              fullWidth
              required
            />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <TextField
              label="Current Saved"
              type="number"
              value={formValues.currentAmount}
              onChange={handleChange("currentAmount")}
              inputProps={{ min: 0, step: "0.01" }}
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12, md: 2 }}>
            <Button
              variant="contained"
              type="submit"
              disabled={isSubmitting}
              fullWidth
              sx={{ height: "100%", minHeight: 56 }}
            >
              Save
            </Button>
          </Grid>
        </Grid>
      </Stack>
    </Paper>
  );
};

export default SavingsGoalForm;
