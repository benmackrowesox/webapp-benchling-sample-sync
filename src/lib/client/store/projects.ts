/**
 * Project Store - Client-side Firestore data access
 * 
 * This store provides methods for managing projects in the client.
 * Projects are linked to organisations and can optionally link to
 * legacy orders for historical reference.
 */

import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query, 
  where, 
  orderBy,
  serverTimestamp 
} from "firebase/firestore";
import { db } from "src/lib/client/firebase";
import type { 
  Project, 
  ProjectSample,
  ProjectMetadataField,
  CreateProjectRequest, 
  UpdateProjectRequest,
  AddSampleRequest,
  ProjectSummary,
  ProjectWithStats,
  SampleStatus
} from "src/types/project";
import type { InternalUser } from "src/types/user";

// Helper interface for Firestore data
interface FirestoreProjectData {
  title: string;
  description?: string;
  organisationId: string;
  status: string;
  services: string[];
  sampleTypes: string[];
  linkedOrderIds: string[];
  metadataFields: ProjectMetadataField[];
  createdBy: string;
  createdAt: number;
  updatedAt?: number;
  deliveryAddress?: any;
  proposal?: string;
}


class ProjectStore {
  projects: Project[] = [];
  currentProject: Project | null = null;

  /**
   * Get all projects (admin only)
   */
  async getProjects(): Promise<Project[]> {
    await getDocs(collection(db, "projects"))
      .then((querySnapshot) => {
        const data: Project[] = querySnapshot.docs.map((doc) => {
          const docData = doc.data() as FirestoreProjectData;
          return {
            id: doc.id,
            title: docData.title,
            description: docData.description,
            organisationId: docData.organisationId,
            status: docData.status as Project["status"],
            services: docData.services,
            sampleTypes: docData.sampleTypes,
            linkedOrderIds: docData.linkedOrderIds || [],
            metadataFields: docData.metadataFields || [],
            createdBy: docData.createdBy,
            createdAt: docData.createdAt,
            updatedAt: docData.updatedAt,
            deliveryAddress: docData.deliveryAddress,
            proposal: docData.proposal,
          } as Project;
        });
        this.projects = data;
      })
      .catch((err) => {
        console.error("Error fetching projects:", err);
        return null;
      });
    return this.projects;
  }

  /**
   * Get projects for a specific organisation
   */
  async getProjectsByOrganisation(organisationId: string): Promise<Project[]> {
    const q = query(
      collection(db, "projects"),
      where("organisationId", "==", organisationId),
      orderBy("createdAt", "desc")
    );
    
    await getDocs(q)
      .then((querySnapshot) => {
        const data: Project[] = querySnapshot.docs.map((doc) => {
          const docData = doc.data() as FirestoreProjectData;
          return {
            id: doc.id,
            title: docData.title,
            description: docData.description,
            organisationId: docData.organisationId,
            status: docData.status as Project["status"],
            services: docData.services,
            sampleTypes: docData.sampleTypes,
            linkedOrderIds: docData.linkedOrderIds || [],
            metadataFields: docData.metadataFields || [],
            createdBy: docData.createdBy,
            createdAt: docData.createdAt,
            updatedAt: docData.updatedAt,
            deliveryAddress: docData.deliveryAddress,
            proposal: docData.proposal,
          } as Project;
        });
        this.projects = data;
      })
      .catch((err) => {
        console.error("Error fetching organisation projects:", err);
        return null;
      });
    return this.projects;
  }

  /**
   * Get a single project by ID
   */
  async getProject(id: string): Promise<Project | null> {
    // Check cache first
    const cached = this.projects.find((proj) => proj.id === id);
    if (cached) {
      this.currentProject = cached;
      return cached;
    }

    const docRef = doc(db, "projects", id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const project = { ...docSnap.data(), id: docSnap.id } as Project;
      this.currentProject = project;
      this.projects.push(project);
      return project;
    }
    
    return null;
  }

  /**
   * Create a new project (admin only)
   */
  async createProject(
    request: CreateProjectRequest,
    createdBy: string
  ): Promise<Project> {
    const now = Date.now();
    const newProject: Omit<Project, "id"> = {
      title: request.title,
      description: request.description,
      organisationId: request.organisationId,
      status: "active",
      services: request.services,
      sampleTypes: request.sampleTypes,
      linkedOrderIds: [],
      metadataFields: request.metadataFields || [],
      createdBy: createdBy,
      createdAt: now,
      updatedAt: now,
      deliveryAddress: request.deliveryAddress,
      proposal: request.proposal,
    };

    const docRef = await addDoc(collection(db, "projects"), newProject);
    
    const project: Project = {
      ...newProject,
      id: docRef.id,
    };
    
    this.projects.push(project);
    return project;
  }

  /**
   * Update a project
   */
  async updateProject(
    id: string,
    updates: UpdateProjectRequest
  ): Promise<Project | null> {
    const docRef = doc(db, "projects", id);
    
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Date.now(),
    });

    // Update cache
    const index = this.projects.findIndex((proj) => proj.id === id);
    if (index !== -1) {
      this.projects[index] = {
        ...this.projects[index],
        ...updates,
        updatedAt: Date.now(),
      };
      return this.projects[index];
    }

    // Fetch updated document
    return this.getProject(id);
  }

  /**
   * Archive a project (soft delete)
   */
  async archiveProject(id: string): Promise<void> {
    await this.updateProject(id, { status: "archived" });
  }

  /**
   * Delete a project (admin only, hard delete)
   */
  async deleteProject(id: string): Promise<void> {
    const docRef = doc(db, "projects", id);
    await deleteDoc(docRef);
    
    // Remove from cache
    this.projects = this.projects.filter((p) => p.id !== id);
    if (this.currentProject?.id === id) {
      this.currentProject = null;
    }
  }

  /**
   * Link a legacy order to a project (admin only)
   */
  async linkOrderToProject(
    projectId: string,
    orderId: string
  ): Promise<void> {
    const project = await this.getProject(projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    if (project.linkedOrderIds.includes(orderId)) {
      throw new Error("Order is already linked to this project");
    }

    const updatedOrderIds = [...project.linkedOrderIds, orderId];
    await this.updateProject(projectId, { 
      linkedOrderIds: updatedOrderIds 
    });
  }

  /**
   * Unlink an order from a project (admin only)
   */
  async unlinkOrderFromProject(
    projectId: string,
    orderId: string
  ): Promise<void> {
    const project = await this.getProject(projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    const updatedOrderIds = project.linkedOrderIds.filter((id) => id !== orderId);
    await this.updateProject(projectId, { 
      linkedOrderIds: updatedOrderIds 
    });
  }

  /**
   * Get samples for a project
   */
  async getProjectSamples(projectId: string): Promise<ProjectSample[]> {
    const q = query(
      collection(db, "projects", projectId, "samples"),
      orderBy("lastUpdated", "desc")
    );

    const querySnapshot = await getDocs(q);
    const samples: ProjectSample[] = querySnapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    })) as ProjectSample[];

    return samples;
  }

  /**
   * Add a sample to a project
   */
  async addSample(
    projectId: string,
    request: AddSampleRequest
  ): Promise<ProjectSample> {
    const now = Date.now();
    const newSample: Omit<ProjectSample, "id"> = {
      projectId: projectId,
      name: request.name,
      service: request.service,
      sampleType: request.sampleType,
      status: "sample-collected",
      metadata: request.metadata,
      lastUpdated: now,
      collectedAt: request.collectedAt,
      submittedAt: now,
    };

    const docRef = await addDoc(
      collection(db, "projects", projectId, "samples"),
      newSample
    );

    const sample: ProjectSample = {
      ...newSample,
      id: docRef.id,
    };

    return sample;
  }

  /**
   * Update a sample status
   */
  async updateSampleStatus(
    projectId: string,
    sampleId: string,
    status: SampleStatus,
    reportUrl?: string
  ): Promise<void> {
    const docRef = doc(db, "projects", projectId, "samples", sampleId);
    
    await updateDoc(docRef, {
      status: status,
      reportUrl: reportUrl,
      lastUpdated: Date.now(),
    });
  }

  /**
   * Update sample metadata
   */
  async updateSampleMetadata(
    projectId: string,
    sampleId: string,
    metadata: Record<string, MetadataSubmission>
  ): Promise<void> {
    const docRef = doc(db, "projects", projectId, "samples", sampleId);
    
    await updateDoc(docRef, {
      metadata: metadata,
      lastUpdated: Date.now(),
    });
  }

  /**
   * Get project summary for listing
   */
  async getProjectsSummary(organisationId?: string): Promise<ProjectSummary[]> {
    let projects: Project[];
    
    if (organisationId) {
      projects = await this.getProjectsByOrganisation(organisationId);
    } else {
      projects = await this.getProjects();
    }

    // Get sample counts for each project
    const summaries = await Promise.all(
      projects.map(async (project) => {
        const samples = await this.getProjectSamples(project.id);
        
        return {
          id: project.id,
          title: project.title,
          status: project.status,
          organisationId: project.organisationId,
          organisationName: "", // Will need to fetch organisation name
          sampleCount: samples.length,
          linkedOrderCount: project.linkedOrderIds.length,
          createdAt: project.createdAt,
          updatedAt: project.updatedAt,
        };
      })
    );

    return summaries;
  }

  /**
   * Get project with statistics
   */
  async getProjectWithStats(projectId: string): Promise<ProjectWithStats | null> {
    const project = await this.getProject(projectId);
    if (!project) {
      return null;
    }

    const samples = await this.getProjectSamples(projectId);

    return {
      ...project,
      organisationName: "", // Would need to fetch organisation
      sampleCount: samples.length,
      completedSampleCount: samples.filter((s) => s.status === "complete").length,
      linkedOrderCount: project.linkedOrderIds.length,
    };
  }

  /**
   * Invalidate cache
   */
  invalidateCache(): void {
    this.projects = [];
    this.currentProject = null;
  }
}

export const projectStore = new ProjectStore();

// Helper type for metadata submission
interface MetadataSubmission {
  name: string;
  displayName: string;
  units?: string;
  value: any;
}

