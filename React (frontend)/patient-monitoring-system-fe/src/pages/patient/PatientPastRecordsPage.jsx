import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Grid,
  IconButton,
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
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import CloseIcon from "@mui/icons-material/Close";
import {
  createPastRecord,
  deletePastRecord,
  getPastRecordsByPatientId,
  updatePastRecord
} from "../../api/pastRecordApi";
import { extractApiError } from "../../api/axiosConfig";
import AppLoader from "../../components/common/AppLoader";
import EmptyState from "../../components/common/EmptyState";
import SectionCard from "../../components/common/SectionCard";
import { useAuth } from "../../context/AuthContext";
import { formatDateTime, sortByDateDesc, toDateTimeLocal } from "../../utils/formatters";

const initialForm = {
  recordName: "",
  description: "",
  fileUrl: "",
  recordDate: ""
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

const PatientPastRecordsPage = () => {
  const { user } = useAuth();

  const [form, setForm] = useState(initialForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [editingRecordId, setEditingRecordId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [error, setError] = useState("");
  const [records, setRecords] = useState([]);

  const loadRecords = useCallback(async () => {
    if (!user?.id) {
      return;
    }

    try {
      setLoading(true);
      setError("");
      const data = await getPastRecordsByPatientId(user.id);
      setRecords(data || []);
    } catch (err) {
      setError(extractApiError(err));
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  const orderedRecords = useMemo(() => sortByDateDesc(records, "recordDate"), [records]);

  const validate = () => {
    const errors = {};

    if (!form.recordName.trim()) {
      errors.recordName = "Record name is required.";
    }

    if (!form.recordDate.trim()) {
      errors.recordDate = "Record date is required.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingRecordId(null);
    setFieldErrors({});
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!validate()) {
      return;
    }

    const payload = {
      recordName: form.recordName.trim(),
      description: form.description.trim(),
      fileUrl: form.fileUrl.trim(),
      recordDate: toBackendDateTime(form.recordDate)
    };

    try {
      setSaving(true);

      if (editingRecordId) {
        const updated = await updatePastRecord(editingRecordId, payload);
        setRecords((prev) => prev.map((item) => (item.id === editingRecordId ? updated : item)));
      } else {
        const created = await createPastRecord(payload, user.id);
        setRecords((prev) => [created, ...prev]);
      }

      resetForm();
    } catch (err) {
      setError(extractApiError(err));
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (record) => {
    setEditingRecordId(record.id);
    setForm({
      recordName: record.recordName || "",
      description: record.description || "",
      fileUrl: record.fileUrl || "",
      recordDate: toDateTimeLocal(record.recordDate)
    });
    setFieldErrors({});
  };

  const handleDelete = async (recordId) => {
    try {
      setDeletingId(recordId);
      await deletePastRecord(recordId);
      setRecords((prev) => prev.filter((item) => item.id !== recordId));

      if (editingRecordId === recordId) {
        resetForm();
      }
    } catch (err) {
      setError(extractApiError(err));
    } finally {
      setDeletingId("");
    }
  };

  if (loading) {
    return <AppLoader text="Loading past records..." />;
  }

  return (
    <Stack spacing={3}>
      <Stack>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          Past Medical Records
        </Typography>
        <Typography color="text.secondary">
          Manage historical medical records and documents.
        </Typography>
      </Stack>

      {error && <Alert severity="error">{error}</Alert>}

      <SectionCard title={editingRecordId ? "Edit Record" : "Add Past Record"}>
        <Grid container spacing={2} component="form" onSubmit={handleSubmit}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Record Name"
              name="recordName"
              value={form.recordName}
              onChange={handleChange}
              error={Boolean(fieldErrors.recordName)}
              helperText={fieldErrors.recordName}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Record Date"
              name="recordDate"
              type="datetime-local"
              value={form.recordDate}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              error={Boolean(fieldErrors.recordDate)}
              helperText={fieldErrors.recordDate}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={form.description}
              onChange={handleChange}
              multiline
              minRows={3}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="File URL"
              name="fileUrl"
              value={form.fileUrl}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12}>
            <Stack direction="row" spacing={1.5}>
              <Button type="submit" variant="contained" disabled={saving}>
                {saving ? "Saving..." : editingRecordId ? "Update Record" : "Save Record"}
              </Button>

              {editingRecordId && (
                <Button variant="outlined" color="inherit" startIcon={<CloseIcon />} onClick={resetForm}>
                  Cancel
                </Button>
              )}
            </Stack>
          </Grid>
        </Grid>
      </SectionCard>

      <SectionCard title="All Past Records">
        {!orderedRecords.length ? (
          <EmptyState message="No past records available." />
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Record Name</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>File URL</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orderedRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{record.recordName}</TableCell>
                    <TableCell>{formatDateTime(record.recordDate)}</TableCell>
                    <TableCell>{record.description || "-"}</TableCell>
                    <TableCell>
                      {record.fileUrl ? (
                        <a href={record.fileUrl} target="_blank" rel="noreferrer" className="text-link">
                          Open
                        </a>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" color="primary" onClick={() => handleEdit(record)}>
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        disabled={deletingId === record.id}
                        onClick={() => handleDelete(record.id)}
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </SectionCard>
    </Stack>
  );
};

export default PatientPastRecordsPage;
