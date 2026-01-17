import { useCallback, useEffect, useState } from "react";
import type { NextPage } from "next";
import Head from "next/head";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
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
  AlertTitle,
} from "@mui/material";
import { AdminGuard } from "../../../components/authentication/auth-guard";
import { DashboardLayout } from "../../../components/dashboard/dashboard-layout";
import { SyncStatusBadge } from "../../../components/admin/samples/sync-status-badge";
import { SampleEditor } from "../../../components/admin/samples/sample-editor";
import { useMounted } from "../../../hooks/use-mounted";
import { useAuth } from "src/hooks/use-auth";
import { SyncedSample, SampleStatus } from "src/types/sync";
import RefreshIcon from "@mui/icons-material/Refresh";
import AddIcon from "@mui/icons-material/Add";
import DownloadIcon from "@mui/icons-material/Download";
import UploadIcon from "@mui/icons-material/Upload";

interface SyncStatus {
  totalSamples: number;
  pendingSync: number;
  failedSync: number;
  lastSync?: string;
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
      }
    } catch (err) {
      console.error("Error fetching samples:", err);
      setSnackbar({
        open: true,
        message: "Failed to fetch samples",
        severity: "error",
      });
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
    
    // Refresh status every 30 seconds
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
      setSnackbar({
        open: true,
        message: err.message || "Import failed",
        severity: "error",
      });
    } finally {
      setImporting(false);
    }
  };

  const handleProcessQueue = async () => {
    try {
      const result = await sendRequest("/api/admin/samples/sync", "POST", {
        action: "process-queue",
      });
      setSnackbar({
        open: true,
        message: `Processed: ${result.synced} synced, ${result.failed} failed`,
        severity: result.failed > 0 ? "warning" : "success",
      });
      await fetchSamples();
      await fetchStatus();
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.message || "Queue processing failed",
        severity: "error",
      });
    }
  };

  const handleClearQueue = async () => {
    try {
      await sendRequest("/api/admin/samples/sync", "DELETE");
      setSnackbar({
        open: true,
        message: "Sync queue cleared",
        severity: "success",
      });
      await fetchStatus();
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.message || "Failed to clear queue",
        severity: "error",
      });
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
        await sendRequest("/api/admin/samples/benchling", "PATCH", {
          id: editingSample.id,
          ...sampleData,
        });
        setSnackbar({
          open: true,
          message: "Sample updated successfully",
          severity: "success",
        });
      } else {
        await sendRequest("/api/admin/samples/benchling", "POST", sampleData);
        setSnackbar({
          open: true,
          message: "Sample created successfully",
          severity: "success",
        });
      }
      await fetchSamples();
      await fetchStatus();
      setEditorOpen(false);
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.message || "Failed to save sample",
        severity: "error",
      });
    }
  };

  const handleDeleteSample = async (sampleId: string) => {
    if (!confirm("Are you sure you want to delete this sample?")) return;
    
    try {
      await sendRequest(`/api/admin/samples/benchling?id=${sampleId}`, "DELETE");
      setSnackbar({
        open: true,
        message: "Sample deleted successfully",
        severity: "success",
      });
      await fetchSamples();
      await fetchStatus();
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.message || "Failed to delete sample",
        severity: "error",
      });
    }
  };

  const handleSyncSample = async (sampleId: string) => {
    try {
      await sendRequest("/api/admin/samples/sync", "POST", {
        action: "sync-sample",
        sampleId,
      });
      setSnackbar({
        open: true,
        message: "Sample synced successfully",
        severity: "success",
      });
      await fetchSamples();
      await fetchStatus();
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.message || "Failed to sync sample",
        severity: "error",
      });
    }
  };

  const getStatusColor = (status: SampleStatus): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
    const colors: Record<SampleStatus, "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"> = {
      pending: "warning",
      collected: "info",
      received: "info",
      processing: "primary",
      completed: "success",
      archived: "default",
      error: "error",
    };
    return colors[status] || "default";
  };

  return (
    <>
      <Head>
        <title>Admin: Sample Sync | Esox Biologics</title>
      </Head>
      
      <Box
        component="main"
        sx={{
          backgroundColor: "background.paper",
          flexGrow: 1,
          py: 8,
        }}
      >
        <Container maxWidth="xl">
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" gutterBottom>
              Benchling Sample Sync
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage two-way synchronization of metagenomics samples (EBM prefixed) between Benchling and the webapp.
            </Typography>
          </Box>

          {/* Status Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" variant="subtitle2">
                    Total Samples
                  </Typography>
                  <Typography variant="h4">{status.totalSamples}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" variant="subtitle2">
                    Pending Sync
                  </Typography>
                  <Typography variant="h4" color={status.pendingSync > 0 ? "warning.main" : "text.primary"}>
                    {status.pendingSync}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" variant="subtitle2">
                    Failed Sync
                  </Typography>
                  <Typography variant="h4" color={status.failedSync > 0 ? "error.main" : "text.primary"}>
                    {status.failedSync}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" variant="subtitle2">
                    Last Sync
                  </Typography>
                  <Typography variant="body1">
                    {status.lastSync 
                      ? new Date(status.lastSync).toLocaleString()
                      : "Never"
                    }
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Actions */}
          <Box sx={{ mb: 4, display: "flex", gap: 2, flexWrap: "wrap" }}>
            <Button
              variant="contained"
              startIcon={<UploadIcon />}
              onClick={handleImport}
              disabled={importing}
            >
              {importing ? "Importing..." : "Import from Benchling"}
            </Button>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleProcessQueue}
            >
              Process Sync Queue
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={handleClearQueue}
            >
              Clear Queue
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleAddSample}
            >
              Add Sample
            </Button>
          </Box>

          {/* Samples Table */}
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
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {samples.map((sample) => (
                    <TableRow key={sample.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {sample.entityRegistryId}
                        </Typography>
                      </TableCell>
                      <TableCell>{sample.clientName}</TableCell>
                      <TableCell>{sample.sampleType}</TableCell>
                      <TableCell>{sample.sampleFormat || "-"}</TableCell>
                      <TableCell>
                        {sample.sampleDate 
                          ? new Date(sample.sampleDate).toLocaleDateString()
                          : "-"
                        }
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={sample.sampleStatus}
                          color={getStatusColor(sample.sampleStatus)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <SyncStatusBadge sample={sample} />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", gap: 0.5 }}>
                          <Button
                            size="small"
                            onClick={() => handleEditSample(sample)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="small"
                            onClick={() => handleSyncSample(sample.id)}
                          >
                            Sync
                          </Button>
                          <Button
                            size="small"
                            color="error"
                            onClick={() => handleDeleteSample(sample.id)}
                          >
                            Delete
                          </Button>
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

      {/* Sample Editor Dialog */}
      <Dialog open={editorOpen} onClose={() => setEditorOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingSample ? "Edit Sample" : "Add New Sample"}
        </DialogTitle>
        <DialogContent>
          <SampleEditor
            sample={editingSample || undefined}
            onSave={handleSaveSample}
            onCancel={() => setEditorOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
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

