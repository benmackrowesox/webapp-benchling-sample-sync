import { useCallback, useEffect, useState } from "react";
import type { NextPage } from "next";
import Head from "next/head";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { AdminGuard } from "../../../components/authentication/auth-guard";
import { DashboardLayout } from "../../../components/dashboard/dashboard-layout";
import { useMounted } from "../../../hooks/use-mounted";
import { gtm } from "../../../lib/client/gtm";
import { useTypedAuth } from "src/hooks/use-auth";
import type { Organisation } from "src/types/organisation";

interface OrganisationWithStats extends Organisation {
  userCount: number;
  projectCount: number;
}

const OrganisationsPage: NextPage = () => {
  const isMounted = useMounted();
  const { user, sendRequest } = useTypedAuth();
  const [organisations, setOrganisations] = useState<OrganisationWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organisation | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    gtm.push({ event: "page_view" });
  }, []);

  const fetchOrganisations = useCallback(async () => {
    try {
      setLoading(true);
      const data = await sendRequest<undefined, Organisation[]>("/api/organisations", "GET");
      if (!data) {
        setOrganisations([]);
        return;
      }

      // Get stats for each organisation
      const orgsWithStats = await Promise.all(
        data.map(async (org) => {
          let projectCount = 0;
          try {
            const projectsSnapshot = await sendRequest<undefined, any[]>(
              `/api/projects?organisationId=${org.id}`,
              "GET"
            );
            projectCount = projectsSnapshot?.length || 0;
          } catch (error) {
            console.error(`Error fetching projects for org ${org.id}:`, error);
          }

          return {
            ...org,
            userCount: org.users.length,
            projectCount,
          };
        })
      );

      if (isMounted()) {
        setOrganisations(orgsWithStats);
      }
    } catch (error) {
      console.error("Error fetching organisations:", error);
    } finally {
      setLoading(false);
    }
  }, [isMounted, sendRequest]);

  useEffect(() => {
    fetchOrganisations();
  }, [fetchOrganisations]);

  const handleOpenDialog = (org?: Organisation) => {
    if (org) {
      setEditingOrg(org);
      setFormData({
        name: org.name,
        description: org.description || "",
      });
    } else {
      setEditingOrg(null);
      setFormData({ name: "", description: "" });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingOrg(null);
    setFormData({ name: "", description: "" });
  };

  const handleSave = async () => {
    try {
      if (editingOrg) {
        await sendRequest(`/api/organisations/${editingOrg.id}`, "PATCH", formData);
      } else {
        await sendRequest("/api/organisations", "POST", formData);
      }
      handleCloseDialog();
      await fetchOrganisations();
    } catch (error) {
      console.error("Error saving organisation:", error);
    }
  };

  const handleDelete = async (orgId: string) => {
    if (!confirm("Are you sure you want to archive this organisation?")) {
      return;
    }
    
    try {
      await sendRequest(`/api/organisations/${orgId}`, "DELETE");
      await fetchOrganisations();
    } catch (error) {
      console.error("Error archiving organisation:", error);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <>
      <Head>
        <title>Organisations | Esox Biologics</title>
      </Head>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
        }}
      >
        <Container maxWidth="xl">
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
            <Typography variant="h4">Organisations</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              New Organisation
            </Button>
          </Box>

          {loading ? (
            <Typography>Loading...</Typography>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Users</TableCell>
                    <TableCell>Projects</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {organisations.map((org) => (
                    <TableRow key={org.id}>
                      <TableCell>
                        <Typography variant="body1" fontWeight={500}>
                          {org.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="textSecondary">
                          {org.description || "-"}
                        </Typography>
                      </TableCell>
                      <TableCell>{org.userCount}</TableCell>
                      <TableCell>{org.projectCount}</TableCell>
                      <TableCell>{formatDate(org.createdAt)}</TableCell>
                      <TableCell>
                        <Chip
                          label={org.isActive ? "Active" : "Archived"}
                          color={org.isActive ? "success" : "default"}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(org)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(org.id)}
                          color="error"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {organisations.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        <Typography variant="body2" color="textSecondary" sx={{ py: 4 }}>
                          No organisations yet. Create your first organisation to get started.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Container>
      </Box>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingOrg ? "Edit Organisation" : "Create Organisation"}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              fullWidth
              label="Organisation Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={!formData.name.trim()}
          >
            {editingOrg ? "Save Changes" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

OrganisationsPage.getLayout = (page) => (
  <AdminGuard>
    <DashboardLayout>{page}</DashboardLayout>
  </AdminGuard>
);

export default OrganisationsPage;

