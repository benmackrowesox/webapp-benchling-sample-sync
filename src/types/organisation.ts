/**
 * Organisation type definitions for the Esox Biologics webapp
 * 
 * This file defines the types for the organisation system which replaces
 * the order approval workflow. Users are linked to organisations, and
 * admins create projects directly under organisations for sample collection.
 */

export interface Organisation {
  id: string;
  name: string;
  description?: string;
  createdAt: number;
  updatedAt?: number;
  createdBy: string; // userId of admin who created
  users: OrganisationUser[];
  address?: OrganisationAddress;
  isActive: boolean;
}

export interface OrganisationUser {
  userId: string;
  email: string;
  name: string;
  role: OrganisationUserRole;
  joinedAt: number;
}

export type OrganisationUserRole = 
  | "owner"      // Full access, can manage organisation
  | "admin"      // Can create projects, manage samples
  | "member"     // Can view projects, submit samples
  | "viewer";    // Read-only access

export interface OrganisationAddress {
  line1?: string;
  line2?: string;
  townCity?: string;
  county?: string;
  postcode?: string;
  country?: string;
}

export interface CreateOrganisationRequest {
  name: string;
  description?: string;
  address?: OrganisationAddress;
}

export interface UpdateOrganisationRequest {
  name?: string;
  description?: string;
  address?: OrganisationAddress;
  isActive?: boolean;
}

export interface AddUserRequest {
  userId: string;
  email: string;
  role?: OrganisationUserRole;
}

export interface RemoveUserRequest {
  userId: string;
}

export interface OrganisationSummary {
  id: string;
  name: string;
  userCount: number;
  projectCount: number;
  createdAt: number;
}

