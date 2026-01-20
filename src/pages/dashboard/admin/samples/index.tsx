import { useCallback, useEffect, useState } from "react";
import type { NextPage } from "next";
import Head from "next/head";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  Paper,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Alert,
  IconButton,
  Tooltip,
} from "@mui/material";
import { AdminGuard } from "../../../../components/authentication/admin-guard";
import { DashboardLayout } from "../../../../components/dashboard/dashboard-layout";
import { useMounted } from "../../../../hooks/use-mounted";
import { useAuth } from "../../../../hooks/use-auth";
import { SyncedSample, SampleStatus } from "../../../../types/sync";
import RefreshIcon from "@mui/icons-material/Refresh";
import AddIcon from "@mui/icons-material/Add";
import UploadIcon from "@mui/icons-material/Upload";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SyncIcon from "@mui/icons-material/Sync";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningIcon from "@mui/icons-material/Warning";
import ErrorIcon from "@mui/icons-material/Error";

interface SyncStatus {
  totalSamples: number;
  pendingSync: number;
  failedSync: number;
  lastSync?: string;
}

const SAMPLE_STATUSES: SampleStatus[] = [
  "pending",
  "collected",
  "received",
  "processing",
  "completed",
  "archived",
  "error",
];

const SAMPLE_TYPES = [
  "Water (Unfiltered)",
  "Water (Filter)",
  "Tissue",
  "Sediment",
  "Mucosal",
  "Biofilter",
  "Other",
];

const SAMPLE_FORMATS = [
  "Tube",
  "Flask",
  "Petri Dish",
  "Filter Paper",
  "Swab",
  "Preservative Solution",
  "Other",
];

const STATUS_COLORS: Record<SampleStatus, "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"> = {
  pending: "warning",
  collected: "info",
  received: "info",
  processing: "primary",
  completed: "success",
  archived: "default",
  error: "error",
};

function SyncStatusBadge({ sample }: { sample: SyncedSample }) {
  const { lastSyncedFromWebapp, lastSyncedFromBenchling, benchlingId } = sample;

  const hasBenchlingId = !!benchlingId;
  const hasWebappSync = !!lastSyncedFromWebapp;
  const hasBenchlingSync = !!lastSyncedFromBenchling;

  if (!hasBenchlingId) {
    return (
      <Tooltip title="Sample not yet synced to Benchling">
        <Chip icon={<SyncIcon />} label="Not Synced" color="default" size="small" />
      </Tooltip>
    );
  }

  if (!hasWebappSync && !hasBenchlingSync) {
    return (
      <Tooltip title="Created but never synced">
        <Chip icon={<WarningIcon />} label="Pending" color="warning" size="small" />
      </Tooltip>
    );
  }

  const webappSyncTime = hasWebappSync ? new Date(lastSyncedFromWebapp).getTime() : 0;
  const benchlingSyncTime = hasBenchlingSync ? new Date(lastSyncedFromBenchling).getTime() : 0;

  if (webappSyncTime > benchlingSyncTime) {
    return (
      <Tooltip title="Changes pending sync to Benchling">
        <Chip icon={<SyncIcon />} label="Pending Webapp→Benchling" color="info" size="small" />
      </Tooltip>
    );
  }

  if (benchlingSyncTime > webappSyncTime) {
    return (
      <Tooltip title="Changes pending sync to Webapp">
        <Chip icon={<SyncIcon />} label="Pending Benchling→Webapp" color="secondary" size="small" />
      </Tooltip>
    );
  }

  return (
    <Tooltip title={`Last synced: ${new Date(lastSyncedFromWebapp).toLocaleString()}`}>
      <Chip icon={<CheckCircleIcon />} label="Synced" color="success" size="small" />
    </Tooltip>
  );
}

function SampleEditorDialog({
  open,
  onClose,
  onSave,
  sample,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (data: Partial<SyncedSample>) => void;
  sample?: SyncedSample;
}) {
  const isEditing = !!sample;

  const [formData, setFormData] = useState({
    sampleId: sample?.sampleId || "",
    clientName: sample?.clientName || "",
    sampleType: sample?.sampleType || "",
    sampleFormat: sample?.sampleFormat || "",
    sampleDate: sample?.sampleDate
      ? new Date(sample.sampleDate).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    sampleStatus: sample?.sampleStatus || "pending" as SampleStatus,
    orderId: sample?.orderId || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.sampleId.trim()) {
      newErrors.sampleId = "Sample ID is required";
    } else if (!/^\d+$/.test(formData.sampleId)) {
      newErrors.sampleId = "Sample ID must be numeric";
    }
    if (!formData.clientName.trim()) {
      newErrors.clientName = "Client name is required";
    }
    if (!formData.sampleType) {
      newErrors.sampleType = "Sample type is required";
    }
    if (!formData.sampleDate) {
      newErrors.sampleDate = "Sample date is required";
    }
    if (!formData.sampleStatus) {
      newErrors.sampleStatus = "Status is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: event.target.value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    const entityRegistryId = `EBM${formData.sampleId.padStart(3, "0")}`;
    onSave({ ...formData, entityRegistryId });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{isEditing ? `Edit ${sample?.entityRegistryId}` : "Add New Sample"}</DialogTitle>
      <DialogContent>
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 3, mt: 1 }}>
          {isEditing
            ? `Editing ${sample?.entityRegistryId}`
            : "New samples will be automatically synced to Benchling with ID format EBMXXX"}
        </Typography>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Sample ID Number"
                value={formData.sampleId}
                onChange={handleChange("sampleId")}
                error={!!errors.sampleId}
                helperText={errors.sampleId || "Numeric ID (e.g., 123 → EBM123)"}
                disabled={isEditing}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Client Name"
                value={formData.clientName}
                onChange={handleChange("clientName")}
                error={!!errors.clientName}
                helperText={errors.clientName}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Sample Type"
                value={formData.sampleType}
                onChange={handleChange("sampleType")}
                error={!!errors.sampleType}
                helperText={errors.sampleType}
                required
              >
                {SAMPLE_TYPES.map((type) => (
                  <MenuItem key={type} value={type}>{type}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Sample Format"
                value={formData.sampleFormat}
                onChange={handleChange("sampleFormat")}
              >
                {SAMPLE_FORMATS.map((format) => (
                  <MenuItem key={format} value={format}>{format}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="Sample Date"
                value={formData.sampleDate}
                onChange={handleChange("sampleDate")}
                error={!!errors.sampleDate}
                helperText={errors.sampleDate}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Status"
                value={formData.sampleStatus}
                onChange={handleChange("sampleStatus")}
                error={!!errors.sampleStatus}
                helperText={errors.sampleStatus}
                required
              >
                {SAMPLE_STATUSES.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Associated Order ID (Optional)"
                value={formData.orderId}
                onChange={handleChange("orderId")}
                placeholder="Link to an existing order"
              />
            </Grid>
          </Grid>
          <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end", gap: 2 }}>
            <Button variant="outlined" onClick={onClose}>Cancel</Button>
            <Button variant="contained" type="submit">
              {isEditing ? "Update Sample" : "Create Sample"}
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

const AdminSamples: NextPage = () => {
  const isMounted = useMounted();
  const { user, sendRequest } = useAuth();
  const [samples, setSamples] = useState<SyncedSample[]>([]);
  const [status, setStatus] = useState<SyncStatus>({
    totalSamples: 0,
    pendingSync: 0,
    failedSync: 0,
  });
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingSample, setEditingSample] = useState<SyncedSample | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info";
  }>({ open: false, message: "", severity: "info" });

  const fetchSamples = useCallback(async () => {
    try {
      const data = await sendRequest("/api/admin/samples/benchling", "GET");
      if (isMounted()) {
        setSamples(data || []);
        setLoading(false);
      }
    } catch (err) {
      console.error("Error fetching samples:", err);
      setSnackbar({ open: true, message: "Failed to fetch samples", severity: "error" });
      setLoading(false);
    }
  }, [isMounted, sendRequest]);

  const fetchStatus = useCallback(async () => {
    try {
      const data = await sendRequest("/api/admin/samples/sync", "GET");
      if (isMounted()) {
        setStatus(data || { totalSamples: 0, pendingSync: 0, failedSync: 0 });
      }
    } catch (err) {
      console.error("Error fetching sync status:", err);
    }
  }, [isMounted, sendRequest]);

  useEffect(() => {
    fetchSamples();
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, [fetchSamples, fetchStatus]);

  const handleImport = async () => {
    setImporting(true);
    try {
      const result = await sendRequest("/api/admin/samples/import", "POST");
      setSnackbar({
        open: true,
        message: `Import completed: ${result.imported} samples imported`,
        severity: "success",
      });
      await fetchSamples();
      await fetchStatus();
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || "Import failed", severity: "error" });
    } finally {
      setImporting(false);
    }
  };

  const handleProcessQueue = async () => {
    try {
      const result = await sendRequest("/api/admin/samples/sync", "POST", { action: "process-queue" });
      setSnackbar({
        open: true,
        message: `Processed: ${result.processed} synced, ${result.failed} failed`,
        severity: result.failed > 0 ? "warning" : "success",
      });
      await fetchSamples();
      await fetchStatus();
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || "Queue processing failed", severity: "error" });
    }
  };

  const handleClearQueue = async () => {
    try {
      await sendRequest("/api/admin/samples/sync", "DELETE");
      setSnackbar({ open: true, message: "Sync queue cleared", severity: "success" });
      await fetchStatus();
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || "Failed to clear queue", severity: "error" });
    }
  };

  const handleAddSample = () => {
    setEditingSample(null);
    setEditorOpen(true);
  };

  const handleEditSample = (sample: SyncedSample) => {
    setEditingSample(sample);
    setEditorOpen(true);
  };

  const handleSaveSample = async (sampleData: Partial<SyncedSample>) => {
    try {
      if (editingSample) {
        await sendRequest("/api/admin/samples/benchling", "PATCH", { id: editingSample.id, ...sampleData });
        setSnackbar({ open: true, message: "Sample updated successfully", severity: "success" });
      } else {
        await sendRequest("/api/admin/samples/benchling", "POST", sampleData);
        setSnackbar({ open: true, message: "Sample created successfully", severity: "success" });
      }
      await fetchSamples();
      await fetchStatus();
      setEditorOpen(false);
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || "Failed to save sample", severity: "error" });
    }
  };

  const handleDeleteSample = async (sampleId: string) => {
    if (!confirm("Are you sure you want to delete this sample?")) return;
    try {
      await sendRequest(`/api/admin/samples/benchling?id=${sampleId}`, "DELETE");
      setSnackbar({ open: true, message: "Sample deleted successfully", severity: "success" });
      await fetchSamples();
      await fetchStatus();
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || "Failed to delete sample", severity: "error" });
    }
  };

  const handleSyncSample = async (sampleId: string) => {
    try {
      await sendRequest("/api/admin/samples/sync", "POST", { action: "sync-sample", sampleId });
      setSnackbar({ open: true, message: "Sample synced successfully", severity: "success" });
      await fetchSamples();
      await fetchStatus();
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || "Failed to sync sample", severity: "error" });
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
          <Typography>Loading samples...</Typography>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <>
      <Head>
        <title>Admin: Sample Sync | Esox Biologics</title>
      </Head>
      <Box component="main" sx={{ backgroundColor: "background.paper", flexGrow: 1, py: 8 }}>
        <Container maxWidth="xl">
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" gutterBottom>Benchling Sample Sync</Typography>
            <Typography variant="body1" color="text.secondary">
              Manage two-way synchronization of metagenomics samples (EBM prefixed) between Benchling and the webapp.
            </Typography>
          </Box>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" variant="subtitle2">Total Samples</Typography>
                  <Typography variant="h4">{status.totalSamples}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" variant="subtitle2">Pending Sync</Typography>
                  <Typography variant="h4" color={status.pendingSync > 0 ? "warning.main" : "text.primary"}>
                    {status.pendingSync}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" variant="subtitle2">Failed Sync</Typography>
                  <Typography variant="h4" color={status.failedSync > 0 ? "error.main" : "text.primary"}>
                    {status.failedSync}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" variant="subtitle2">Last Sync</Typography>
                  <Typography variant="body1">
                    {status.lastSync ? new Date(status.lastSync).toLocaleString() : "Never"}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Box sx={{ mb: 4, display: "flex", gap: 2, flexWrap: "wrap" }}>
            <Button variant="contained" startIcon={<UploadIcon />} onClick={handleImport} disabled={importing}>
              {importing ? "Importing..." : "Import from Benchling"}
            </Button>
            <Button variant="outlined" startIcon={<RefreshIcon />} onClick={handleProcessQueue}>
              Process Sync Queue
            </Button>
            <Button variant="outlined" color="error" onClick={handleClearQueue}>
              Clear Queue
            </Button>
            <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleAddSample}>
              Add Sample
            </Button>
          </Box>

          <Paper>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Sample ID</TableCell>
                    <TableCell>Client Name</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Format</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Sync Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {samples.map((sample) => (
                    <TableRow key={sample.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">{sample.entityRegistryId}</Typography>
                      </TableCell>
                      <TableCell>{sample.clientName}</TableCell>
                      <TableCell>{sample.sampleType}</TableCell>
                      <TableCell>{sample.sampleFormat || "-"}</TableCell>
                      <TableCell>
                        {sample.sampleDate ? new Date(sample.sampleDate).toLocaleDateString() : "-"}
                      </TableCell>
                      <TableCell>
                        <Chip label={sample.sampleStatus} color={STATUS_COLORS[sample.sampleStatus]} size="small" sx={{ textTransform: "capitalize" }} />
                      </TableCell>
                      <TableCell><SyncStatusBadge sample={sample} /></TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 0.5 }}>
                          <Tooltip title="Edit"><IconButton size="small" onClick={() => handleEditSample(sample)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                          <Tooltip title="Sync"><IconButton size="small" onClick={() => handleSyncSample(sample.id)} color="primary"><SyncIcon fontSize="small" /></IconButton></Tooltip>
                          <Tooltip title="Delete"><IconButton size="small" onClick={() => handleDeleteSample(sample.id)} color="error"><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                  {samples.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
                        <Typography variant="body1" sx={{ py: 4 }}>
                          No samples found. Import from Benchling to get started.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Container>
      </Box>

      <SampleEditorDialog open={editorOpen} onClose={() => setEditorOpen(false)} onSave={handleSaveSample} sample={editingSample || undefined} />

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>{snackbar.message}</Alert>
      </Snackbar>
    </>
  );
};

AdminSamples.getLayout = (page) => (
  <AdminGuard>
    <DashboardLayout>{page}</DashboardLayout>
  </AdminGuard>
);

export default AdminSamples;

