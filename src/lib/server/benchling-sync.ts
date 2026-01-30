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

// Validate that API key is set
if (!apiKey) {
  console.error("[Benchling Sync] ERROR: API key is not set!");
  console.error("[Benchling Sync] Please set NEXT_PRIVATE_BENCHLING_API_KEY environment variable");
} else {
  // Log first few characters of API key for debugging (never log full key)
  console.log("[Benchling Sync] API key configured:", apiKey.substring(0, 7) + "...");
}

const authHeader = {
  Authorization: `Basic ${Buffer.from(`${apiKey}:${password}`).toString(
    "base64",
  )}`,
  "Content-Type": "application/json",
  Accept: "application/json",
};

// Parse the base URL and ensure correct format for Benchling API v2
// IMPORTANT: Use tenant-specific domain (e.g., https://esox.benchling.com)
function getApiBaseUrl(baseUrl: string): string {
  // Remove any trailing slashes
  let url = baseUrl.replace(/\/$/, "");
  
  // If URL already includes /api/v2, return as-is
  if (url.includes("/api/v2")) {
    return url;
  }
  
  // If URL is a tenant subdomain (e.g., esox.benchling.com), add /api/v2
  if (url.includes(".benchling.com")) {
    return `${url}/api/v2`;
  }
  
  // If URL is just api.benchling.com, this is deprecated - should use tenant domain
  if (url === "https://api.benchling.com" || url === "http://api.benchling.com") {
    console.warn("[Benchling Sync] WARNING: Using generic api.benchling.com URL. " +
      "Please update to use your tenant-specific domain (e.g., https://esox.benchling.com)");
    return `${url}/api/v2`;
  }
  
  // For any other URL (custom deployments, etc.), add /api/v2
  return `${url}/api/v2`;
}

const API_URL = getApiBaseUrl(benchlingConfig.apiUrl);

// Log the API URL for debugging
console.log("[Benchling Sync] API Base URL:", benchlingConfig.apiUrl);
console.log("[Benchling Sync] API Full URL:", API_URL);

// Validate that we're using a tenant-specific domain
if (benchlingConfig.apiUrl.includes("api.benchling.com") && 
    !benchlingConfig.apiUrl.includes("/api/v2")) {
  console.warn("[Benchling Sync] IMPORTANT: For tenant-specific access, " +
    "use format: https://TENANT.benchling.com/api/v2");
}

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
        url: url,
        params: params,
      });
      
      // Provide specific guidance based on error type
      if (error.response?.status === 404) {
        const userMessage = error.response?.data?.userMessage || "";
        if (userMessage.includes("signing in") || userMessage.includes("Resource not found")) {
          console.error("[Benchling Sync] AUTHENTICATION ISSUE DETECTED:");
          console.error("- The API request returned 404 with 'signing in' message");
          console.error("- This typically means the API key is invalid, expired, or lacks permissions");
          console.error("- Please check:");
          console.error("  1. NEXT_PRIVATE_BENCHLING_API_KEY is set correctly in Vercel");
          console.error("  2. The API key has not expired");
          console.error("  3. The API key has 'Read' permissions for custom entities");
          console.error("  4. The API key belongs to the correct Benchling tenant");
        } else {
          console.error("[Benchling Sync] RESOURCE NOT FOUND:");
          console.error("- The schemaId or registryId may be incorrect");
          console.error("- Schema ID:", EBM_SAMPLE_CONFIG.schemaId);
          console.error("- Registry ID:", EBM_SAMPLE_CONFIG.registryId);
        }
      }
      
      // Create a more informative error
      const helpfulError = new Error(
        `Benchling API Error (${error.response?.status || 'unknown'}): ${error.response?.data?.userMessage || error.message}`
      );
      (helpfulError as any).originalError = error;
      (helpfulError as any).isAuthError = error.response?.status === 404 && 
        error.response?.data?.userMessage?.includes("signing in");
      
      throw helpfulError;
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
 * Note: sampleId is extracted from entityRegistryId (not a custom field)
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
    note: "sampleId is derived from entityRegistryId, not a custom field",
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

