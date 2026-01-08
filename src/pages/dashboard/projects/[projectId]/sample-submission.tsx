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
  Divider,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import SaveIcon from "@mui/icons-material/Save";
import { AuthGuard, ApprovedUserGuard } from "../../../../components/authentication/auth-guard";
import { DashboardLayout } from "../../../../components/dashboard/dashboard-layout";
import { useMounted } from "../../../../hooks/use-mounted";
import { gtm } from "../../../../lib/client/gtm";
import { useTypedAuth } from "src/hooks/use-auth";
import type { ProjectWithStats, ProjectSample, ProjectMetadataField } from "src/types/project";

interface MetadataSubmission {
  name: string;
  displayName: string;
  units?: string;
  value: any;
}


interface UnsubmittedSample {
  name: string;
  service: string;
  sampleType: string;
  metadata: Record<string, MetadataSubmission>;
  collectedAt?: number;
}

const SampleSubmissionPage: NextPage = () => {
  const isMounted = useMounted();
  const router = useRouter();
  const { user, sendRequest } = useTypedAuth();
  const projectId = router.query.projectId as string;
  
  const [project, setProject] = useState<ProjectWithStats | null>(null);
  const [samples, setSamples] = useState<ProjectSample[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // New sample form
  const [newSample, setNewSample] = useState<UnsubmittedSample>({
    name: "",
    service: "",
    sampleType: "",
    metadata: {},
    collectedAt: undefined,
  });
  const [samplesToSubmit, setSamplesToSubmit] = useState<UnsubmittedSample[]>([]);

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

      // Fetch existing samples
      const samplesData = await sendRequest<undefined, ProjectSample[]>(
        `/api/projects/${projectId}/samples`,
        "GET"
      );
      
      if (isMounted()) {
        setSamples(samplesData || []);
      }
    } catch (error) {
      console.error("Error fetching project data:", error);
      toast.error("Failed to load project data");
    } finally {
      setLoading(false);
    }
  }, [projectId, user, router, sendRequest, isMounted]);

  useEffect(() => {
    gtm.push({ event: "page_view" });
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddSample = () => {
    if (!newSample.name.trim()) {
      toast.error("Sample name is required");
      return;
    }
    if (!newSample.service) {
      toast.error("Please select a service");
      return;
    }
    if (!newSample.sampleType) {
      toast.error("Please select a sample type");
      return;
    }

    setSamplesToSubmit([...samplesToSubmit, { ...newSample }]);
    setNewSample({
      name: "",
      service: "",
      sampleType: "",
      metadata: {},
      collectedAt: undefined,
    });
  };

  const handleRemoveSample = (index: number) => {
    setSamplesToSubmit(samplesToSubmit.filter((_, i) => i !== index));
  };

  const handleMetadataChange = (fieldName: string, value: any) => {
    setNewSample((prev) => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        [fieldName]: {
          ...prev.metadata[fieldName],
          value: value,
        },
      },
    }));
  };

  const handleSubmitSamples = async () => {
    if (samplesToSubmit.length === 0) {
      toast.error("Please add at least one sample");
      return;
    }

    try {
      setSaving(true);
      
      for (const sample of samplesToSubmit) {
        await sendRequest(`/api/projects/${projectId}/samples`, "POST", {
          name: sample.name,
          service: sample.service,
          sampleType: sample.sampleType,
          metadata: sample.metadata,
          collectedAt: sample.collectedAt,
        });
      }

      toast.success(`${samplesToSubmit.length} sample(s) submitted successfully!`);
      setSamplesToSubmit([]);
      fetchData(); // Refresh samples list
    } catch (error: any) {
      console.error("Error submitting samples:", error);
      toast.error(error?.message || "Failed to submit samples");
    } finally {
      setSaving(false);
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

  if (loading) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  if (!project) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Submit Samples - {project.title} | Esox Biologics</title>
      </Head>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
        }}
      >
        <Container maxWidth="xl">
          <NextLink href={`/dashboard/projects/${projectId}`} passHref legacyBehavior>
            <Button startIcon={<ArrowBackIcon />} sx={{ mb: 3 }}>
              Back to Project
            </Button>
          </NextLink>

          <Typography variant="h4" sx={{ mb: 2 }}>
            Sample Submission
          </Typography>
          <Typography variant="h6" color="textSecondary" sx={{ mb: 4 }}>
            {project.title}
          </Typography>

          <Grid container spacing={4}>
            {/* Add New Samples */}
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 3 }}>
                    Add New Sample
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Sample Name"
                        value={newSample.name}
                        onChange={(e) => setNewSample({ ...newSample, name: e.target.value })}
                        required
                        placeholder="e.g., Sample-001"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        select
                        label="Service"
                        value={newSample.service}
                        onChange={(e) => setNewSample({ ...newSample, service: e.target.value })}
                        SelectProps={{ native: true }}
                        required
                      >
                        <option value="">Select service...</option>
                        {project.services.map((service) => (
                          <option key={service} value={service}>
                            {service}
                          </option>
                        ))}
                      </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        select
                        label="Sample Type"
                        value={newSample.sampleType}
                        onChange={(e) => setNewSample({ ...newSample, sampleType: e.target.value })}
                        SelectProps={{ native: true }}
                        required
                      >
                        <option value="">Select sample type...</option>
                        {project.sampleTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Collection Date"
                        type="date"
                        InputLabelProps={{ shrink: true }}
                        value={newSample.collectedAt 
                          ? new Date(newSample.collectedAt).toISOString().split("T")[0]
                          : ""
                        }
                        onChange={(e) => {
                          const date = e.target.value 
                            ? new Date(e.target.value).getTime() 
                            : undefined;
                          setNewSample({ ...newSample, collectedAt: date });
                        }}
                      />
                    </Grid>
                  </Grid>

                  {/* Dynamic Metadata Fields */}
                  {project.metadataFields.length > 0 && (
                    <>
                      <Divider sx={{ my: 3 }} />
                      <Typography variant="subtitle1" sx={{ mb: 2 }}>
                        Sample Information
                      </Typography>
                      <Grid container spacing={2}>
                        {project.metadataFields.map((field) => (
                          <Grid item xs={12} sm={6} md={field.gridColumnWidth || 6} key={field.name}>
                            <TextField
                              fullWidth
                              label={field.displayName}
                              type={field.type === "number" ? "number" : "text"}
                              value={
                                newSample.metadata[field.name]?.value || ""
                              }
                              onChange={(e) => handleMetadataChange(field.name, e.target.value)}
                              helperText={field.helpText}
                              InputProps={{
                                endAdornment: field.units && (
                                  <Typography variant="caption" color="textSecondary">
                                    {field.units}
                                  </Typography>
                                ),
                              }}
                            />
                          </Grid>
                        ))}
                      </Grid>
                    </>
                  )}

                  <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={handleAddSample}
                      disabled={!newSample.name || !newSample.service || !newSample.sampleType}
                    >
                      Add to Queue
                    </Button>
                  </Box>
                </CardContent>
              </Card>

              {/* Samples Queue */}
              {samplesToSubmit.length > 0 && (
                <Card sx={{ mt: 3 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Samples to Submit ({samplesToSubmit.length})
                    </Typography>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Service</TableCell>
                            <TableCell>Sample Type</TableCell>
                            <TableCell align="right">Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {samplesToSubmit.map((sample, index) => (
                            <TableRow key={index}>
                              <TableCell>{sample.name}</TableCell>
                              <TableCell>{sample.service}</TableCell>
                              <TableCell>{sample.sampleType}</TableCell>
                              <TableCell align="right">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleRemoveSample(index)}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                    <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
                      <Button
                        variant="contained"
                        startIcon={<SaveIcon />}
                        onClick={handleSubmitSamples}
                        disabled={saving}
                      >
                        {saving ? "Submitting..." : "Submit All Samples"}
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              )}
            </Grid>

            {/* Project Info */}
            <Grid item xs={12} md={4}>
              <Card sx={{ position: "sticky", top: 20 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Project Details
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    {project.description || "No description"}
                  </Typography>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Services
                  </Typography>
                  <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", mb: 2 }}>
                    {project.services.map((service) => (
                      <Chip key={service} label={service} size="small" />
                    ))}
                  </Box>

                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Sample Types
                  </Typography>
                  <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", mb: 2 }}>
                    {project.sampleTypes.map((type) => (
                      <Chip key={type} label={type} size="small" variant="outlined" />
                    ))}
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Existing Samples
                  </Typography>
                  <Typography variant="body2">
                    {project.completedSampleCount} of {project.sampleCount} completed
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Existing Samples */}
          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" sx={{ mb: 2 }}>
              Submitted Samples
            </Typography>
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
                          color={sample.status === "complete" ? "success" : "info"}
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
                          No samples submitted yet.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Container>
      </Box>
    </>
  );
};

SampleSubmissionPage.getLayout = (page) => (
  <AuthGuard>
    <ApprovedUserGuard>
      <DashboardLayout>{page}</DashboardLayout>
    </ApprovedUserGuard>
  </AuthGuard>
);

export default SampleSubmissionPage;

