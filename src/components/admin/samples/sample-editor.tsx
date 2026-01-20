import { useState } from "react";
import {
  Box,
  Button,
  Grid,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { SyncedSample, SampleStatus } from "../../types/sync";

interface SampleEditorProps {
  sample?: SyncedSample;
  onSave: (data: Partial<SyncedSample>) => void;
  onCancel: () => void;
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

export function SampleEditor({ sample, onSave, onCancel }: SampleEditorProps) {
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
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
    
    // Clear error when field is modified
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
    
    if (!validateForm()) {
      return;
    }

    // Generate entity registry ID (e.g., EBM123)
    const entityRegistryId = `EBM${formData.sampleId.padStart(3, "0")}`;

    onSave({
      sampleId: formData.sampleId,
      clientName: formData.clientName,
      sampleType: formData.sampleType,
      sampleFormat: formData.sampleFormat,
      sampleDate: formData.sampleDate,
      sampleStatus: formData.sampleStatus,
      orderId: formData.orderId || undefined,
      entityRegistryId,
    });
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 3 }}>
        {isEditing
          ? `Editing ${sample?.entityRegistryId}`
          : "New samples will be automatically synced to Benchling with ID format EBMXXX"}
      </Typography>

      <Grid container spacing={3}>
        {/* Sample ID */}
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

        {/* Client Name */}
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

        {/* Sample Type */}
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
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Sample Format */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            select
            label="Sample Format"
            value={formData.sampleFormat}
            onChange={handleChange("sampleFormat")}
          >
            {SAMPLE_FORMATS.map((format) => (
              <MenuItem key={format} value={format}>
                {format}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Sample Date */}
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

        {/* Sample Status */}
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

        {/* Order ID (optional) */}
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
        <Button variant="outlined" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="contained" type="submit">
          {isEditing ? "Update Sample" : "Create Sample"}
        </Button>
      </Box>
    </Box>
  );
}

