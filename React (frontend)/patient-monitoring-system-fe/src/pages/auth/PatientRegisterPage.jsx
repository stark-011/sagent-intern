import { useEffect, useMemo, useState } from "react";
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
import { Link, useNavigate } from "react-router-dom";
import { getAllDoctors } from "../../api/doctorApi";
import { extractApiError } from "../../api/axiosConfig";
import { roleHomePath, useAuth } from "../../context/AuthContext";

const initialState = {
  fullName: "",
  age: "",
  contactDetails: "",
  password: "",
  confirmPassword: "",
  primaryDoctorId: ""
};

const PatientRegisterPage = () => {
  const navigate = useNavigate();
  const { registerPatientAccount, authLoading } = useAuth();

  const [form, setForm] = useState(initialState);
  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoadingDoctors(true);
        const data = await getAllDoctors();
        setDoctors(data || []);
      } catch (err) {
        setError(extractApiError(err));
      } finally {
        setLoadingDoctors(false);
      }
    };

    fetchDoctors();
  }, []);

  const doctorOptions = useMemo(
    () =>
      doctors.map((doctor) => ({
        id: doctor.id,
        label: doctor.specialization
          ? `${doctor.fullName} (${doctor.specialization})`
          : doctor.fullName
      })),
    [doctors]
  );

  const validate = () => {
    const errors = {};

    if (!form.fullName.trim()) {
      errors.fullName = "Full name is required.";
    }

    if (!form.age || Number(form.age) <= 0) {
      errors.age = "Enter a valid age.";
    }

    if (!form.contactDetails.trim()) {
      errors.contactDetails = "Contact details are required.";
    }

    if (!form.password || form.password.length < 6) {
      errors.password = "Password must be at least 6 characters.";
    }

    if (form.confirmPassword !== form.password) {
      errors.confirmPassword = "Passwords do not match.";
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
      const user = await registerPatientAccount(form);
      navigate(roleHomePath(user.role), { replace: true });
    } catch (err) {
      setError(err.message || "Unable to create account.");
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
          "radial-gradient(circle at top right, rgba(2, 132, 199, 0.13), transparent 30%), radial-gradient(circle at bottom left, rgba(16, 185, 129, 0.13), transparent 40%)"
      }}
    >
      <Container maxWidth="sm">
        <Card sx={{ borderRadius: 4 }} className="card-fade-in">
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            <Stack spacing={1} sx={{ mb: 3 }}>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>
                Patient Registration
              </Typography>
              <Typography color="text.secondary">
                Create your patient account and start tracking health data.
              </Typography>
            </Stack>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Box component="form" onSubmit={handleSubmit}>
              <Stack spacing={2}>
                <TextField
                  label="Full Name"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  error={Boolean(fieldErrors.fullName)}
                  helperText={fieldErrors.fullName}
                  fullWidth
                />

                <TextField
                  label="Age"
                  name="age"
                  type="number"
                  value={form.age}
                  onChange={handleChange}
                  error={Boolean(fieldErrors.age)}
                  helperText={fieldErrors.age}
                  fullWidth
                />

                <TextField
                  label="Contact Details"
                  name="contactDetails"
                  value={form.contactDetails}
                  onChange={handleChange}
                  error={Boolean(fieldErrors.contactDetails)}
                  helperText={fieldErrors.contactDetails || "Use email or phone"}
                  fullWidth
                />

                <TextField
                  label="Password"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  error={Boolean(fieldErrors.password)}
                  helperText={fieldErrors.password}
                  fullWidth
                />

                <TextField
                  label="Confirm Password"
                  name="confirmPassword"
                  type="password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  error={Boolean(fieldErrors.confirmPassword)}
                  helperText={fieldErrors.confirmPassword}
                  fullWidth
                />

                <FormControl fullWidth>
                  <InputLabel id="doctor-select">Primary Doctor (Optional)</InputLabel>
                  <Select
                    labelId="doctor-select"
                    label="Primary Doctor (Optional)"
                    name="primaryDoctorId"
                    value={form.primaryDoctorId}
                    onChange={handleChange}
                    disabled={loadingDoctors}
                  >
                    <MenuItem value="">None</MenuItem>
                    {doctorOptions.map((doctor) => (
                      <MenuItem key={doctor.id} value={doctor.id}>
                        {doctor.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Button type="submit" variant="contained" size="large" disabled={authLoading}>
                  {authLoading ? "Creating account..." : "Create Account"}
                </Button>
              </Stack>
            </Box>

            <Typography variant="body2" sx={{ mt: 3 }}>
              Already have an account?{" "}
              <Link to="/login" className="text-link">
                Login
              </Link>
            </Typography>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default PatientRegisterPage;
