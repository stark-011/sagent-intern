import { Box, Button, Stack, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NotFoundPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center", p: 3 }}>
      <Stack spacing={2} textAlign="center" sx={{ maxWidth: 480 }}>
        <Typography variant="h3" sx={{ fontWeight: 800 }}>
          404
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Page not found
        </Typography>
        <Typography color="text.secondary">
          The page you requested does not exist or has moved.
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate(isAuthenticated ? "/dashboard" : "/login", { replace: true })}
        >
          Go to {isAuthenticated ? "Dashboard" : "Login"}
        </Button>
      </Stack>
    </Box>
  );
};

export default NotFoundPage;
