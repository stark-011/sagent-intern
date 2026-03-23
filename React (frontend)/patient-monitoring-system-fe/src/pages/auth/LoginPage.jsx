import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { roleHomePath, useAuth } from "../../context/AuthContext";

const initialState = {
  role: "PATIENT",
  contactDetails: "",
  password: ""
};

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, authLoading } = useAuth();

  const [form, setForm] = useState(initialState);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const validate = () => {
    const errors = {};

    if (!form.role) {
      errors.role = "Select account type.";
    }

    if (!form.contactDetails.trim()) {
      errors.contactDetails = "Contact details are required.";
    }

    if (!form.password.trim()) {
      errors.password = "Password is required.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!validate()) {
      return;
    }

    try {
      const user = await login(form);
      const fallbackPath = roleHomePath(user?.role);
      const fromPath = location.state?.from?.pathname;
      navigate(fromPath || fallbackPath, { replace: true });
    } catch (err) {
      setError(err.message || "Login failed.");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        py: 4,
        background:
          "radial-gradient(circle at top left, rgba(46, 196, 182, 0.14), transparent 30%), radial-gradient(circle at bottom right, rgba(251, 191, 36, 0.14), transparent 35%)"
      }}
    >
      <Container maxWidth="sm">
        <Card sx={{ borderRadius: 4 }} className="card-fade-in">
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            <Stack spacing={1} sx={{ mb: 3 }}>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>
                Patient Monitoring System
              </Typography>
              <Typography color="text.secondary">
                Sign in as Patient or Doctor
              </Typography>
            </Stack>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Box component="form" onSubmit={handleSubmit}>
              <Stack spacing={2}>
                <FormControl fullWidth error={Boolean(fieldErrors.role)}>
                  <InputLabel id="role-label">Account Type</InputLabel>
                  <Select
                    labelId="role-label"
                    label="Account Type"
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                  >
                    <MenuItem value="PATIENT">Patient</MenuItem>
                    <MenuItem value="DOCTOR">Doctor</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  name="contactDetails"
                  label="Contact Details"
                  placeholder="Email or phone"
                  value={form.contactDetails}
                  onChange={handleChange}
                  error={Boolean(fieldErrors.contactDetails)}
                  helperText={fieldErrors.contactDetails}
                  fullWidth
                />

                <TextField
                  name="password"
                  label="Password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  error={Boolean(fieldErrors.password)}
                  helperText={fieldErrors.password}
                  fullWidth
                />

                <Button type="submit" variant="contained" size="large" disabled={authLoading}>
                  {authLoading ? "Signing in..." : "Login"}
                </Button>
              </Stack>
            </Box>

            <Typography variant="body2" sx={{ mt: 3 }}>
              New patient?{" "}
              <Link to="/register/patient" className="text-link">
                Create an account
              </Link>
            </Typography>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default LoginPage;
