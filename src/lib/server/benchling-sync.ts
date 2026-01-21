/**
 * Benchling Sync Operations
 * 
 * Extended Benchling API methods for two-way sample synchronization
 * with metagenomics samples (EBM prefixed IDs).
 */

import axios from "axios";
import { benchlingConfig } from "src/private-config";
import { EBM_SAMPLE_CONFIG, SampleStatus } from "src/types/sync";
import { v4 as uuidv4 } from "uuid";

const apiKey = benchlingConfig.apiKey;
const password = ""; // blank password; api key only

const authHeader = {
  Authorization: `Basic ${Buffer.from(`${apiKey}:${password}`).toString(
    "base64",
  )}`,
  "Content-Type": "application/json",
  Accept: "application/json",
};

const API_URL = benchlingConfig.apiUrl;

/**
 * Fetch all metagenomics samples from Benchling (for initial import)
 * Uses pagination to handle large result sets
 */
export async function fetchAllMetagenomicsSamples(
  pageSize: number = 100
): Promise<BenchlingSample[]> {
  const samples: BenchlingSample[] = [];
  let nextCursor: string | undefined;
  
  console.log("[Benchling Sync] Starting import with config:", {
    schemaId: EBM_SAMPLE_CONFIG.schemaId,
    registryId: EBM_SAMPLE_CONFIG.registryId,
    idPrefix: EBM_SAMPLE_CONFIG.idPrefix,
    fieldMapping: Object.entries(EBM_SAMPLE_CONFIG.fieldMapping).map(([key, val]) => ({
      key,
      benchlingFieldId: val.benchlingFieldId,
    })),
  });
  
  do {
    const url = `${API_URL}/custom-entities`;
    const params: Record<string, any> = {
      schemaId: EBM_SAMPLE_CONFIG.schemaId,
      registryId: EBM_SAMPLE_CONFIG.registryId,
      limit: pageSize,
    };
    
    if (nextCursor) {
      params.cursor = nextCursor;
    }
    
    console.log(`[Benchling Sync] Fetching samples (cursor: ${nextCursor || 'none'})`);
    
    try {
      const response = await axios.get(url, {
        headers: authHeader,
        params,
      });
      
      const data = response.data;
      console.log(`[Benchling Sync] Response: ${data.customEntities?.length || 0} entities returned`);
      
      // Log first entity fields structure for debugging
      if (data.customEntities?.length > 0 && samples.length === 0) {
        console.log("[Benchling Sync] First entity fields structure:", JSON.stringify(data.customEntities[0].fields, null, 2));
      }
      
      // Filter for EBM prefixed samples
      const ebmSamples = (data.customEntities || []).filter(
        (entity: any) => entity.entityRegistryId?.startsWith(EBM_SAMPLE_CONFIG.idPrefix)
      );
      
      console.log(`[Benchling Sync] Found ${ebmSamples.length} EBM samples matching prefix "${EBM_SAMPLE_CONFIG.idPrefix}"`);
      
      samples.push(...ebmSamples);
      
      nextCursor = data.nextCursor;
    } catch (error: any) {
      console.error("[Benchling Sync] Error fetching metagenomics samples:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw error;
    }
  } while (nextCursor);
  
  console.log(`[Benchling Sync] Import complete. Total samples found: ${samples.length}`);
  return samples;
}

/**
 * Fetch a single sample by its Benchling entity ID
 */
export async function fetchSampleById(
  benchlingId: string
): Promise<BenchlingSample | null> {
  try {
    const url = `${API_URL}/custom-entities/${benchlingId}`;
    const response = await axios.get(url, { headers: authHeader });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null;
    }
    console.error("Error fetching sample:", error);
    throw error;
  }
}

/**
 * Fetch a sample by its entity registry ID (e.g., "EBM123")
 */
export async function fetchSampleByRegistryId(
  entityRegistryId: string
): Promise<BenchlingSample | null> {
  try {
    const url = `${API_URL}/custom-entities`;
    const response = await axios.get(url, {
      headers: authHeader,
      params: {
        registryId: EBM_SAMPLE_CONFIG.registryId,
        entityRegistryId: entityRegistryId,
      },
    });
    
    const entities = response.data.customEntities || [];
    return entities.length > 0 ? entities[0] : null;
  } catch (error) {
    console.error("Error fetching sample by registry ID:", error);
    throw error;
  }
}

/**
 * Create a new metagenomics sample in Benchling
 */
export async function createBenchlingSample(
  sampleData: CreateSampleData
): Promise<BenchlingSample> {
  const url = `${API_URL}/custom-entities`;
  
  const requestData = {
    schemaId: EBM_SAMPLE_CONFIG.schemaId,
    registryId: EBM_SAMPLE_CONFIG.registryId,
    name: sampleData.name, // e.g., "EBM123"
    folderId: sampleData.folderId,
    fields: sampleData.fields,
  };
  
  try {
    const response = await axios.post(url, requestData, {
      headers: authHeader,
    });
    return response.data;
  } catch (error) {
    console.error("Error creating sample in Benchling:", error);
    throw error;
  }
}

/**
 * Update an existing sample in Benchling
 */
export async function updateBenchlingSample(
  benchlingId: string,
  updates: Partial<UpdateSampleData>
): Promise<BenchlingSample> {
  const url = `${API_URL}/custom-entities/${benchlingId}`;
  
  const requestData: Record<string, any> = {};
  
  if (updates.name) {
    requestData.name = updates.name;
  }
  
  if (updates.fields) {
    requestData.fields = updates.fields;
  }
  
  try {
    const response = await axios.patch(url, requestData, {
      headers: authHeader,
    });
    return response.data;
  } catch (error) {
    console.error("Error updating sample in Benchling:", error);
    throw error;
  }
}

/**
 * Delete a sample from Benchling
 */
export async function deleteBenchlingSample(
  benchlingId: string
): Promise<void> {
  const url = `${API_URL}/custom-entities/${benchlingId}`;
  
  try {
    await axios.delete(url, { headers: authHeader });
  } catch (error) {
    console.error("Error deleting sample from Benchling:", error);
    throw error;
  }
}

/**
 * Bulk create multiple samples in Benchling
 * Returns task ID for tracking completion
 */
export async function bulkCreateBenchlingSamples(
  samples: CreateSampleData[]
): Promise<string> {
  const url = `${API_URL}/custom-entities:bulk-create`;
  
  const customEntities = samples.map((sample) => ({
    schemaId: EBM_SAMPLE_CONFIG.schemaId,
    registryId: EBM_SAMPLE_CONFIG.registryId,
    name: sample.name,
    folderId: sample.folderId,
    fields: sample.fields,
  }));
  
  try {
    const response = await axios.post(
      url,
      { customEntities },
      { headers: authHeader }
    );
    return response.data.taskId;
  } catch (error) {
    console.error("Error bulk creating samples:", error);
    throw error;
  }
}

/**
 * Bulk update multiple samples in Benchling
 * Returns task ID for tracking completion
 */
export async function bulkUpdateBenchlingSamples(
  updates: Array<{ id: string; fields: Record<string, any> }>
): Promise<string> {
  const url = `${API_URL}/custom-entities:bulk-update`;
  
  const customEntities = updates.map((update) => ({
    id: update.id,
    fields: update.fields,
  }));
  
  try {
    const response = await axios.post(
      url,
      { customEntities },
      { headers: authHeader }
    );
    return response.data.taskId;
  } catch (error) {
    console.error("Error bulk updating samples:", error);
    throw error;
  }
}

/**
 * Check the status of a bulk operation task
 */
export async function checkBulkTaskStatus(
  taskId: string
): Promise<BulkTaskResult> {
  const url = `${API_URL}/tasks/${taskId}`;
  
  try {
    const response = await axios.get(url, { headers: authHeader });
    return response.data;
  } catch (error) {
    console.error("Error checking task status:", error);
    throw error;
  }
}

/**
 * Wait for a bulk task to complete with exponential backoff
 */
export async function waitForBulkTask(
  taskId: string,
  maxAttempts: number = 10,
  baseDelayMs: number = 1000
): Promise<BulkTaskResult> {
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    const result = await checkBulkTaskStatus(taskId);
    
    if (result.status === "SUCCEEDED") {
      return result;
    }
    
    if (result.status === "FAILED") {
      throw new Error(`Bulk task failed: ${JSON.stringify(result)}`);
    }
    
    // Wait with exponential backoff
    const delay = baseDelayMs * Math.pow(2, attempts);
    await new Promise((resolve) => setTimeout(resolve, delay));
    attempts++;
  }
  
  throw new Error(`Bulk task did not complete within ${maxAttempts} attempts`);
}

// Type definitions

export interface BenchlingSample {
  id: string;
  entityRegistryId: string;
  name: string;
  schemaId: string;
  registryId: string;
  folderId?: string;
  fields: Record<string, any>;
  createdAt: string;
  modifiedAt: string;
}

export interface CreateSampleData {
  name: string; // e.g., "EBM123"
  folderId: string;
  fields: Record<string, any>;
}

export interface UpdateSampleData {
  name?: string;
  fields?: Record<string, any>;
}

export interface BulkTaskResult {
  status: "PENDING" | "RUNNING" | "SUCCEEDED" | "FAILED";
  data?: {
    customEntities?: Array<{
      id: string;
      entityRegistryId: string;
    }>;
  };
  error?: string;
}

/**
 * Helper to build Benchling fields object from local sample data
 * Uses the actual Benchling field IDs from EBM_SAMPLE_CONFIG
 */
export function buildBenchlingFields(sample: {
  sampleId: string;
  clientName: string;
  sampleType: string;
  sampleFormat?: string;
  sampleDate: string;
  sampleStatus: string;
}): Record<string, any> {
  return {
    [EBM_SAMPLE_CONFIG.fieldMapping.clientName.benchlingFieldId]: { value: sample.clientName },
    [EBM_SAMPLE_CONFIG.fieldMapping.sampleType.benchlingFieldId]: { value: sample.sampleType },
    [EBM_SAMPLE_CONFIG.fieldMapping.sampleFormat.benchlingFieldId]: { value: sample.sampleFormat || "" },
    [EBM_SAMPLE_CONFIG.fieldMapping.sampleDate.benchlingFieldId]: { value: sample.sampleDate },
    [EBM_SAMPLE_CONFIG.fieldMapping.sampleStatus.benchlingFieldId]: { value: sample.sampleStatus },
  };
}

/**
 * Helper to parse Benchling fields into local format
 * Uses the actual Benchling field IDs from EBM_SAMPLE_CONFIG
 */
export function parseBenchlingFields(fields: Record<string, any>): {
  sampleId: string;
  clientName: string;
  sampleType: string;
  sampleFormat: string;
  sampleDate: string;
  sampleStatus: SampleStatus;
} {
  console.log("[Benchling Sync] Parsing fields with mapping:", {
    fields: Object.keys(fields),
    mapping: {
      clientName: EBM_SAMPLE_CONFIG.fieldMapping.clientName.benchlingFieldId,
      sampleType: EBM_SAMPLE_CONFIG.fieldMapping.sampleType.benchlingFieldId,
      sampleFormat: EBM_SAMPLE_CONFIG.fieldMapping.sampleFormat.benchlingFieldId,
      sampleDate: EBM_SAMPLE_CONFIG.fieldMapping.sampleDate.benchlingFieldId,
      sampleStatus: EBM_SAMPLE_CONFIG.fieldMapping.sampleStatus.benchlingFieldId,
    },
  });
  
  const rawStatus = extractFieldValue(fields, EBM_SAMPLE_CONFIG.fieldMapping.sampleStatus.benchlingFieldId);
  
  // Validate and cast to SampleStatus type
  const validStatuses: SampleStatus[] = ['pending', 'collected', 'received', 'processing', 'completed', 'archived', 'error'];
  const sampleStatus: SampleStatus = validStatuses.includes(rawStatus as SampleStatus) ? rawStatus as SampleStatus : 'pending';
  
  const result = {
    sampleId: "", // Sample ID comes from entityRegistryId, not a custom field
    clientName: extractFieldValue(fields, EBM_SAMPLE_CONFIG.fieldMapping.clientName.benchlingFieldId),
    sampleType: extractFieldValue(fields, EBM_SAMPLE_CONFIG.fieldMapping.sampleType.benchlingFieldId),
    sampleFormat: extractFieldValue(fields, EBM_SAMPLE_CONFIG.fieldMapping.sampleFormat.benchlingFieldId),
    sampleDate: extractFieldValue(fields, EBM_SAMPLE_CONFIG.fieldMapping.sampleDate.benchlingFieldId),
    sampleStatus,
  };
  
  console.log("[Benchling Sync] Parsed result:", result);
  
  return result;
}

function extractFieldValue(fields: Record<string, any>, fieldName: string): string {
  const field = fields[fieldName];
  if (!field) return "";
  return typeof field === "object" && field.value !== undefined 
    ? String(field.value) 
    : String(field || "");
}

