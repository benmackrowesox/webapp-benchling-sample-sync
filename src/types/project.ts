/**
 * Project type definitions for the Esox Biologics webapp
 * 
 * Projects replace the order approval workflow. Admins create projects
 * under organisations, and users submit samples directly to projects.
 * Projects can optionally link to legacy orders for historical reference.
 */

import { OrganisationAddress } from "./organisation";

export type ProjectStatus = 
  | "draft"       // Project being set up, not yet active
  | "active"      // Active, samples can be submitted
  | "completed"   // Project complete, no more samples
  | "archived";   // Archived project, historical reference

export type SampleStatus = 
  | "sample-collected"
  | "sample-returned"
  | "processing"
  | "complete";

export interface Project {
  id: string;
  title: string;
  description?: string;
  organisationId: string;
  status: ProjectStatus;
  
  // Project configuration
  services: string[];           // e.g., ["qPCR", "GenomeSequencing"]
  sampleTypes: string[];        // e.g., ["water", "tissue", "swab"]
  
  // Linked legacy orders (for historical reference)
  linkedOrderIds: string[];
  
  // Sample metadata configuration (similar to order metadata fields)
  metadataFields: ProjectMetadataField[];
  
  // Admin who created the project
  createdBy: string;
  createdAt: number;
  updatedAt?: number;
  
  // Optional delivery address for sample kits
  deliveryAddress?: OrganisationAddress;
  
  // Optional proposal/reference from linked orders
  proposal?: string;
}

export interface ProjectMetadataField {
  name: string;
  displayName: string;
  type: "string" | "boolean" | "number" | "singleSelect";
  units?: string | string[];
  valueOptions?: string[];
  gridColumnWidth?: number;
  helpText?: string;
  required?: boolean;
}

export interface ProjectSample {
  id: string;
  projectId: string;
  name: string;
  service: string;
  sampleType: string;
  status: SampleStatus;
  metadata: Record<string, MetadataSubmission>;
  reportUrl?: string;
  lastUpdated: number;
  collectedAt?: number;
  submittedAt?: number;
}

export interface MetadataSubmission {
  name: string;
  displayName: string;
  units?: string;
  value: any;
}

export interface CreateProjectRequest {
  title: string;
  description?: string;
  organisationId: string;
  services: string[];
  sampleTypes: string[];
  deliveryAddress?: OrganisationAddress;
  proposal?: string;
  metadataFields?: ProjectMetadataField[];
}

export interface UpdateProjectRequest {
  title?: string;
  description?: string;
  status?: ProjectStatus;
  services?: string[];
  sampleTypes?: string[];
  deliveryAddress?: OrganisationAddress;
  metadataFields?: ProjectMetadataField[];
}

export interface LinkOrderRequest {
  orderId: string;
}

export interface AddSampleRequest {
  name: string;
  service: string;
  sampleType: string;
  metadata: Record<string, MetadataSubmission>;
  collectedAt?: number;
}

export interface ProjectSummary {
  id: string;
  title: string;
  status: ProjectStatus;
  organisationId: string;
  organisationName: string;
  sampleCount: number;
  linkedOrderCount: number;
  createdAt: number;
  updatedAt?: number;
}

export interface ProjectWithStats extends Project {
  organisationName: string;
  sampleCount: number;
  completedSampleCount: number;
  linkedOrderCount: number;
}

// Alias for backward compatibility
export type MetadataField = ProjectMetadataField;


