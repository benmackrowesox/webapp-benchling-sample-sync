import { Chip, Tooltip } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningIcon from "@mui/icons-material/Warning";
import ErrorIcon from "@mui/icons-material/Error";
import SyncIcon from "@mui/icons-material/Sync";
import { SyncedSample } from "../../../types/sync";

interface SyncStatusBadgeProps {
  sample: SyncedSample;
}

export function SyncStatusBadge({ sample }: SyncStatusBadgeProps) {
  const { lastSyncedFromWebapp, lastSyncedFromBenchling, benchlingId } = sample;

  // Calculate sync status
  const hasBenchlingId = !!benchlingId;
  const hasWebappSync = !!lastSyncedFromWebapp;
  const hasBenchlingSync = !!lastSyncedFromBenchling;

  // Determine status
  if (!hasBenchlingId) {
    return (
      <Tooltip title="Sample not yet synced to Benchling">
        <Chip
          icon={<SyncIcon />}
          label="Not Synced"
          color="default"
          size="small"
        />
      </Tooltip>
    );
  }

  if (!hasWebappSync && !hasBenchlingSync) {
    return (
      <Tooltip title="Created but never synced">
        <Chip
          icon={<WarningIcon />}
          label="Pending"
          color="warning"
          size="small"
        />
      </Tooltip>
    );
  }

  // Compare timestamps to determine sync state
  const webappSyncTime = hasWebappSync ? new Date(lastSyncedFromWebapp).getTime() : 0;
  const benchlingSyncTime = hasBenchlingSync ? new Date(lastSyncedFromBenchling).getTime() : 0;

  if (webappSyncTime > benchlingSyncTime) {
    return (
      <Tooltip title="Changes pending sync to Benchling">
        <Chip
          icon={<SyncIcon />}
          label="Pending Webapp→Benchling"
          color="info"
          size="small"
        />
      </Tooltip>
    );
  }

  if (benchlingSyncTime > webappSyncTime) {
    return (
      <Tooltip title="Changes pending sync to Webapp">
        <Chip
          icon={<SyncIcon />}
          label="Pending Benchling→Webapp"
          color="secondary"
          size="small"
        />
      </Tooltip>
    );
  }

  // Both in sync
  return (
    <Tooltip title={`Last synced: ${new Date(lastSyncedFromWebapp).toLocaleString()}`}>
      <Chip
        icon={<CheckCircleIcon />}
        label="Synced"
        color="success"
        size="small"
      />
    </Tooltip>
  );
}

/**
 * Get a more detailed sync status for display
 */
export function getDetailedSyncStatus(sample: SyncedSample): {
  status: "synced" | "pending-out" | "pending-in" | "not-synced" | "error";
  message: string;
  lastSyncTime?: string;
} {
  const { lastSyncedFromWebapp, lastSyncedFromBenchling, benchlingId } = sample;

  if (!benchlingId) {
    return {
      status: "not-synced",
      message: "Not yet synced to Benchling",
    };
  }

  const webappSyncTime = lastSyncedFromWebapp ? new Date(lastSyncedFromWebapp).getTime() : 0;
  const benchlingSyncTime = lastSyncedFromBenchling ? new Date(lastSyncedFromBenchling).getTime() : 0;

  if (webappSyncTime > benchlingSyncTime) {
    return {
      status: "pending-out",
      message: "Changes pending sync to Benchling",
      lastSyncTime: new Date(webappSyncTime).toLocaleString(),
    };
  }

  if (benchlingSyncTime > webappSyncTime) {
    return {
      status: "pending-in",
      message: "Changes pending sync to Webapp",
      lastSyncTime: new Date(benchlingSyncTime).toLocaleString(),
    };
  }

  return {
    status: "synced",
    message: "Fully synced",
    lastSyncTime: new Date(webappSyncTime).toLocaleString(),
  };
}

