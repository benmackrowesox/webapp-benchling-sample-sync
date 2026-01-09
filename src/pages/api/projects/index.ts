import { NextApiRequest, NextApiResponse } from "next/types";
import {
  firebaseServerAdmin,
  getUserOrganisation,
  getUserEmail,
} from "src/lib/server/firebase-admin";
import { 
  Project, 
  CreateProjectRequest, 
  ProjectWithStats 
} from "src/types/project";

async function decodeToken(req: NextApiRequest) {
  const idToken = req.headers.authorization;

  if (!idToken) {
    return null;
  }

  const decodedToken = await firebaseServerAdmin.auth().verifyIdToken(idToken);

  return decodedToken;
}

async function checkIsUserAdmin(uid: string): Promise<boolean> {
  const userDoc = await firebaseServerAdmin
    .firestore()
    .doc(`/new_users/${uid}`)
    .get();

  return userDoc.data()?.isAdmin ?? false;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const token = await decodeToken(req);
  if (!token?.uid) {
    res.status(401).send("Not authenticated.");
    return;
  }

  // GET - List projects
  if (req.method === "GET") {
    try {
      const isUserAdmin = await checkIsUserAdmin(token.uid);
      
      let projectsSnapshot;
      
      if (isUserAdmin) {
        // Admin sees all projects
        projectsSnapshot = await firebaseServerAdmin
          .firestore()
          .collection("projects")
          .orderBy("createdAt", "desc")
          .get();
      } else {
        // Regular users see only their organisation's projects
        const userOrg = await getUserOrganisation(token.uid);
        
        if (!userOrg) {
          res.status(200).send([]);
          return;
        }

        projectsSnapshot = await firebaseServerAdmin
          .firestore()
          .collection("projects")
          .where("organisationId", "==", userOrg.id)
          .orderBy("createdAt", "desc")
          .get();
      }

      // Get organisation names and sample counts
      const orgIds = new Set<string>();
      const projects: ProjectWithStats[] = [];

      projectsSnapshot.docs.forEach((doc) => {
        const data = doc.data();
        orgIds.add(data.organisationId);
        projects.push({
          ...data,
          id: doc.id,
          organisationName: "", // Will be populated
          sampleCount: 0,
          completedSampleCount: 0,
          linkedOrderCount: data.linkedOrderIds?.length || 0,
        } as ProjectWithStats);
      });

      // Fetch organisation names
      const orgNames: Record<string, string> = {};
      for (const orgId of orgIds) {
        try {
          const orgDoc = await firebaseServerAdmin
            .firestore()
            .doc(`organisations/${orgId}`)
            .get();
          
          if (orgDoc.exists) {
            orgNames[orgId] = orgDoc.data()?.name || "Unknown";
          }
        } catch (error) {
          console.error(`Error fetching org ${orgId}:`, error);
        }
      }

      // Get sample counts for each project
      for (const project of projects) {
        project.organisationName = orgNames[project.organisationId] || "Unknown";
        
        try {
          const samplesSnapshot = await firebaseServerAdmin
            .firestore()
            .collection("projects")
            .doc(project.id)
            .collection("samples")
            .get();
          
          project.sampleCount = samplesSnapshot.size;
          project.completedSampleCount = samplesSnapshot.docs.filter(
            (s) => s.data().status === "complete"
          ).length;
        } catch (error) {
          console.error(`Error fetching samples for project ${project.id}:`, error);
        }
      }

      res.status(200).send(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).send("Unexpected error.");
    }
    return;
  }

  // POST - Create new project (admin only)
  if (req.method === "POST") {
    console.log("[Projects API] POST request received");
    
    try {
      console.log("[Projects API] Checking if user is admin...");
      const isUserAdmin = await checkIsUserAdmin(token.uid);
      console.log("[Projects API] isUserAdmin:", isUserAdmin);
      
      if (!isUserAdmin) {
        res.status(403).send("Not authorized. Admin access required.");
        return;
      }

      const request: CreateProjectRequest = req.body;
      console.log("[Projects API] Request body:", request);

      if (!request.title || request.title.trim().length === 0) {
        res.status(400).send("Project title is required.");
        return;
      }

      if (!request.organisationId) {
        res.status(400).send("Organisation ID is required.");
        return;
      }

      // Verify organisation exists
      console.log("[Projects API] Verifying organisation:", request.organisationId);
      const orgDoc = await firebaseServerAdmin
        .firestore()
        .doc(`organisations/${request.organisationId}`)
        .get();
      console.log("[Projects API] Organisation exists:", orgDoc.exists);

      if (!orgDoc.exists) {
        res.status(400).send("Organisation not found.");
        return;
      }

      const now = Date.now();
      console.log("[Projects API] Getting user email for:", token.uid);
      const userEmail = await getUserEmail(token.uid);
      console.log("[Projects API] User email:", userEmail);

      const newProject: Omit<Project, "id"> = {
        title: request.title,
        description: request.description,
        organisationId: request.organisationId,
        status: "active",
        services: request.services || [],
        sampleTypes: request.sampleTypes || [],
        linkedOrderIds: [],
        metadataFields: request.metadataFields || [],
        createdBy: token.uid,
        createdAt: now,
        updatedAt: now,
        deliveryAddress: request.deliveryAddress,
        proposal: request.proposal,
      };
      console.log("[Projects API] Creating project with data:", newProject);

      console.log("[Projects API] Adding project to Firestore...");
      const docRef = await firebaseServerAdmin
        .firestore()
        .collection("projects")
        .add(newProject);
      console.log("[Projects API] Project created with ID:", docRef.id);

      res.status(200).send({
        id: docRef.id,
        title: request.title,
        message: "Project created successfully.",
      });
    } catch (error) {
      console.error("[Projects API] Error creating project:", error);
      // Return more detailed error info for debugging
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const err = error as any;
      const errorMessage = err?.message || err?.details || String(error);
      const errorCode = err?.code || "UNKNOWN";
      console.error("[Projects API] Error details:", { message: errorMessage, code: errorCode, stack: err?.stack });
      res.status(500).json({ 
        error: "Unexpected error.", 
        details: process.env.NODE_ENV === "development" ? errorMessage : undefined,
        code: errorCode
      });
    }
    return;
  }

  res.status(400).send("Bad request");
}

