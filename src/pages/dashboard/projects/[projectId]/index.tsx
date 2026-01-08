import { useCallback, useEffect, useState } from "react";
import type { NextPage } from "next";
import Head from "next/head";
import NextLink from "next/link";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Typography,
  Chip,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Autocomplete,
  LinearProgress,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LinkIcon from "@mui/icons-material/Link";
import { AuthGuard, ApprovedUserGuard } from "../../../../components/authentication/auth-guard";
import { DashboardLayout } from "../../../../components/dashboard/dashboard-layout";
import { useMounted } from "../../../../hooks/use-mounted";
import { gtm } from "../../../../lib/client/gtm";
import { useTypedAuth } from "src/hooks/use-auth";
import type { ProjectWithStats, ProjectSample } from "src/types/project";
import { orderStore } from "src/lib/client/store/orders";


interface OrderSummary {
  id: string;
  title: string;
  status: string;
  createdAt: number;
  customerName: string;
}

const ProjectDetailsPage: NextPage = () => {
  const isMounted = useMounted();
  const router = useRouter();
  const { user, sendRequest } = useTypedAuth();
  const projectId = router.query.projectId as string;
  
  const [project, setProject] = useState<ProjectWithStats | null>(null);
  const [samples, setSamples] = useState<ProjectSample[]>([]);
  const [legacyOrders, setLegacyOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState("samples");
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [linking, setLinking] = useState(false);

  const fetchData = useCallback(async () => {
    if (!projectId || !user) return;

    try {
      setLoading(true);
      
      // Fetch project
      const projectData = await sendRequest<undefined, ProjectWithStats>(
        `/api/projects/${projectId}`,
        "GET"
      );
      
      if (!projectData) {
        toast.error("Project not found");
        router.push("/dashboard/projects");
        return;
      }
      
      if (isMounted()) {
        setProject(projectData);
      }

      // Fetch samples
      const samplesData = await sendRequest<undefined, ProjectSample[]>(
        `/api/projects/${projectId}/samples`,
        "GET"
      );
      
      if (isMounted()) {
        setSamples(samplesData || []);
      }

      // Fetch legacy orders (only for admin to link)
      if (user.isAdmin) {
        const orders = await orderStore.getOrders();
        if (orders && isMounted()) {
          const orderSummaries: OrderSummary[] = orders
            .filter((order) => !projectData.linkedOrderIds.includes(order.id))
            .map((order) => ({
              id: order.id,
              title: order.title,
              status: order.status,
              createdAt: order.createdAt,
              customerName: order.customer?.name || "Unknown",
            }));
          setLegacyOrders(orderSummaries);
        }
      }
    } catch (error) {
      console.error("Error fetching project data:", error);
      toast.error("Failed to load project data");
    } finally {
      setLoading(false);
    }
  }, [projectId, user, router, sendRequest, isMounted]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleLinkOrder = async () => {
    if (!selectedOrderId || !projectId) return;
    
    try {
      setLinking(true);
      await sendRequest(`/api/projects/${projectId}/link-order`, "POST", {
        orderId: selectedOrderId,
      });
      
      toast.success("Order linked to project successfully!");
      setLinkDialogOpen(false);
      setSelectedOrderId(null);
      fetchData(); // Refresh data
    } catch (error: any) {
      console.error("Error linking order:", error);
      toast.error(error?.message || "Failed to link order");
    } finally {
      setLinking(false);
    }
  };

  const handleUnlinkOrder = async (orderId: string) => {
    if (!confirm("Are you sure you want to unlink this order?")) {
      return;
    }
    
    try {
      await sendRequest(`/api/projects/${projectId}/link-order`, "DELETE", {
        orderId: orderId,
      });
      
      toast.success("Order unlinked successfully!");
      fetchData(); // Refresh data
    } catch (error: any) {
      console.error("Error unlinking order:", error);
      toast.error(error?.message || "Failed to unlink order");
    }
  };

  const formatDate = (timestamp: number | undefined) => {
    if (!timestamp) return "-";
    return new Date(timestamp).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getSampleStatusColor = (status: string): "success" | "info" | "warning" | "default" => {
    switch (status) {
      case "complete":
        return "success";
      case "processing":
        return "info";
      case "sample-returned":
        return "warning";
      default:
        return "default";
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 4 }}>
        <LinearProgress />
      </Box>
    );
  }

  if (!project) {
    return null;
  }

  return (
    <>
      <Head>
        <title>{project.title} | Esox Biologics</title>
      </Head>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
        }}
      >
        <Container maxWidth="xl">
          <NextLink href="/dashboard/projects" passHref legacyBehavior>
            <Button startIcon={<ArrowBackIcon />} sx={{ mb: 3 }}>
              Back to Projects
            </Button>
          </NextLink>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h4">{project.title}</Typography>
            <Typography variant="body1" color="textSecondary" sx={{ mt: 1 }}>
              {project.organisationName}
            </Typography>
            <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
              <Chip
                label={project.status}
                color={project.status === "active" ? "success" : "default"}
              />
              <Chip label={`${project.sampleCount} samples`} variant="outlined" />
              <Chip label={`${project.linkedOrderCount} linked orders`} variant="outlined" />
            </Box>
          </Box>

          <Tabs value={currentTab} onChange={(e, v) => setCurrentTab(v)} sx={{ mb: 3 }}>
            <Tab value="samples" label="Samples" />
            <Tab value="orders" label="Linked Orders" />
            <Tab value="details" label="Details" />
          </Tabs>

          {/* Samples Tab */}
          {currentTab === "samples" && (
            <Box>
              <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
                <Button variant="contained" onClick={() => router.push(`/dashboard/projects/${projectId}/sample-submission`)}>
                  Add Sample
                </Button>
              </Box>
              
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Sample Name</TableCell>
                      <TableCell>Service</TableCell>
                      <TableCell>Sample Type</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Submitted</TableCell>
                      <TableCell>Report</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {samples.map((sample) => (
                      <TableRow key={sample.id}>
                        <TableCell>{sample.name}</TableCell>
                        <TableCell>{sample.service}</TableCell>
                        <TableCell>{sample.sampleType}</TableCell>
                        <TableCell>
                          <Chip
                            label={sample.status}
                            color={getSampleStatusColor(sample.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{formatDate(sample.submittedAt)}</TableCell>
                        <TableCell>
                          {sample.reportUrl ? (
                            <Button size="small" href={sample.reportUrl} target="_blank">
                              View
                            </Button>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {samples.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          <Typography variant="body2" color="textSecondary" sx={{ py: 4 }}>
                            No samples yet. Click "Add Sample" to submit samples to this project.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* Linked Orders Tab */}
          {currentTab === "orders" && (
            <Box>
              <AdminGuard>
                <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<LinkIcon />}
                    onClick={() => setLinkDialogOpen(true)}
                  >
                    Link Legacy Order
                  </Button>
                </Box>
              </AdminGuard>
              
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Order ID</TableCell>
                      <TableCell>Title</TableCell>
                      <TableCell>Customer</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Created</TableCell>
                      <AdminGuard>
                        <TableCell align="right">Actions</TableCell>
                      </AdminGuard>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {project.linkedOrderIds.length > 0 ? (
                      project.linkedOrderIds.map((orderId) => {
                        const order = legacyOrders.find((o) => o.id === orderId) || {
                          id: orderId,
                          title: "Legacy Order",
                          status: "unknown",
                          createdAt: 0,
                          customerName: "Unknown",
                        };
                        return (
                          <TableRow key={orderId}>
                            <TableCell>
                              <Typography variant="body2" fontFamily="monospace">
                                {orderId}
                              </Typography>
                            </TableCell>
                            <TableCell>{order.title}</TableCell>
                            <TableCell>{order.customerName}</TableCell>
                            <TableCell>{order.status}</TableCell>
                            <TableCell>{formatDate(order.createdAt)}</TableCell>
                            <AdminGuard>
                              <TableCell align="right">
                                <Button
                                  size="small"
                                  color="error"
                                  onClick={() => handleUnlinkOrder(orderId)}
                                >
                                  Unlink
                                </Button>
                              </TableCell>
                            </AdminGuard>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          <Typography variant="body2" color="textSecondary" sx={{ py: 4 }}>
                            No legacy orders linked to this project. {user?.isAdmin && "Use the 'Link Legacy Order' button to add existing orders."}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* Details Tab */}
          {currentTab === "details" && (
            <Card>
              <CardContent>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Description
                    </Typography>
                    <Typography variant="body1">
                      {project.description || "No description provided."}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Services
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1 }}>
                      {project.services.map((service) => (
                        <Chip key={service} label={service} size="small" />
                      ))}
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Sample Types
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1 }}>
                      {project.sampleTypes.map((type) => (
                        <Chip key={type} label={type} size="small" variant="outlined" />
                      ))}
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Created
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(project.createdAt)}
                    </Typography>
                  </Grid>
                  {project.proposal && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="textSecondary">
                        Proposal
                      </Typography>
                      <Typography variant="body1">
                        {project.proposal}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          )}
        </Container>
      </Box>

      {/* Link Order Dialog */}
      <Dialog open={linkDialogOpen} onClose={() => setLinkDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Link Legacy Order</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Select an order to link to this project. This will preserve the historical connection between the order and the project.
          </Typography>
          <Autocomplete
            options={legacyOrders}
            getOptionLabel={(option) => `${option.id} - ${option.title}`}
            value={legacyOrders.find((o) => o.id === selectedOrderId) || null}
            onChange={(e, newValue) => setSelectedOrderId(newValue?.id || null)}
            renderInput={(params) => (
              <TextField {...params} label="Select Order" fullWidth />
            )}
            renderOption={(props, option) => (
              <li {...props} key={option.id}>
                <Box>
                  <Typography variant="body1">{option.title}</Typography>
                  <Typography variant="caption" color="textSecondary">
                    {option.id} • {option.customerName}
                  </Typography>
                </Box>
              </li>
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLinkDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleLinkOrder}
            disabled={!selectedOrderId || linking}
          >
            {linking ? "Linking..." : "Link Order"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

ProjectDetailsPage.getLayout = (page) => (
  <AuthGuard>
    <ApprovedUserGuard>
      <DashboardLayout>{page}</DashboardLayout>
    </ApprovedUserGuard>
  </AuthGuard>
);

export default ProjectDetailsPage;

