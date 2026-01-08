/**
 * Organisation Store - Client-side Firestore data access
 * 
 * This store provides methods for managing organisations in the client.
 * Organisations are linked to users and projects in the new project-based system.
 */

import { collection, getDocs, doc, getDoc, addDoc, updateDoc, query, where, orderBy } from "firebase/firestore";
import { db } from "src/lib/client/firebase";
import type { 
  Organisation, 
  OrganisationUser, 
  CreateOrganisationRequest, 
  UpdateOrganisationRequest,
  OrganisationSummary 
} from "src/types/organisation";
import type { InternalUser } from "src/types/user";

class OrganisationStore {
  organisations: Organisation[] = [];
  selectedOrganisationId: string | null = null;

  /**
   * Get all organisations (admin only)
   */
  async getOrganisations(): Promise<Organisation[]> {
    await getDocs(collection(db, "organisations"))
      .then((querySnapshot) => {
        const data: Organisation[] = querySnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        this.organisations = data;
      })
      .catch((err) => {
        console.error("Error fetching organisations:", err);
        return null;
      });
    return this.organisations;
  }

  /**
   * Get organisations for a specific user
   */
  async getOrganisationsForUser(userId: string): Promise<Organisation[]> {
    const q = query(
      collection(db, "organisations"),
      where("users.userId", "==", userId)
    );
    
    await getDocs(q)
      .then((querySnapshot) => {
        const data: Organisation[] = querySnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        this.organisations = data;
      })
      .catch((err) => {
        console.error("Error fetching user organisations:", err);
        return null;
      });
    return this.organisations;
  }

  /**
   * Get a single organisation by ID
   */
  async getOrganisation(id: string): Promise<Organisation | null> {
    // Check cache first
    const cached = this.organisations.find((org) => org.id === id);
    if (cached) {
      return cached;
    }

    const docRef = doc(db, "organisations", id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const org = { ...docSnap.data(), id: docSnap.id } as Organisation;
      this.organisations.push(org);
      return org;
    }
    
    return null;
  }

  /**
   * Create a new organisation (admin only)
   */
  async createOrganisation(
    request: CreateOrganisationRequest,
    createdBy: string
  ): Promise<Organisation> {
    const now = Date.now();
    const newOrg: Omit<Organisation, "id"> = {
      name: request.name,
      description: request.description,
      createdAt: now,
      updatedAt: now,
      createdBy: createdBy,
      users: [],
      address: request.address,
      isActive: true,
    };

    const docRef = await addDoc(collection(db, "organisations"), newOrg);
    
    const org: Organisation = {
      ...newOrg,
      id: docRef.id,
    };
    
    this.organisations.push(org);
    return org;
  }

  /**
   * Update an organisation
   */
  async updateOrganisation(
    id: string,
    updates: UpdateOrganisationRequest
  ): Promise<Organisation | null> {
    const docRef = doc(db, "organisations", id);
    
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Date.now(),
    });

    // Update cache
    const index = this.organisations.findIndex((org) => org.id === id);
    if (index !== -1) {
      this.organisations[index] = {
        ...this.organisations[index],
        ...updates,
        updatedAt: Date.now(),
      };
      return this.organisations[index];
    }

    // Fetch updated document
    return this.getOrganisation(id);
  }

  /**
   * Add a user to an organisation
   */
  async addUserToOrganisation(
    organisationId: string,
    user: InternalUser,
    role: OrganisationUser["role"] = "member"
  ): Promise<void> {
    const org = await this.getOrganisation(organisationId);
    if (!org) {
      throw new Error("Organisation not found");
    }

    const newUser: OrganisationUser = {
      userId: user.id,
      email: user.email,
      name: user.email || "",
      role: role,
      joinedAt: Date.now(),
    };

    const updatedUsers = [...org.users, newUser];
    await this.updateOrganisation(organisationId, { 
      users: updatedUsers 
    } as any);
  }

  /**
   * Remove a user from an organisation
   */
  async removeUserFromOrganisation(
    organisationId: string,
    userId: string
  ): Promise<void> {
    const org = await this.getOrganisation(organisationId);
    if (!org) {
      throw new Error("Organisation not found");
    }

    const updatedUsers = org.users.filter((u) => u.userId !== userId);
    await this.updateOrganisation(organisationId, { 
      users: updatedUsers 
    } as any);
  }

  /**
   * Get organisation summary for listing
   */
  async getOrganisationsSummary(): Promise<OrganisationSummary[]> {
    const orgs = await this.getOrganisations();
    
    // Get project counts for each organisation
    const orgsWithCounts = await Promise.all(
      orgs.map(async (org) => {
        const projectsSnapshot = await getDocs(
          collection(db, "organisations", org.id, "projects")
        );
        
        return {
          id: org.id,
          name: org.name,
          userCount: org.users.length,
          projectCount: projectsSnapshot.size,
          createdAt: org.createdAt,
        };
      })
    );

    return orgsWithCounts;
  }

  /**
   * Set selected organisation (for user context)
   */
  setSelectedOrganisation(organisationId: string | null): void {
    this.selectedOrganisationId = organisationId;
  }

  /**
   * Get selected organisation
   */
  getSelectedOrganisation(): string | null {
    return this.selectedOrganisationId;
  }

  /**
   * Invalidate cache
   */
  invalidateCache(): void {
    this.organisations = [];
    this.selectedOrganisationId = null;
  }
}

export const organisationStore = new OrganisationStore();

