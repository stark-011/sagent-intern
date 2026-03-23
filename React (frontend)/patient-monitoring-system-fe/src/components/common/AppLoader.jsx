import { Box, CircularProgress, Typography } from "@mui/material";

const AppLoader = ({ text = "Loading...", minHeight = 240 }) => {
  return (
    <Box
      sx={{
        minHeight,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 1.5
      }}
    >
      <CircularProgress size={32} />
      <Typography variant="body2" color="text.secondary">
        {text}
      </Typography>
    </Box>
  );
};

export default AppLoader;
