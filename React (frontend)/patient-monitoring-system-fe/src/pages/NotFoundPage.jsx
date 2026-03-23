import { Box, Button, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 2,
        p: 3
      }}
    >
      <Typography variant="h3" sx={{ fontWeight: 800 }}>
        404
      </Typography>
      <Typography variant="h6">Page not found</Typography>
      <Button variant="contained" onClick={() => navigate("/")}>Go Home</Button>
    </Box>
  );
};

export default NotFoundPage;
