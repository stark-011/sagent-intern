import { useEffect, useState } from "react";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Link,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../utils/errorMessage";

const LoginPage = () => {
  const [formValues, setFormValues] = useState({ email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const [authWarning, setAuthWarning] = useState("");
  const { login, isAuthenticated } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/dashboard";

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (field) => (event) => {
    setFormValues((previous) => ({
      ...previous,
      [field]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSubmitting(true);
    setAuthWarning("");

    try {
      const result = await login({
        email: formValues.email.trim(),
        password: formValues.password,
      });

      if (result.warning) {
        setAuthWarning(result.warning);
        toast.info(result.warning);
      }

      toast.success("Login successful.");
      navigate(from, { replace: true });
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to login."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        px: 2,
      }}
    >
      <Card sx={{ width: "100%", maxWidth: 460, borderRadius: 4 }}>
        <CardContent sx={{ p: 4 }}>
          <Stack spacing={3} component="form" onSubmit={handleSubmit}>
            <Stack spacing={1}>
              <Typography variant="h4">Welcome Back</Typography>
              <Typography variant="body2" color="text.secondary">
                Sign in to access your personal budget tracker.
              </Typography>
            </Stack>

            {authWarning ? <Alert severity="warning">{authWarning}</Alert> : null}

            <TextField
              label="Email"
              type="email"
              value={formValues.email}
              onChange={handleChange("email")}
              fullWidth
              required
            />
            <TextField
              label="Password"
              type="password"
              value={formValues.password}
              onChange={handleChange("password")}
              fullWidth
              required
            />

            <Button type="submit" variant="contained" size="large" disabled={submitting}>
              {submitting ? <CircularProgress size={22} color="inherit" /> : "Login"}
            </Button>

            <Typography variant="body2" color="text.secondary" textAlign="center">
              New here?{" "}
              <Link component={RouterLink} to="/register" underline="hover" sx={{ fontWeight: 600 }}>
                Create an account
              </Link>
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

export default LoginPage;
