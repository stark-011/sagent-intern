import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Grid,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from "@mui/material";
import { addHealthLog, getHealthLogsByPatientId } from "../../api/dailyHealthLogApi";
import { extractApiError } from "../../api/axiosConfig";
import AppLoader from "../../components/common/AppLoader";
import EmptyState from "../../components/common/EmptyState";
import ErrorBanner from "../../components/common/ErrorBanner";
import HealthTrendChart from "../../components/common/HealthTrendChart";
import SectionCard from "../../components/common/SectionCard";
import { useAuth } from "../../context/AuthContext";
import { formatDateTime, sortByDateDesc } from "../../utils/formatters";

const initialForm = {
  heartRate: "",
  bloodPressure: "",
  oxygenLevel: "",
  temperature: ""
};

const PatientHealthLogsPage = () => {
  const { user } = useAuth();

  const [form, setForm] = useState(initialForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [logs, setLogs] = useState([]);

  const loadLogs = useCallback(async () => {
    if (!user?.id) {
      return;
    }

    try {
      setLoading(true);
      const data = await getHealthLogsByPatientId(user.id);
      setLogs(data || []);
    } catch (err) {
      setError(extractApiError(err));
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const orderedLogs = useMemo(() => sortByDateDesc(logs, "recordedAt"), [logs]);

  const validate = () => {
    const errors = {};

    const heartRate = Number(form.heartRate);
    const oxygenLevel = Number(form.oxygenLevel);
    const temperature = Number(form.temperature);

    if (!heartRate || heartRate < 30 || heartRate > 220) {
      errors.heartRate = "Heart rate must be between 30 and 220.";
    }

    if (!/^\d{2,3}\/\d{2,3}$/.test(form.bloodPressure.trim())) {
      errors.bloodPressure = "Use format like 120/80.";
    }

    if (!oxygenLevel || oxygenLevel < 50 || oxygenLevel > 100) {
      errors.oxygenLevel = "Oxygen level must be between 50 and 100.";
    }

    if (!temperature || temperature < 30 || temperature > 45) {
      errors.temperature = "Temperature must be between 30 and 45 C.";
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
      setSaving(true);
      const payload = {
        heartRate: Number(form.heartRate),
        bloodPressure: form.bloodPressure.trim(),
        oxygenLevel: Number(form.oxygenLevel),
        temperature: Number(form.temperature)
      };

      const created = await addHealthLog(payload, user.id);
      setLogs((prev) => [created, ...prev]);
      setForm(initialForm);
      setFieldErrors({});
    } catch (err) {
      setError(extractApiError(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <AppLoader text="Loading health logs..." />;
  }

  return (
    <Stack spacing={3}>
      <Stack>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          Daily Health Logs
        </Typography>
        <Typography color="text.secondary">
          Record heart rate, blood pressure, oxygen level, and temperature.
        </Typography>
      </Stack>

      <ErrorBanner message={error} />

      <SectionCard title="Add Daily Reading">
        <Grid container spacing={2} component="form" onSubmit={handleSubmit}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Heart Rate"
              name="heartRate"
              type="number"
              value={form.heartRate}
              onChange={handleChange}
              error={Boolean(fieldErrors.heartRate)}
              helperText={fieldErrors.heartRate}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Blood Pressure"
              name="bloodPressure"
              placeholder="120/80"
              value={form.bloodPressure}
              onChange={handleChange}
              error={Boolean(fieldErrors.bloodPressure)}
              helperText={fieldErrors.bloodPressure}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Oxygen Level"
              name="oxygenLevel"
              type="number"
              value={form.oxygenLevel}
              onChange={handleChange}
              error={Boolean(fieldErrors.oxygenLevel)}
              helperText={fieldErrors.oxygenLevel}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Temperature (C)"
              name="temperature"
              type="number"
              inputProps={{ step: "0.1" }}
              value={form.temperature}
              onChange={handleChange}
              error={Boolean(fieldErrors.temperature)}
              helperText={fieldErrors.temperature}
            />
          </Grid>

          <Grid item xs={12}>
            <Button type="submit" variant="contained" disabled={saving}>
              {saving ? "Saving..." : "Save Reading"}
            </Button>
          </Grid>
        </Grid>
      </SectionCard>

      <SectionCard title="Health Trend Chart">
        <HealthTrendChart logs={logs} />
      </SectionCard>

      <SectionCard title="All Daily Logs">
        {!orderedLogs.length ? (
          <EmptyState message="No logs available." />
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell align="right">Heart Rate</TableCell>
                  <TableCell>Blood Pressure</TableCell>
                  <TableCell align="right">Oxygen</TableCell>
                  <TableCell align="right">Temperature</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orderedLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>{formatDateTime(log.recordedAt)}</TableCell>
                    <TableCell align="right">{log.heartRate}</TableCell>
                    <TableCell>{log.bloodPressure}</TableCell>
                    <TableCell align="right">{log.oxygenLevel}%</TableCell>
                    <TableCell align="right">{log.temperature} C</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </SectionCard>

      {error && <Alert severity="error">{error}</Alert>}
    </Stack>
  );
};

export default PatientHealthLogsPage;
