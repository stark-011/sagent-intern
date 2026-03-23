import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Chip
} from "@mui/material";
import GroupIcon from "@mui/icons-material/Group";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import ForumIcon from "@mui/icons-material/Forum";
import { getAllPatients } from "../../api/patientApi";
import { getPastRecordsByPatientId } from "../../api/pastRecordApi";
import { getHealthLogsByPatientId } from "../../api/dailyHealthLogApi";
import {
  createAdviceFeedback,
  getFeedbackByDoctorId,
  getFeedbackByPatientId
} from "../../api/adviceFeedbackApi";
import {
  getAppointmentsByDoctorId,
  getAppointmentsByPatientId,
  scheduleAppointment
} from "../../api/appointmentApi";
import { extractApiError } from "../../api/axiosConfig";
import AppLoader from "../../components/common/AppLoader";
import EmptyState from "../../components/common/EmptyState";
import HealthTrendChart from "../../components/common/HealthTrendChart";
import SectionCard from "../../components/common/SectionCard";
import { useAuth } from "../../context/AuthContext";
import { formatDateTime, sortByDateDesc } from "../../utils/formatters";

const initialAdviceForm = {
  message: "",
  relatedLogId: ""
};

const initialAppointmentForm = {
  scheduleTime: "",
  status: "SCHEDULED"
};

const toBackendDateTime = (value) => {
  if (!value) {
    return value;
  }
  if (value.length === 16) {
    return `${value}:00`;
  }
  return value;
};

const StatCard = ({ icon, label, value }) => (
  <SectionCard>
    <Stack direction="row" spacing={1.5} alignItems="center">
      <Box
        sx={{
          width: 44,
          height: 44,
          borderRadius: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "primary.light",
          color: "primary.contrastText"
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>
          {value}
        </Typography>
      </Box>
    </Stack>
  </SectionCard>
);

const DoctorDashboardPage = () => {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [patientLoading, setPatientLoading] = useState(false);
  const [savingAdvice, setSavingAdvice] = useState(false);
  const [savingAppointment, setSavingAppointment] = useState(false);
  const [error, setError] = useState("");

  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState("");

  const [doctorAppointments, setDoctorAppointments] = useState([]);
  const [doctorFeedback, setDoctorFeedback] = useState([]);

  const [patientLogs, setPatientLogs] = useState([]);
  const [patientRecords, setPatientRecords] = useState([]);
  const [patientAppointments, setPatientAppointments] = useState([]);
  const [patientFeedback, setPatientFeedback] = useState([]);

  const [adviceForm, setAdviceForm] = useState(initialAdviceForm);
  const [appointmentForm, setAppointmentForm] = useState(initialAppointmentForm);
  const [adviceErrors, setAdviceErrors] = useState({});
  const [appointmentErrors, setAppointmentErrors] = useState({});

  const selectedPatient = useMemo(
    () => patients.find((patient) => patient.id === selectedPatientId) || null,
    [patients, selectedPatientId]
  );

  const loadDoctorData = useCallback(async () => {
    if (!user?.id) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      const [allPatients, appointmentsRes, feedbackRes] = await Promise.all([
        getAllPatients(),
        getAppointmentsByDoctorId(user.id),
        getFeedbackByDoctorId(user.id)
      ]);

      const assignedPatients = (allPatients || []).filter(
        (patient) => patient.primaryDoctor?.id === user.id
      );

      const displayPatients = assignedPatients.length ? assignedPatients : allPatients || [];
      setPatients(displayPatients);
      setDoctorAppointments(appointmentsRes || []);
      setDoctorFeedback(feedbackRes || []);

      if (displayPatients.length) {
        setSelectedPatientId((prev) => prev || displayPatients[0].id);
      }
    } catch (err) {
      setError(extractApiError(err));
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const loadSelectedPatientData = useCallback(async () => {
    if (!selectedPatientId) {
      setPatientLogs([]);
      setPatientRecords([]);
      setPatientAppointments([]);
      setPatientFeedback([]);
      return;
    }

    try {
      setPatientLoading(true);
      setError("");

      const [logsRes, recordsRes, appointmentsRes, feedbackRes] = await Promise.all([
        getHealthLogsByPatientId(selectedPatientId),
        getPastRecordsByPatientId(selectedPatientId),
        getAppointmentsByPatientId(selectedPatientId),
        getFeedbackByPatientId(selectedPatientId)
      ]);

      setPatientLogs(logsRes || []);
      setPatientRecords(recordsRes || []);
      setPatientAppointments(appointmentsRes || []);
      setPatientFeedback(feedbackRes || []);
    } catch (err) {
      setError(extractApiError(err));
    } finally {
      setPatientLoading(false);
    }
  }, [selectedPatientId]);

  useEffect(() => {
    loadDoctorData();
  }, [loadDoctorData]);

  useEffect(() => {
    loadSelectedPatientData();
  }, [loadSelectedPatientData]);

  const orderedPatientLogs = useMemo(() => sortByDateDesc(patientLogs, "recordedAt"), [patientLogs]);
  const orderedPatientRecords = useMemo(
    () => sortByDateDesc(patientRecords, "recordDate"),
    [patientRecords]
  );
  const orderedDoctorAppointments = useMemo(
    () => sortByDateDesc(doctorAppointments, "scheduleTime"),
    [doctorAppointments]
  );
  const orderedDoctorFeedback = useMemo(
    () => sortByDateDesc(doctorFeedback, "sentAt"),
    [doctorFeedback]
  );

  const validateAdvice = () => {
    const errors = {};
    if (!selectedPatientId) {
      errors.selectedPatient = "Select a patient.";
    }
    if (!adviceForm.message.trim()) {
      errors.message = "Advice message is required.";
    }
    setAdviceErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateAppointment = () => {
    const errors = {};
    if (!selectedPatientId) {
      errors.selectedPatient = "Select a patient.";
    }
    if (!appointmentForm.scheduleTime) {
      errors.scheduleTime = "Schedule time is required.";
    }
    setAppointmentErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAdviceChange = (event) => {
    const { name, value } = event.target;
    setAdviceForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAppointmentChange = (event) => {
    const { name, value } = event.target;
    setAppointmentForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSendAdvice = async (event) => {
    event.preventDefault();
    setError("");

    if (!validateAdvice()) {
      return;
    }

    try {
      setSavingAdvice(true);
      const created = await createAdviceFeedback(
        {
          message: adviceForm.message.trim()
        },
        user.id,
        selectedPatientId,
        adviceForm.relatedLogId || undefined
      );

      setDoctorFeedback((prev) => [created, ...prev]);
      setPatientFeedback((prev) => [created, ...prev]);
      setAdviceForm(initialAdviceForm);
      setAdviceErrors({});
    } catch (err) {
      setError(extractApiError(err));
    } finally {
      setSavingAdvice(false);
    }
  };

  const handleScheduleAppointment = async (event) => {
    event.preventDefault();
    setError("");

    if (!validateAppointment()) {
      return;
    }

    try {
      setSavingAppointment(true);
      const created = await scheduleAppointment(
        {
          scheduleTime: toBackendDateTime(appointmentForm.scheduleTime),
          status: appointmentForm.status || "SCHEDULED"
        },
        user.id,
        selectedPatientId
      );

      setDoctorAppointments((prev) => [created, ...prev]);
      setPatientAppointments((prev) => [created, ...prev]);
      setAppointmentForm(initialAppointmentForm);
      setAppointmentErrors({});
    } catch (err) {
      setError(extractApiError(err));
    } finally {
      setSavingAppointment(false);
    }
  };

  if (loading) {
    return <AppLoader text="Loading doctor dashboard..." />;
  }

  return (
    <Stack spacing={3}>
      <Stack>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          Doctor Dashboard
        </Typography>
        <Typography color="text.secondary">
          Monitor patients, review trends, provide advice, and schedule appointments.
        </Typography>
      </Stack>

      {error && <Alert severity="error">{error}</Alert>}

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} lg={4}>
          <StatCard icon={<GroupIcon />} label="Patients" value={patients.length} />
        </Grid>
        <Grid item xs={12} sm={6} lg={4}>
          <StatCard icon={<EventAvailableIcon />} label="Appointments" value={doctorAppointments.length} />
        </Grid>
        <Grid item xs={12} sm={6} lg={4}>
          <StatCard icon={<ForumIcon />} label="Advice Sent" value={doctorFeedback.length} />
        </Grid>
      </Grid>

      <SectionCard title="Consultation Workspace">
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth error={Boolean(adviceErrors.selectedPatient || appointmentErrors.selectedPatient)}>
              <InputLabel id="patient-select">Select Patient</InputLabel>
              <Select
                labelId="patient-select"
                label="Select Patient"
                value={selectedPatientId}
                onChange={(event) => setSelectedPatientId(event.target.value)}
              >
                {patients.map((patient) => (
                  <MenuItem key={patient.id} value={patient.id}>
                    {patient.fullName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {selectedPatient
                ? `${selectedPatient.fullName} | ${selectedPatient.contactDetails || "No contact"}`
                : "No patient selected"}
            </Typography>
          </Grid>

          <Grid item xs={12} md={4}>
            <Stack component="form" spacing={1.5} onSubmit={handleSendAdvice}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Send Advice / Feedback
              </Typography>
              <TextField
                name="message"
                label="Message"
                multiline
                minRows={3}
                value={adviceForm.message}
                onChange={handleAdviceChange}
                error={Boolean(adviceErrors.message)}
                helperText={adviceErrors.message}
              />
              <FormControl fullWidth>
                <InputLabel id="related-log-select">Related Log (Optional)</InputLabel>
                <Select
                  labelId="related-log-select"
                  label="Related Log (Optional)"
                  name="relatedLogId"
                  value={adviceForm.relatedLogId}
                  onChange={handleAdviceChange}
                >
                  <MenuItem value="">None</MenuItem>
                  {orderedPatientLogs.map((log) => (
                    <MenuItem key={log.id} value={log.id}>
                      {formatDateTime(log.recordedAt)} | HR {log.heartRate} | O2 {log.oxygenLevel}%
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button type="submit" variant="contained" disabled={savingAdvice}>
                {savingAdvice ? "Sending..." : "Send Advice"}
              </Button>
            </Stack>
          </Grid>

          <Grid item xs={12} md={4}>
            <Stack component="form" spacing={1.5} onSubmit={handleScheduleAppointment}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Schedule Appointment
              </Typography>
              <TextField
                name="scheduleTime"
                label="Schedule Time"
                type="datetime-local"
                InputLabelProps={{ shrink: true }}
                value={appointmentForm.scheduleTime}
                onChange={handleAppointmentChange}
                error={Boolean(appointmentErrors.scheduleTime)}
                helperText={appointmentErrors.scheduleTime}
              />
              <FormControl fullWidth>
                <InputLabel id="status-select">Status</InputLabel>
                <Select
                  labelId="status-select"
                  label="Status"
                  name="status"
                  value={appointmentForm.status}
                  onChange={handleAppointmentChange}
                >
                  <MenuItem value="SCHEDULED">SCHEDULED</MenuItem>
                  <MenuItem value="CONFIRMED">CONFIRMED</MenuItem>
                  <MenuItem value="COMPLETED">COMPLETED</MenuItem>
                  <MenuItem value="CANCELLED">CANCELLED</MenuItem>
                </Select>
              </FormControl>
              <Button type="submit" variant="contained" disabled={savingAppointment}>
                {savingAppointment ? "Scheduling..." : "Schedule"}
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </SectionCard>

      {patientLoading ? (
        <AppLoader text="Loading selected patient details..." minHeight={220} />
      ) : (
        <>
          <SectionCard
            title={selectedPatient ? `${selectedPatient.fullName} - Health Trends` : "Health Trends"}
          >
            <HealthTrendChart logs={patientLogs} />
          </SectionCard>

          <Grid container spacing={2}>
            <Grid item xs={12} lg={6}>
              <SectionCard title="Patient Daily Health Logs">
                {!orderedPatientLogs.length ? (
                  <EmptyState message="No health logs found for this patient." />
                ) : (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Date</TableCell>
                          <TableCell align="right">HR</TableCell>
                          <TableCell>BP</TableCell>
                          <TableCell align="right">O2</TableCell>
                          <TableCell align="right">Temp</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {orderedPatientLogs.map((log) => (
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
            </Grid>

            <Grid item xs={12} lg={6}>
              <SectionCard title="Patient Past Records">
                {!orderedPatientRecords.length ? (
                  <EmptyState message="No past records found for this patient." />
                ) : (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Record</TableCell>
                          <TableCell>Date</TableCell>
                          <TableCell>Description</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {orderedPatientRecords.map((record) => (
                          <TableRow key={record.id}>
                            <TableCell>{record.recordName}</TableCell>
                            <TableCell>{formatDateTime(record.recordDate)}</TableCell>
                            <TableCell>{record.description || "-"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </SectionCard>
            </Grid>
          </Grid>

          <SectionCard title="Selected Patient Appointments">
            {!patientAppointments.length ? (
              <EmptyState message="No appointments found for this patient." />
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Time</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Doctor</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sortByDateDesc(patientAppointments, "scheduleTime").map((appointment) => (
                      <TableRow key={appointment.id}>
                        <TableCell>{formatDateTime(appointment.scheduleTime)}</TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={appointment.status || "SCHEDULED"}
                            color="primary"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>{appointment.doctor?.fullName || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </SectionCard>

          <SectionCard title="Advice Sent By You">
            {!orderedDoctorFeedback.length ? (
              <EmptyState message="No feedback messages sent yet." />
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Sent At</TableCell>
                      <TableCell>Patient</TableCell>
                      <TableCell>Message</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {orderedDoctorFeedback.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{formatDateTime(item.sentAt)}</TableCell>
                        <TableCell>{item.patient?.fullName || "-"}</TableCell>
                        <TableCell>{item.message}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </SectionCard>

          <SectionCard title="Your Appointment Queue">
            {!orderedDoctorAppointments.length ? (
              <EmptyState message="No appointments assigned yet." />
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Schedule Time</TableCell>
                      <TableCell>Patient</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {orderedDoctorAppointments.map((appointment) => (
                      <TableRow key={appointment.id}>
                        <TableCell>{formatDateTime(appointment.scheduleTime)}</TableCell>
                        <TableCell>{appointment.patient?.fullName || "-"}</TableCell>
                        <TableCell>{appointment.status || "SCHEDULED"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </SectionCard>

          <SectionCard title="Feedback Received By Patient">
            {!patientFeedback.length ? (
              <EmptyState message="No feedback exists for selected patient." />
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Sent At</TableCell>
                      <TableCell>Doctor</TableCell>
                      <TableCell>Message</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sortByDateDesc(patientFeedback, "sentAt").map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{formatDateTime(item.sentAt)}</TableCell>
                        <TableCell>{item.doctor?.fullName || "-"}</TableCell>
                        <TableCell>{item.message}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </SectionCard>
        </>
      )}
    </Stack>
  );
};

export default DoctorDashboardPage;
