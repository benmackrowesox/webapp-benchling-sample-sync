import { useCallback, useEffect, useState } from "react";
import type { NextPage } from "next";
import Head from "next/head";
import NextLink from "next/link";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Typography,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tab,
  Tabs,
  TextField,
  InputAdornment,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import { 
  AuthGuard, 
  ApprovedUserGuard,
  AdminGuard 
} from "../../../components/authentication/auth-guard";
import { DashboardLayout } from "../../../components/dashboard/dashboard-layout";
import { useMounted } from "../../../hooks/use-mounted";
import { gtm } from "../../../lib/client/gtm";
import { useTypedAuth } from "src/hooks/use-auth";
import type { ProjectWithStats, ProjectStatus } from "src/types/project";
import { useRouter } from "next/router";

interface TabValue {
  label: string;
  value: ProjectStatus | "all";
}

const tabs: TabValue[] = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Completed", value: "completed" },
  { label: "Archived", value: "archived" },
];

const ProjectsPage: NextPage = () => {
  const isMounted = useMounted();
  const router = useRouter();
  const { user, sendRequest } = useTypedAuth();
  const [projects, setProjects] = useState<ProjectWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState<ProjectStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    gtm.push({ event: "page_view" });
  }, []);

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      const data = await sendRequest<undefined, ProjectWithStats[]>("/api/projects", "GET");
      if (isMounted()) {
        setProjects(data || []);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  }, [isMounted, sendRequest]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleTabsChange = (event: any, value: ProjectStatus | "all"): void => {
    setCurrentTab(value);
  };

  const formatDate = (timestamp: number | undefined) => {
    if (!timestamp) return "-";
    return new Date(timestamp).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getStatusColor = (status: ProjectStatus): "success" | "info" | "default" | "warning" => {
    switch (status) {
      case "active":
        return "success";
      case "completed":
        return "info";
      case "archived":
        return "default";
      case "draft":
        return "warning";
      default:
        return "default";
    }
  };

  // Filter projects
  const filteredProjects = projects.filter((project) => {
    // Status filter
    if (currentTab !== "all" && project.status !== currentTab) {
      return false;
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        project.title.toLowerCase().includes(query) ||
        project.organisationName.toLowerCase().includes(query)
      );
    }

    return true;
  });

  return (
    <>
      <Head>
        <title>Projects | Esox Biologics</title>
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
            <Typography variant="h4">Projects</Typography>
            <AdminGuard>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => router.push("/dashboard/projects/new")}
              >
                New Project
              </Button>
            </AdminGuard>
          </Box>

          <Card sx={{ mb: 3 }}>
            <Tabs
              indicatorColor="primary"
              onChange={handleTabsChange}
              scrollButtons="auto"
              textColor="primary"
              value={currentTab}
              variant="scrollable"
              sx={{ borderBottom: 1, borderColor: "divider", px: 2 }}
            >
              {tabs.map((tab) => (
                <Tab key={tab.value} label={tab.label} value={tab.value} />
              ))}
            </Tabs>
          </Card>

          <Card sx={{ mb: 3 }}>
            <Box sx={{ p: 2 }}>
              <TextField
                fullWidth
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                size="small"
              />
            </Box>
          </Card>

          {loading ? (
            <Typography>Loading...</Typography>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Project</TableCell>
                    <TableCell>Organisation</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Samples</TableCell>
                    <TableCell>Linked Orders</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredProjects.map((project) => (
                    <TableRow key={project.id} hover>
                      <TableCell>
                        <Typography variant="body1" fontWeight={500}>
                          {project.title}
                        </Typography>
                        {project.description && (
                          <Typography variant="body2" color="textSecondary" sx={{ 
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            maxWidth: 300,
                          }}>
                            {project.description}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>{project.organisationName}</TableCell>
                      <TableCell>
                        <Chip
                          label={project.status}
                          color={getStatusColor(project.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {project.completedSampleCount}/{project.sampleCount}
                      </TableCell>
                      <TableCell>{project.linkedOrderCount}</TableCell>
                      <TableCell>{formatDate(project.createdAt)}</TableCell>
                      <TableCell align="right">
                        <Button
                          size="small"
                          onClick={() => router.push(`/dashboard/projects/${project.id}`)}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredProjects.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        <Typography variant="body2" color="textSecondary" sx={{ py: 4 }}>
                          {searchQuery 
                            ? "No projects match your search."
                            : currentTab !== "all"
                            ? `No ${currentTab} projects.`
                            : "No projects yet. Ask an admin to create a project for your organisation."
                          }
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
    </>
  );
};

ProjectsPage.getLayout = (page) => (
  <AuthGuard>
    <ApprovedUserGuard>
      <DashboardLayout>{page}</DashboardLayout>
    </ApprovedUserGuard>
  </AuthGuard>
);

export default ProjectsPage;

