/**
 * Two-Way Benchling Sample Sync Types
 * 
 * Defines the data models for syncing metagenomics samples (EBM prefixed IDs)
 * between the webapp and Benchling.
 */

// Core synced sample interface
export interface SyncedSample {
  // Core identifiers
  id: string;                    // Firestore document ID
  benchlingId: string;           // Benchling API entity ID
  entityRegistryId: string;      // Benchling registry ID (e.g., "EBM123")
  
  // Sync fields (mapped from Benchling custom fields)
  sampleId: string;              // Sample ID number (e.g., "123" from "EBM123")
  clientName: string;            // Client/customer name
  sampleType: string;            // Type of sample
  sampleFormat: string;          // Format of sample
  sampleDate: string;            // Sample collection date (ISO format)
  sampleStatus: SampleStatus;    // Current status of sample
  
  // Sync metadata
  lastModified: string;          // Last modified timestamp (ISO)
  lastSyncedFromWebapp: string;  // Last sync from webapp to Benchling
  lastSyncedFromBenchling: string; // Last sync from Benchling to webapp
  syncVersion: number;           // For conflict detection
  
  // Source tracking
  createdIn: 'webapp' | 'benchling';
  createdBy?: string;            // User ID who created
  createdAt: string;             // Creation timestamp
  
  // Additional metadata
  orderId?: string;              // Associated order ID if applicable
  customFields?: Record<string, any>; // Extra fields for extensibility
}

// Sample status enum
export type SampleStatus = 
  | 'pending'
  | 'collected'
  | 'received'
  | 'processing'
  | 'completed'
  | 'archived'
  | 'error';

// Sync operation types
export type SyncOperation = 
  | 'create'
  | 'update'
  | 'delete';

// Sync direction
export type SyncDirection = 'to-benchling' | 'to-webapp';

// Sync queue item for pending operations
export interface SyncQueueItem {
  id: string;                    // Queue item ID
  sampleId: string;              // Firestore document ID
  benchlingId?: string;          // Benchling entity ID
  operation: SyncOperation;
  direction: SyncDirection;
  data: Partial<SyncedSample>;   // Data to sync
  attempts: number;              // Number of sync attempts
  maxAttempts: number;           // Max attempts before marking failed
  lastAttempt?: string;          // Last attempt timestamp
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;                // Error message if failed
  createdAt: string;             // Queue item creation timestamp
  completedAt?: string;          // Completion timestamp
}

// Sync metadata for tracking overall sync state
export interface SyncMetadata {
  id: 'sync-metadata';           // Document ID
  lastWebhookReceived?: string;  // Last webhook timestamp
  lastPolledAt?: string;         // Last polling timestamp
  lastSuccessfulSync?: string;   // Last successful sync
  lastImportCompleted?: string;  // Last import completion
  importInProgress: boolean;
  importProgress?: {
    total: number;
    processed: number;
    errors: number;
  };
  syncErrors: SyncError[];
  webhookEnabled: boolean;
  pollIntervalMinutes: number;
}

// Individual sync error record
export interface SyncError {
  timestamp: string;
  sampleId: string;
  benchlingId?: string;
  operation: SyncOperation;
  error: string;
  retryable: boolean;
}

// Conflict detection result
export interface ConflictResult {
  hasConflict: boolean;
  webappData?: Partial<SyncedSample>;
  benchlingData?: Partial<SyncedSample>;
  webappLastModified?: string;
  benchlingLastModified?: string;
  resolution?: 'webapp-wins' | 'benchling-wins' | 'latest-wins' | 'manual';
}

// Batch sync request/response
export interface BatchSyncRequest {
  samples: Partial<SyncedSample>[];
  direction: SyncDirection;
}

export interface BatchSyncResponse {
  success: boolean;
  synced: number;
  failed: number;
  errors: Array<{
    sampleId: string;
    error: string;
  }>;
}

// Webhook payload from Benchling
export interface BenchlingWebhookPayload {
  eventType: string;
  entityType: string;
  entityId: string;
  entityRegistryId?: string;
  changes?: {
    fields: Record<string, any>;
  };
  timestamp: string;
}

// Benchling sample field mapping configuration
export interface SampleFieldMapping {
  benchlingFieldId: string;      // Benchling custom field ID
  localField: keyof SyncedSample; // Local field name
  isRequired: boolean;
  defaultValue?: string;
}

// Configuration for EBM metagenomics samples
export const EBM_SAMPLE_CONFIG = {
  schemaId: 'ts_NJDS3UwU',       // Metagenomics schema ID from Benchling
  registryId: 'src_xro8e9rf',    // Registry ID
  idPrefix: 'EBM',               // Sample ID prefix
  fieldMapping: {
    sampleId: { benchlingFieldId: '', isRequired: true },
    clientName: { benchlingFieldId: '', isRequired: true },
    sampleType: { benchlingFieldId: '', isRequired: true },
    sampleFormat: { benchlingFieldId: '', isRequired: false },
    sampleDate: { benchlingFieldId: '', isRequired: true },
    sampleStatus: { benchlingFieldId: '', isRequired: true },
  } as Record<string, SampleFieldMapping>,
  syncIntervalMinutes: 10,
  maxRetries: 3,
};

