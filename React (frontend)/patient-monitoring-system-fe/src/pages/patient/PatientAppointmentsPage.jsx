import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from "@mui/material";
import {
  getFeedbackByPatientId,
  markAllFeedbackAsRead,
  markFeedbackAsRead
} from "../../api/adviceFeedbackApi";
import { getAppointmentsByPatientId } from "../../api/appointmentApi";
import { extractApiError } from "../../api/axiosConfig";
import AppLoader from "../../components/common/AppLoader";
import EmptyState from "../../components/common/EmptyState";
import SectionCard from "../../components/common/SectionCard";
import { useAuth } from "../../context/AuthContext";
import { formatDateTime, getFeedbackReadFlag, sortByDateDesc } from "../../utils/formatters";

const PatientAppointmentsPage = () => {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [feedback, setFeedback] = useState([]);

  const loadData = useCallback(async () => {
    if (!user?.id) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      const [appointmentsRes, feedbackRes] = await Promise.all([
        getAppointmentsByPatientId(user.id),
        getFeedbackByPatientId(user.id)
      ]);

      setAppointments(appointmentsRes || []);
      setFeedback(feedbackRes || []);
    } catch (err) {
      setError(extractApiError(err));
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const sortedAppointments = useMemo(
    () => sortByDateDesc(appointments, "scheduleTime"),
    [appointments]
  );

  const sortedFeedback = useMemo(() => sortByDateDesc(feedback, "sentAt"), [feedback]);

  const unreadCount = useMemo(
    () => sortedFeedback.filter((item) => !getFeedbackReadFlag(item)).length,
    [sortedFeedback]
  );

  const handleMarkRead = async (feedbackId) => {
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

  const handleMarkAllRead = async () => {
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
    return <AppLoader text="Loading appointments and feedback..." />;
  }

  return (
    <Stack spacing={3}>
      <Stack>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          Appointments & Feedback
        </Typography>
        <Typography color="text.secondary">
          Review consultations and messages from your doctor.
        </Typography>
      </Stack>

      {error && <Alert severity="error">{error}</Alert>}

      <SectionCard title="Appointments">
        {!sortedAppointments.length ? (
          <EmptyState message="No appointments scheduled." />
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Schedule Time</TableCell>
                  <TableCell>Doctor</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedAppointments.map((appointment) => (
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

      <SectionCard
        title={`Doctor Feedback (${unreadCount} unread)`}
        action={
          <Button size="small" onClick={handleMarkAllRead} disabled={!unreadCount || actionLoading}>
            Mark all as read
          </Button>
        }
      >
        {!sortedFeedback.length ? (
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
                {sortedFeedback.map((entry) => {
                  const isRead = getFeedbackReadFlag(entry);

                  return (
                    <TableRow key={entry.id}>
                      <TableCell>{formatDateTime(entry.sentAt)}</TableCell>
                      <TableCell>{entry.doctor?.fullName || "-"}</TableCell>
                      <TableCell>{entry.message}</TableCell>
                      <TableCell>
                        {isRead ? (
                          <Chip size="small" label="Read" color="success" variant="outlined" />
                        ) : (
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleMarkRead(entry.id)}
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

export default PatientAppointmentsPage;
