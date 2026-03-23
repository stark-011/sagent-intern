import { Paper, Typography } from "@mui/material";

const EmptyState = ({ message = "No data available." }) => {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 3,
        textAlign: "center",
        borderStyle: "dashed"
      }}
    >
      <Typography variant="body2" color="text.secondary">
        {message}
      </Typography>
    </Paper>
  );
};

export default EmptyState;
