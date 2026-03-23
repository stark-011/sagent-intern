import { useEffect, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
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

const RegisterPage = () => {
  const [formValues, setFormValues] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [authWarning, setAuthWarning] = useState("");

  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

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

    if (formValues.password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    if (formValues.password !== formValues.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    setAuthWarning("");

    try {
      const result = await register({
        name: formValues.name.trim(),
        email: formValues.email.trim(),
        password: formValues.password,
      });

      if (result.warning) {
        setAuthWarning(result.warning);
        toast.info(result.warning);
      }

      toast.success("Registration successful.");
      navigate("/dashboard", { replace: true });
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to register."));
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
      <Card sx={{ width: "100%", maxWidth: 500, borderRadius: 4 }}>
        <CardContent sx={{ p: 4 }}>
          <Stack spacing={3} component="form" onSubmit={handleSubmit}>
            <Stack spacing={1}>
              <Typography variant="h4">Create Account</Typography>
              <Typography variant="body2" color="text.secondary">
                Start tracking your budget with a secure account.
              </Typography>
            </Stack>

            {authWarning ? <Alert severity="warning">{authWarning}</Alert> : null}

            <TextField
              label="Full Name"
              value={formValues.name}
              onChange={handleChange("name")}
              fullWidth
              required
            />
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
            <TextField
              label="Confirm Password"
              type="password"
              value={formValues.confirmPassword}
              onChange={handleChange("confirmPassword")}
              fullWidth
              required
            />

            <Button type="submit" variant="contained" size="large" disabled={submitting}>
              {submitting ? <CircularProgress size={22} color="inherit" /> : "Register"}
            </Button>

            <Typography variant="body2" color="text.secondary" textAlign="center">
              Already have an account?{" "}
              <Link component={RouterLink} to="/login" underline="hover" sx={{ fontWeight: 600 }}>
                Login
              </Link>
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

export default RegisterPage;
