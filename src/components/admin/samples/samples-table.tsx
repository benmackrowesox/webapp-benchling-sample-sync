import {
  Box,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  Chip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SyncIcon from "@mui/icons-material/Sync";
import { SyncedSample, SampleStatus } from "../../types/sync";
import { SyncStatusBadge } from "./sync-status-badge";

interface SamplesTableProps {
  samples: SyncedSample[];
  onEdit: (sample: SyncedSample) => void;
  onDelete: (sampleId: string) => void;
  onSync: (sampleId: string) => void;
}

const STATUS_COLORS: Record<SampleStatus, "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"> = {
  pending: "warning",
  collected: "info",
  received: "info",
  processing: "primary",
  completed: "success",
  archived: "default",
  error: "error",
};

export function SamplesTable({ samples, onEdit, onDelete, onSync }: SamplesTableProps) {
  return (
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
            <TableCell>Last Modified</TableCell>
            <TableCell>Sync Status</TableCell>
            <TableCell align="right">Actions</TableCell>
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
              <TableCell>
                <Typography variant="body2">{sample.clientName}</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">{sample.sampleType}</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {sample.sampleFormat || "-"}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {sample.sampleDate
                    ? new Date(sample.sampleDate).toLocaleDateString()
                    : "-"}
                </Typography>
              </TableCell>
              <TableCell>
                <Chip
                  label={sample.sampleStatus}
                  color={STATUS_COLORS[sample.sampleStatus]}
                  size="small"
                  sx={{ textTransform: "capitalize" }}
                />
              </TableCell>
              <TableCell>
                <Typography variant="body2" color="text.secondary">
                  {sample.lastModified
                    ? new Date(sample.lastModified).toLocaleString()
                    : "-"}
                </Typography>
              </TableCell>
              <TableCell>
                <SyncStatusBadge sample={sample} />
              </TableCell>
              <TableCell align="right">
                <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 0.5 }}>
                  <Tooltip title="Edit">
                    <IconButton size="small" onClick={() => onEdit(sample)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Sync to Benchling">
                    <IconButton
                      size="small"
                      onClick={() => onSync(sample.id)}
                      color="primary"
                    >
                      <SyncIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton
                      size="small"
                      onClick={() => onDelete(sample.id)}
                      color="error"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
            </TableRow>
          ))}
          {samples.length === 0 && (
            <TableRow>
              <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  No samples found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Import from Benchling or create a new sample to get started.
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

