/**
 * Sync Controller
 * 
 * Manages two-way synchronization between Firestore and Benchling
 * for metagenomics samples (EBM prefixed IDs).
 */

import { firebaseServerAdmin } from "./firebase-admin";
import {
  SyncedSample,
  SyncQueueItem,
  SyncMetadata,
  SyncError,
  ConflictResult,
  SyncOperation,
  EBM_SAMPLE_CONFIG,
} from "src/types/sync";
import {
  fetchAllMetagenomicsSamples,
  fetchSampleById,
  fetchSampleByRegistryId,
  createBenchlingSample,
  updateBenchlingSample,
  deleteBenchlingSample,
  parseBenchlingFields,
  buildBenchlingFields,
  BenchlingSample,
} from "./benchling-sync";
import { v4 as uuidv4 } from "uuid";

// Firestore collection names
const SAMPLES_COLLECTION = "benchling_samples";
const SYNC_QUEUE_COLLECTION = "sync_queue";
const SYNC_METADATA_DOC = "benchling_samples/sync_metadata";

/**
 * Sync a sample from webapp to Benchling
 */
export async function syncToBenchling(sampleId: string): Promise<void> {
  const db = firebaseServerAdmin.firestore();
  
  // Get sample from Firestore
  const sampleDoc = await db.doc(`${SAMPLES_COLLECTION}/${sampleId}`).get();
  if (!sampleDoc.exists) {
    throw new Error(`Sample ${sampleId} not found in Firestore`);
  }
  
  const sample = sampleDoc.data() as SyncedSample;
  
  // Build Benchling fields
  const benchlingFields = buildBenchlingFields({
    sampleId: sample.sampleId,
    clientName: sample.clientName,
    sampleType: sample.sampleType,
    sampleFormat: sample.sampleFormat,
    sampleDate: sample.sampleDate,
    sampleStatus: sample.sampleStatus,
  });
  
  if (sample.benchlingId) {
    // Update existing sample in Benchling
    await updateBenchlingSample(sample.benchlingId, { fields: benchlingFields });
  } else {
    // Create new sample in Benchling
    const result = await createBenchlingSample({
      name: sample.entityRegistryId,
      folderId: "", // TODO: Get appropriate folder ID
      fields: benchlingFields,
    });
    
    // Update Firestore with Benchling ID
    await db.doc(`${SAMPLES_COLLECTION}/${sampleId}`).update({
      benchlingId: result.id,
      entityRegistryId: result.entityRegistryId,
    });
  }
  
  // Update sync timestamp
  await db.doc(`${SAMPLES_COLLECTION}/${sampleId}`).update({
    lastSyncedFromWebapp: new Date().toISOString(),
    syncVersion: (sample.syncVersion || 0) + 1,
  });
}

/**
 * Sync a sample from Benchling to webapp
 */
export async function syncFromBenchling(benchlingId: string): Promise<void> {
  const db = firebaseServerAdmin.firestore();
  
  // Fetch from Benchling
  const benchlingSample = await fetchSampleById(benchlingId);
  if (!benchlingSample) {
    throw new Error(`Sample ${benchlingId} not found in Benchling`);
  }
  
  // Parse fields
  const parsed = parseBenchlingFields(benchlingSample.fields);
  const entityRegistryId = benchlingSample.entityRegistryId;
  
  // Check if sample already exists in Firestore
  const existingQuery = await db
    .collection(SAMPLES_COLLECTION)
    .where("entityRegistryId", "==", entityRegistryId)
    .limit(1)
    .get();
  
  const now = new Date().toISOString();
  
  if (!existingQuery.empty) {
    // Update existing sample
    const existingDoc = existingQuery.docs[0];
    const existingData = existingDoc.data() as SyncedSample;
    
    // Check for conflicts
    const conflictResult = checkForConflict(existingData, benchlingSample);
    
    if (conflictResult.hasConflict) {
      // Resolve conflict (most recent wins)
      if (shouldUpdateFromBenchling(existingData, benchlingSample)) {
        await existingDoc.ref.update({
          ...parsed,
          benchlingId: benchlingSample.id,
          lastModified: benchlingSample.modifiedAt,
          lastSyncedFromBenchling: now,
          syncVersion: (existingData.syncVersion || 0) + 1,
        });
      }
    } else {
      // No conflict, update normally
      await existingDoc.ref.update({
        ...parsed,
        benchlingId: benchlingSample.id,
        lastModified: benchlingSample.modifiedAt,
        lastSyncedFromBenchling: now,
        syncVersion: (existingData.syncVersion || 0) + 1,
      });
    }
  } else {
    // Create new sample from Benchling data
    const newSample: SyncedSample = {
      id: uuidv4(),
      benchlingId: benchlingSample.id,
      entityRegistryId: entityRegistryId,
      sampleId: parsed.sampleId,
      clientName: parsed.clientName,
      sampleType: parsed.sampleType,
      sampleFormat: parsed.sampleFormat,
      sampleDate: parsed.sampleDate,
      sampleStatus: parsed.sampleStatus,
      lastModified: benchlingSample.modifiedAt,
      lastSyncedFromBenchling: now,
      lastSyncedFromWebapp: "",
      syncVersion: 1,
      createdIn: "benchling",
      createdAt: benchlingSample.createdAt,
    };
    
    await db.collection(SAMPLES_COLLECTION).doc(newSample.id).set(newSample);
  }
}

/**
 * Check if there's a conflict between local and Benchling data
 */
function checkForConflict(
  localSample: SyncedSample,
  benchlingSample: BenchlingSample
): ConflictResult {
  const localLastModified = new Date(localSample.lastModified || 0);
  const benchlingLastModified = new Date(benchlingSample.modifiedAt);
  
  // Check if Benchling data is newer and has different values
  const benchlingParsed = parseBenchlingFields(benchlingSample.fields);
  
  const fieldsToCheck: (keyof typeof benchlingParsed)[] = [
    "clientName",
    "sampleType",
    "sampleFormat",
    "sampleDate",
    "sampleStatus",
  ];
  
  const hasDifferentValues = fieldsToCheck.some(
    (field) => localSample[field] !== benchlingParsed[field]
  );
  
  const benchlingIsNewer = benchlingLastModified > localLastModified;
  const localHasPendingChanges = !!localSample.lastSyncedFromWebapp && 
    localSample.lastSyncedFromBenchling &&
    new Date(localSample.lastSyncedFromWebapp) > new Date(localSample.lastSyncedFromBenchling);
  
  const hasConflict = hasDifferentValues && benchlingIsNewer && localHasPendingChanges;
  
  return {
    hasConflict,
    webappData: localSample,
    benchlingData: benchlingParsed,
    webappLastModified: localSample.lastModified,
    benchlingLastModified: benchlingSample.modifiedAt,
  };
}

/**
 * Determine if we should update from Benchling (most recent wins)
 */
function shouldUpdateFromBenchling(
  localSample: SyncedSample,
  benchlingSample: BenchlingSample
): boolean {
  const localModified = new Date(localSample.lastModified || 0);
  const benchlingModified = new Date(benchlingSample.modifiedAt);
  
  // Most recent change wins
  return benchlingModified > localModified;
}

/**
 * Create a new sample in both Firestore and Benchling
 */
export async function createSample(
  sampleData: Omit<SyncedSample, "id" | "benchlingId" | "syncVersion" | "createdAt" | "lastSyncedFromWebapp" | "lastSyncedFromBenchling">
): Promise<string> {
  const db = firebaseServerAdmin.firestore();
  const now = new Date().toISOString();
  
  const id = uuidv4();
  const entityRegistryId = `${EBM_SAMPLE_CONFIG.idPrefix}${sampleData.sampleId}`;
  
  const sample: SyncedSample = {
    ...sampleData,
    id,
    benchlingId: "",
    entityRegistryId,
    lastModified: now,
    lastSyncedFromWebapp: "",
    lastSyncedFromBenchling: "",
    syncVersion: 1,
    createdAt: now,
  };
  
  // Save to Firestore
  await db.collection(SAMPLES_COLLECTION).doc(id).set(sample);
  
  // Sync to Benchling
  await syncToBenchling(id);
  
  return id;
}

/**
 * Update a sample in Firestore and queue sync to Benchling
 */
export async function updateSample(
  sampleId: string,
  updates: Partial<SyncedSample>
): Promise<void> {
  const db = firebaseServerAdmin.firestore();
  const now = new Date().toISOString();
  
  const sampleRef = db.doc(`${SAMPLES_COLLECTION}/${sampleId}`);
  const sampleDoc = await sampleRef.get();
  
  if (!sampleDoc.exists) {
    throw new Error(`Sample ${sampleId} not found`);
  }
  
  const existingData = sampleDoc.data() as SyncedSample;
  
  // Update Firestore
  await sampleRef.update({
    ...updates,
    lastModified: now,
    lastSyncedFromWebapp: "", // Mark as needing sync
  });
  
  // Queue sync to Benchling
  await queueSyncOperation({
    sampleId,
    benchlingId: existingData.benchlingId,
    operation: "update",
    direction: "to-benchling",
    data: updates,
  });
}

/**
 * Delete a sample from both systems
 */
export async function deleteSample(sampleId: string): Promise<void> {
  const db = firebaseServerAdmin.firestore();
  
  const sampleDoc = await db.doc(`${SAMPLES_COLLECTION}/${sampleId}`).get();
  if (!sampleDoc.exists) {
    throw new Error(`Sample ${sampleId} not found`);
  }
  
  const sample = sampleDoc.data() as SyncedSample;
  
  // Delete from Benchling if it exists
  if (sample.benchlingId) {
    await queueSyncOperation({
      sampleId,
      benchlingId: sample.benchlingId,
      operation: "delete",
      direction: "to-benchling",
      data: {},
    });
  }
  
  // Delete from Firestore
  await db.doc(`${SAMPLES_COLLECTION}/${sampleId}`).delete();
}

/**
 * Queue a sync operation
 */
async function queueSyncOperation(operation: {
  sampleId: string;
  benchlingId?: string;
  operation: SyncOperation;
  direction: "to-benchling" | "to-webapp";
  data: Partial<SyncedSample>;
}): Promise<void> {
  const db = firebaseServerAdmin.firestore();
  
  const queueItem: SyncQueueItem = {
    id: uuidv4(),
    sampleId: operation.sampleId,
    benchlingId: operation.benchlingId,
    operation: operation.operation,
    direction: operation.direction,
    data: operation.data,
    attempts: 0,
    maxAttempts: EBM_SAMPLE_CONFIG.maxRetries,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  
  await db.collection(SYNC_QUEUE_COLLECTION).doc(queueItem.id).set(queueItem);
}

/**
 * Process the sync queue
 */
export async function processSyncQueue(): Promise<{
  processed: number;
  failed: number;
  errors: string[];
}> {
  const db = firebaseServerAdmin.firestore();
  let processed = 0;
  let failed = 0;
  const errors: string[] = [];
  
  // Get pending items
  const pendingItems = await db
    .collection(SYNC_QUEUE_COLLECTION)
    .where("status", "==", "pending")
    .orderBy("createdAt")
    .limit(50)
    .get();
  
  for (const itemDoc of pendingItems.docs) {
    const item = itemDoc.data() as SyncQueueItem;
    
    try {
      item.attempts++;
      item.status = "processing";
      item.lastAttempt = new Date().toISOString();
      await itemDoc.ref.update(item);
      
      if (item.direction === "to-benchling") {
        await processToBenchling(item);
      } else {
        await processToWebapp(item);
      }
      
      item.status = "completed";
      item.completedAt = new Date().toISOString();
      await itemDoc.ref.update(item);
      processed++;
    } catch (error: any) {
      item.attempts++;
      item.error = error.message;
      
      if (item.attempts >= item.maxAttempts) {
        item.status = "failed";
        failed++;
        errors.push(`Sample ${item.sampleId}: ${error.message}`);
      } else {
        item.status = "pending";
      }
      
      await itemDoc.ref.update(item);
    }
  }
  
  return { processed, failed, errors };
}

/**
 * Process a "to-benchling" sync operation
 */
async function processToBenchling(item: SyncQueueItem): Promise<void> {
  if (item.operation === "delete") {
    if (item.benchlingId) {
      await deleteBenchlingSample(item.benchlingId);
    }
  } else {
    await syncToBenchling(item.sampleId);
  }
}

/**
 * Process a "to-webapp" sync operation
 */
async function processToWebapp(item: SyncQueueItem): Promise<void> {
  if (item.benchlingId) {
    await syncFromBenchling(item.benchlingId);
  }
}

/**
 * Get all samples from Firestore
 */
export async function getAllSamples(): Promise<SyncedSample[]> {
  const db = firebaseServerAdmin.firestore();
  
  const snapshot = await db.collection(SAMPLES_COLLECTION)
    .orderBy("createdAt", "desc")
    .get();
  
  return snapshot.docs.map((doc) => doc.data() as SyncedSample);
}

/**
 * Get a single sample by ID
 */
export async function getSampleById(sampleId: string): Promise<SyncedSample | null> {
  const db = firebaseServerAdmin.firestore();
  
  const doc = await db.doc(`${SAMPLES_COLLECTION}/${sampleId}`).get();
  if (!doc.exists) {
    return null;
  }
  
  return doc.data() as SyncedSample;
}

/**
 * Get samples by entity registry ID
 */
export async function getSampleByRegistryId(
  entityRegistryId: string
): Promise<SyncedSample | null> {
  const db = firebaseServerAdmin.firestore();
  
  const snapshot = await db
    .collection(SAMPLES_COLLECTION)
    .where("entityRegistryId", "==", entityRegistryId)
    .limit(1)
    .get();
  
  if (snapshot.empty) {
    return null;
  }
  
  return snapshot.docs[0].data() as SyncedSample;
}

/**
 * Get sync status
 */
export async function getSyncStatus(): Promise<{
  totalSamples: number;
  pendingSync: number;
  failedSync: number;
  lastSync?: string;
}> {
  const db = firebaseServerAdmin.firestore();
  
  const [samplesCount, pendingCount, failedCount] = await Promise.all([
    db.collection(SAMPLES_COLLECTION).count().get(),
    db.collection(SYNC_QUEUE_COLLECTION)
      .where("status", "==", "pending")
      .count()
      .get(),
    db.collection(SYNC_QUEUE_COLLECTION)
      .where("status", "==", "failed")
      .count()
      .get(),
  ]);
  
  const metadataDoc = await db.doc(SYNC_METADATA_DOC).get();
  const metadata = metadataDoc.exists ? metadataDoc.data() as SyncMetadata : null;
  
  return {
    totalSamples: samplesCount.data().count,
    pendingSync: pendingCount.data().count,
    failedSync: failedCount.data().count,
    lastSync: metadata?.lastSuccessfulSync,
  };
}

/**
 * Update sync metadata
 */
export async function updateSyncMetadata(
  updates: Partial<SyncMetadata>
): Promise<void> {
  const db = firebaseServerAdmin.firestore();
  
  await db.doc(SYNC_METADATA_DOC).set(
    { ...updates, id: "sync-metadata" },
    { merge: true }
  );
}

/**
 * Import all EBM samples from Benchling (initial import)
 */
export async function importFromBenchling(): Promise<{
  total: number;
  imported: number;
  errors: string[];
}> {
  const db = firebaseServerAdmin.firestore();
  const errors: string[] = [];
  let imported = 0;
  
  // Mark import as in progress
  await updateSyncMetadata({
    importInProgress: true,
    importProgress: { total: 0, processed: 0, errors: 0 },
  });
  
  try {
    // Fetch all samples from Benchling
    const benchlingSamples = await fetchAllMetagenomicsSamples();
    
    await updateSyncMetadata({
      importProgress: { 
        total: benchlingSamples.length, 
        processed: 0, 
        errors: 0 
      },
    });
    
    for (let i = 0; i < benchlingSamples.length; i++) {
      const benchlingSample = benchlingSamples[i];
      
      try {
        const parsed = parseBenchlingFields(benchlingSample.fields);
        const entityRegistryId = benchlingSample.entityRegistryId;
        
        // Check if already exists
        const existing = await getSampleByRegistryId(entityRegistryId);
        if (existing) {
          // Update existing
          await db.doc(`${SAMPLES_COLLECTION}/${existing.id}`).update({
            ...parsed,
            benchlingId: benchlingSample.id,
            lastModified: benchlingSample.modifiedAt,
            lastSyncedFromBenchling: new Date().toISOString(),
          });
        } else {
          // Create new
          const sample: SyncedSample = {
            id: uuidv4(),
            benchlingId: benchlingSample.id,
            entityRegistryId: entityRegistryId,
            sampleId: parsed.sampleId,
            clientName: parsed.clientName,
            sampleType: parsed.sampleType,
            sampleFormat: parsed.sampleFormat,
            sampleDate: parsed.sampleDate,
            sampleStatus: parsed.sampleStatus,
            lastModified: benchlingSample.modifiedAt,
            lastSyncedFromBenchling: new Date().toISOString(),
            lastSyncedFromWebapp: "",
            syncVersion: 1,
            createdIn: "benchling",
            createdAt: benchlingSample.createdAt,
          };
          
          await db.collection(SAMPLES_COLLECTION).doc(sample.id).set(sample);
        }
        
        imported++;
      } catch (error: any) {
        errors.push(`Sample ${benchlingSample.entityRegistryId}: ${error.message}`);
      }
      
      // Update progress every 10 samples
      if ((i + 1) % 10 === 0) {
        await updateSyncMetadata({
          importProgress: {
            total: benchlingSamples.length,
            processed: i + 1,
            errors: errors.length,
          },
        });
      }
    }
    
    await updateSyncMetadata({
      importInProgress: false,
      importCompleted: new Date().toISOString(),
      importProgress: {
        total: benchlingSamples.length,
        processed: benchlingSamples.length,
        errors: errors.length,
      },
    });
    
    return {
      total: benchlingSamples.length,
      imported,
      errors,
    };
  } catch (error: any) {
    await updateSyncMetadata({
      importInProgress: false,
    });
    throw error;
  }
}

/**
 * Handle webhook from Benchling
 */
export async function handleBenchlingWebhook(
  eventType: string,
  entityId: string,
  entityRegistryId?: string,
  modifiedAt?: string
): Promise<void> {
  const db = firebaseServerAdmin.firestore();
  
  // Update webhook timestamp
  await updateSyncMetadata({
    lastWebhookReceived: new Date().toISOString(),
  });
  
  if (eventType === "entity.created" || eventType === "entity.updated") {
    // Sync from Benchling to webapp
    await syncFromBenchling(entityId);
  } else if (eventType === "entity.deleted") {
    // Handle deletion - mark in Firestore or delete
    if (entityRegistryId) {
      const existing = await getSampleByRegistryId(entityRegistryId);
      if (existing) {
        await db.doc(`${SAMPLES_COLLECTION}/${existing.id}`).delete();
      }
    }
  }
}

