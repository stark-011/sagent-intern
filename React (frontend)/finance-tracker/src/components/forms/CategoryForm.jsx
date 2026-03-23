import { useState } from "react";
import { Button, Paper, Stack, TextField, Typography } from "@mui/material";

const CategoryForm = ({ onSubmit, isSubmitting }) => {
  const [categoryName, setCategoryName] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmedName = categoryName.trim();

    if (!trimmedName) {
      return;
    }

    await onSubmit({ name: trimmedName });
    setCategoryName("");
  };

  return (
    <Paper component="form" onSubmit={handleSubmit} sx={{ p: 2.5, borderRadius: 3 }}>
      <Stack spacing={2}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          Create Category
        </Typography>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <TextField
            label="Category Name"
            value={categoryName}
            onChange={(event) => setCategoryName(event.target.value)}
            fullWidth
            required
          />
          <Button variant="outlined" type="submit" disabled={isSubmitting} sx={{ minWidth: 130 }}>
            Add Category
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
};

export default CategoryForm;
