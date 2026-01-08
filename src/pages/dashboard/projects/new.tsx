import { useCallback, useEffect, useState } from "react";
import type { NextPage } from "next";
import Head from "next/head";
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  IconButton,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { AdminGuard } from "../../../components/authentication/auth-guard";
import { DashboardLayout } from "../../../components/dashboard/dashboard-layout";
import { gtm } from "../../../lib/client/gtm";
import { useTypedAuth } from "src/hooks/use-auth";
import type { Organisation } from "src/types/organisation";
import type { CreateProjectRequest } from "src/types/project";

const availableServices = [
  "qPCR",
  "GenomeSequencing",
  "Histopathology",
  "Bacteriology",
  "Virology",
  "Parasitology",
];

const availableSampleTypes = [
  "water",
  "tissue",
  "swab",
  "blood",
  "mucus",
  "feed",
  "environmental",
];

const NewProjectPage: NextPage = () => {
  const router = useRouter();
  const { user, sendRequest } = useTypedAuth();
  const [loading, setLoading] = useState(false);
  const [organisations, setOrganisations] = useState<Organisation[]>([]);
  
  const [formData, setFormData] = useState<CreateProjectRequest>({
    title: "",
    description: "",
    organisationId: "",
    services: [],
    sampleTypes: [],
  });

  useEffect(() => {
    gtm.push({ event: "page_view" });
  }, []);

  const fetchOrganisations = useCallback(async () => {
    try {
      const data = await sendRequest<undefined, Organisation[]>("/api/organisations", "GET");
      if (data) {
        setOrganisations(data);
        
        // Auto-select if only one organisation
        if (data.length === 1) {
          setFormData((prev) => ({ ...prev, organisationId: data[0].id }));
        }
      }
    } catch (error) {
      console.error("Error fetching organisations:", error);
    }
  }, [sendRequest]);

  useEffect(() => {
    fetchOrganisations();
  }, [fetchOrganisations]);

  const handleAddService = (service: string) => {
    if (!formData.services.includes(service)) {
      setFormData((prev) => ({
        ...prev,
        services: [...prev.services, service],
      }));
    }
  };

  const handleRemoveService = (service: string) => {
    setFormData((prev) => ({
      ...prev,
      services: prev.services.filter((s) => s !== service),
    }));
  };

  const handleAddSampleType = (sampleType: string) => {
    if (!formData.sampleTypes.includes(sampleType)) {
      setFormData((prev) => ({
        ...prev,
        sampleTypes: [...prev.sampleTypes, sampleType],
      }));
    }
  };

  const handleRemoveSampleType = (sampleType: string) => {
    setFormData((prev) => ({
      ...prev,
      sampleTypes: prev.sampleTypes.filter((st) => st !== sampleType),
    }));
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.title.trim()) {
      toast.error("Project title is required.");
      return;
    }
    if (!formData.organisationId) {
      toast.error("Please select an organisation.");
      return;
    }
    if (formData.services.length === 0) {
      toast.error("Please select at least one service.");
      return;
    }
    if (formData.sampleTypes.length === 0) {
      toast.error("Please select at least one sample type.");
      return;
    }

    try {
      setLoading(true);
      const response = await sendRequest<CreateProjectRequest, { id: string }>(
        "/api/projects",
        "POST",
        formData
      );

      toast.success("Project created successfully!");
      router.push(`/dashboard/projects/${response.id}`);
    } catch (error: any) {
      console.error("Error creating project:", error);
      toast.error(error?.message || "Failed to create project.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Create Project | Esox Biologics</title>
      </Head>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
        }}
      >
        <Container maxWidth="lg">
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => router.push("/dashboard/projects")}
            sx={{ mb: 3 }}
          >
            Back to Projects
          </Button>

          <Typography variant="h4" sx={{ mb: 4 }}>
            Create New Project
          </Typography>

          <Grid container spacing={4}>
            {/* Basic Info */}
            <Grid item xs={12} md={8}>
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 3 }}>
                    Basic Information
                  </Typography>
                  
                  <TextField
                    fullWidth
                    label="Project Title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, title: e.target.value }))
                    }
                    required
                    sx={{ mb: 3 }}
                  />

                  <TextField
                    fullWidth
                    label="Description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, description: e.target.value }))
                    }
                    multiline
                    rows={4}
                    placeholder="Provide a description of the project and its objectives..."
                  />
                </CardContent>
              </Card>

              {/* Services */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Services
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    Select the services that will be used for this project.
                  </Typography>

                  <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 2 }}>
                    {formData.services.map((service) => (
                      <Chip
                        key={service}
                        label={service}
                        onDelete={() => handleRemoveService(service)}
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </Stack>

                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {availableServices
                      .filter((s) => !formData.services.includes(s))
                      .map((service) => (
                        <Chip
                          key={service}
                          label={service}
                          onClick={() => handleAddService(service)}
                          variant="outlined"
                          sx={{ cursor: "pointer" }}
                        />
                      ))}
                  </Box>
                </CardContent>
              </Card>

              {/* Sample Types */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Sample Types
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    Select the sample types that will be collected for this project.
                  </Typography>

                  <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 2 }}>
                    {formData.sampleTypes.map((sampleType) => (
                      <Chip
                        key={sampleType}
                        label={sampleType}
                        onDelete={() => handleRemoveSampleType(sampleType)}
                        color="secondary"
                        variant="outlined"
                      />
                    ))}
                  </Stack>

                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {availableSampleTypes
                      .filter((st) => !formData.sampleTypes.includes(st))
                      .map((sampleType) => (
                        <Chip
                          key={sampleType}
                          label={sampleType}
                          onClick={() => handleAddSampleType(sampleType)}
                          variant="outlined"
                          sx={{ cursor: "pointer" }}
                        />
                      ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Sidebar */}
            <Grid item xs={12} md={4}>
              <Card sx={{ position: "sticky", top: 20 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 3 }}>
                    Project Settings
                  </Typography>

                  <FormControl fullWidth sx={{ mb: 3 }} required>
                    <InputLabel id="org-label">Organisation</InputLabel>
                    <Select
                      labelId="org-label"
                      value={formData.organisationId}
                      label="Organisation"
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          organisationId: e.target.value,
                        }))
                      }
                    >
                      {organisations
                        .filter((org) => org.isActive)
                        .map((org) => (
                          <MenuItem key={org.id} value={org.id}>
                            {org.name}
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>

                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    The organisation that this project belongs to. Users from this organisation will be able to view and submit samples to this project.
                  </Typography>

                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    onClick={handleSubmit}
                    disabled={loading || !formData.title || !formData.organisationId}
                  >
                    {loading ? "Creating..." : "Create Project"}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  );
};

NewProjectPage.getLayout = (page) => (
  <AdminGuard>
    <DashboardLayout>{page}</DashboardLayout>
  </AdminGuard>
);

export default NewProjectPage;

