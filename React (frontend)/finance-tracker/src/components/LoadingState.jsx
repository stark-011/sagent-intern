import { Box, CircularProgress, Typography } from "@mui/material";

const LoadingState = ({ label = "Loading...", fullScreen = false }) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      gap: 1.5,
      minHeight: fullScreen ? "100vh" : 180,
      width: "100%",
    }}
  >
    <CircularProgress size={28} />
    <Typography variant="body2" color="text.secondary">
      {label}
    </Typography>
  </Box>
);

export default LoadingState;
