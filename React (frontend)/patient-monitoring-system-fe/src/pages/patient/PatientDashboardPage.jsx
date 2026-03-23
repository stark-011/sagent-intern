import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Grid,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from "@mui/material";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";
import DescriptionIcon from "@mui/icons-material/Description";
import EventNoteIcon from "@mui/icons-material/EventNote";
import {
  getFeedbackByPatientId,
  markAllFeedbackAsRead,
  markFeedbackAsRead
} from "../../api/adviceFeedbackApi";
import { getAppointmentsByPatientId } from "../../api/appointmentApi";
import { getHealthLogsByPatientId } from "../../api/dailyHealthLogApi";
import { getPastRecordsByPatientId } from "../../api/pastRecordApi";
import { extractApiError } from "../../api/axiosConfig";
import AppLoader from "../../components/common/AppLoader";
import EmptyState from "../../components/common/EmptyState";
import HealthTrendChart from "../../components/common/HealthTrendChart";
import SectionCard from "../../components/common/SectionCard";
import { useAuth } from "../../context/AuthContext";
import { formatDateTime, getFeedbackReadFlag, sortByDateDesc } from "../../utils/formatters";

const StatCard = ({ title, value, icon }) => (
  <SectionCard>
    <Stack direction="row" alignItems="center" spacing={1.5}>
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
          {title}
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>
          {value}
        </Typography>
      </Box>
    </Stack>
  </SectionCard>
);

const PatientDashboardPage = () => {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [logs, setLogs] = useState([]);
  const [records, setRecords] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);

  const loadDashboard = useCallback(async () => {
    if (!user?.id) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      const [logsRes, recordsRes, appointmentsRes, feedbackRes] = await Promise.all([
        getHealthLogsByPatientId(user.id),
        getPastRecordsByPatientId(user.id),
        getAppointmentsByPatientId(user.id),
        getFeedbackByPatientId(user.id)
      ]);

      setLogs(logsRes || []);
      setRecords(recordsRes || []);
      setAppointments(appointmentsRes || []);
      setFeedback(feedbackRes || []);
    } catch (err) {
      setError(extractApiError(err));
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const unreadFeedbackCount = useMemo(
    () => feedback.filter((entry) => !getFeedbackReadFlag(entry)).length,
    [feedback]
  );

  const recentLogs = useMemo(() => sortByDateDesc(logs, "recordedAt").slice(0, 5), [logs]);
  const recentAppointments = useMemo(
    () => sortByDateDesc(appointments, "scheduleTime").slice(0, 5),
    [appointments]
  );

  const markOneAsRead = async (feedbackId) => {
    try {
      setActionLoading(true);
      await markFeedbackAsRead(feedbackId);
      setFeedback((prev) =>
        prev.map((item) =>
          item.id === feedbackId
            ? {
                ...item,
                read: true,
                isRead: true
              }
            : item
        )
      );
    } catch (err) {
      setError(extractApiError(err));
    } finally {
      setActionLoading(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      setActionLoading(true);
      await markAllFeedbackAsRead(user.id);
      setFeedback((prev) => prev.map((item) => ({ ...item, read: true, isRead: true })));
    } catch (err) {
      setError(extractApiError(err));
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <AppLoader text="Loading patient dashboard..." />;
  }

  return (
    <Stack spacing={3}>
      <Stack>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          Welcome, {user?.fullName}
        </Typography>
        <Typography color="text.secondary">
          Track your vitals, records, appointments, and doctor feedback.
        </Typography>
      </Stack>

      {error && <Alert severity="error">{error}</Alert>}

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard title="Health Logs" value={logs.length} icon={<HealthAndSafetyIcon />} />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard title="Past Records" value={records.length} icon={<DescriptionIcon />} />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard title="Appointments" value={appointments.length} icon={<EventNoteIcon />} />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Unread Feedback"
            value={unreadFeedbackCount}
            icon={<NotificationsActiveIcon />}
          />
        </Grid>
      </Grid>

      <SectionCard title="Health Trends">
        <HealthTrendChart logs={logs} />
      </SectionCard>

      <Grid container spacing={2}>
        <Grid item xs={12} lg={6}>
          <SectionCard title="Recent Health Logs">
            {!recentLogs.length ? (
              <EmptyState message="No health logs available." />
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell align="right">Heart Rate</TableCell>
                      <TableCell>Blood Pressure</TableCell>
                      <TableCell align="right">Oxygen</TableCell>
                      <TableCell align="right">Temp</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentLogs.map((log) => (
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
          <SectionCard title="Upcoming Appointments">
            {!recentAppointments.length ? (
              <EmptyState message="No appointments scheduled yet." />
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Schedule</TableCell>
                      <TableCell>Doctor</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentAppointments.map((appointment) => (
                      <TableRow key={appointment.id}>
                        <TableCell>{formatDateTime(appointment.scheduleTime)}</TableCell>
                        <TableCell>{appointment.doctor?.fullName || "-"}</TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={appointment.status || "SCHEDULED"}
                            color="primary"
                            variant="outlined"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </SectionCard>
        </Grid>
      </Grid>

      <SectionCard
        title="Doctor Feedback"
        action={
          <Button
            size="small"
            onClick={markAllAsRead}
            disabled={!unreadFeedbackCount || actionLoading}
          >
            Mark all as read
          </Button>
        }
      >
        {!feedback.length ? (
          <EmptyState message="No feedback messages yet." />
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Sent At</TableCell>
                  <TableCell>Doctor</TableCell>
                  <TableCell>Message</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {feedback.map((entry) => {
                  const read = getFeedbackReadFlag(entry);

                  return (
                    <TableRow key={entry.id}>
                      <TableCell>{formatDateTime(entry.sentAt)}</TableCell>
                      <TableCell>{entry.doctor?.fullName || "-"}</TableCell>
                      <TableCell>{entry.message}</TableCell>
                      <TableCell>
                        {read ? (
                          <Chip size="small" label="Read" color="success" variant="outlined" />
                        ) : (
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => markOneAsRead(entry.id)}
                            disabled={actionLoading}
                          >
                            Mark Read
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </SectionCard>
    </Stack>
  );
};

export default PatientDashboardPage;
