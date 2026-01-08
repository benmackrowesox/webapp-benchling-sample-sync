import { NextApiRequest, NextApiResponse } from "next/types";
import {
  firebaseServerAdmin,
  isUserInOrganisation,
} from "src/lib/server/firebase-admin";
import { ProjectSample, AddSampleRequest } from "src/types/project";

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

  const projectPath = req.query.projectId;
  const projectId = Array.isArray(projectPath) ? projectPath[0] : projectPath;

  if (!projectId) {
    res.status(400).send("Project ID is required.");
    return;
  }

  // GET - List samples in project
  if (req.method === "GET") {
    try {
      const isUserAdminFlag = await checkIsUserAdmin(token.uid);
      
      // Fetch project to check permissions
      const projectDoc = await firebaseServerAdmin
        .firestore()
        .doc(`projects/${projectId}`)
        .get();

      if (!projectDoc.exists) {
        res.status(404).send("Project not found.");
        return;
      }

      const projectData = projectDoc.data()!;
      
      // Check if user has access
      const isMember = await isUserInOrganisation(projectData.organisationId, token.uid);
      
      if (!isUserAdminFlag && !isMember) {
        res.status(403).send("Not authorized. You don't have access to this project.");
        return;
      }

      // Get samples
      const samplesSnapshot = await firebaseServerAdmin
        .firestore()
        .collection("projects")
        .doc(projectId)
        .collection("samples")
        .orderBy("lastUpdated", "desc")
        .get();

      const samples: ProjectSample[] = samplesSnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      })) as ProjectSample[];

      res.status(200).send(samples);
    } catch (error) {
      console.error("Error fetching samples:", error);
      res.status(500).send("Unexpected error.");
    }
    return;
  }

  // POST - Add sample to project
  if (req.method === "POST") {
    try {
      const isUserAdminFlag = await checkIsUserAdmin(token.uid);
      
      // Fetch project to check permissions
      const projectDoc = await firebaseServerAdmin
        .firestore()
        .doc(`projects/${projectId}`)
        .get();

      if (!projectDoc.exists) {
        res.status(404).send("Project not found.");
        return;
      }

      const projectData = projectDoc.data()!;
      
      // Check if user has access
      const isMember = await isUserInOrganisation(projectData.organisationId, token.uid);
      
      if (!isUserAdminFlag && !isMember) {
        res.status(403).send("Not authorized. You don't have access to this project.");
        return;
      }

      // Check if project is active
      if (projectData.status !== "active") {
        res.status(400).send("Cannot add samples to a project that is not active.");
        return;
      }

      const request: AddSampleRequest = req.body;

      if (!request.name || request.name.trim().length === 0) {
        res.status(400).send("Sample name is required.");
        return;
      }

      if (!request.service) {
        res.status(400).send("Service is required.");
        return;
      }

      if (!request.sampleType) {
        res.status(400).send("Sample type is required.");
        return;
      }

      const now = Date.now();
      const newSample: Omit<ProjectSample, "id"> = {
        projectId: projectId,
        name: request.name,
        service: request.service,
        sampleType: request.sampleType,
        status: "sample-collected",
        metadata: request.metadata || {},
        lastUpdated: now,
        collectedAt: request.collectedAt,
        submittedAt: now,
      };

      const docRef = await firebaseServerAdmin
        .firestore()
        .collection("projects")
        .doc(projectId)
        .collection("samples")
        .add(newSample);

      const sample: ProjectSample = {
        ...newSample,
        id: docRef.id,
      };

      res.status(200).send({
        id: docRef.id,
        name: request.name,
        message: "Sample added successfully.",
        sample: sample,
      });
    } catch (error) {
      console.error("Error adding sample:", error);
      res.status(500).send("Unexpected error.");
    }
    return;
  }

  res.status(400).send("Bad request");
}

