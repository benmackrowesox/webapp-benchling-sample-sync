import { NextApiRequest, NextApiResponse } from "next/types";
import {
  firebaseServerAdmin,
  getOrganisation,
  isUserInOrganisation,
} from "src/lib/server/firebase-admin";
import { Project, UpdateProjectRequest, ProjectWithStats } from "src/types/project";

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

  const path = req.query.projectId;
  const projectId = Array.isArray(path) ? path[0] : path;

  if (!projectId) {
    res.status(400).send("Project ID is required.");
    return;
  }

  // GET - Get project details
  if (req.method === "GET") {
    try {
      const isUserAdminFlag = await checkIsUserAdmin(token.uid);
      
      // Fetch project
      const projectDoc = await firebaseServerAdmin
        .firestore()
        .doc(`projects/${projectId}`)
        .get();

      if (!projectDoc.exists) {
        res.status(404).send("Project not found.");
        return;
      }

      const project = projectDoc.data() as Project;
      
      // Check if user has access
      const isMember = await isUserInOrganisation(project.organisationId, token.uid);
      
      if (!isUserAdminFlag && !isMember) {
        res.status(403).send("Not authorized. You don't have access to this project.");
        return;
      }

      // Get organisation name
      const org = await getOrganisation(project.organisationId);
      
      // Get sample count
      const samplesSnapshot = await firebaseServerAdmin
        .firestore()
        .collection("projects")
        .doc(projectId)
        .collection("samples")
        .get();

      const completedSamples = samplesSnapshot.docs.filter(
        (s) => s.data().status === "complete"
      ).length;

      const projectWithStats: ProjectWithStats = {
        ...project,
        id: projectId,
        organisationName: org?.name || "Unknown",
        sampleCount: samplesSnapshot.size,
        completedSampleCount: completedSamples,
        linkedOrderCount: project.linkedOrderIds?.length || 0,
      };

      res.status(200).send(projectWithStats);
    } catch (error) {
      console.error("Error fetching project:", error);
      res.status(500).send("Unexpected error.");
    }
    return;
  }

  // PATCH - Update project
  if (req.method === "PATCH") {
    try {
      const isUserAdminFlag = await checkIsUserAdmin(token.uid);
      
      // Fetch project first
      const projectDoc = await firebaseServerAdmin
        .firestore()
        .doc(`projects/${projectId}`)
        .get();

      if (!projectDoc.exists) {
        res.status(404).send("Project not found.");
        return;
      }

      const project = projectDoc.data() as Project;
      
      // Check if user is admin or member of organisation
      const isMember = await isUserInOrganisation(project.organisationId, token.uid);
      
      // Only admins can update projects
      if (!isUserAdminFlag) {
        res.status(403).send("Not authorized. Admin access required.");
        return;
      }

      const request: UpdateProjectRequest = req.body;

      await firebaseServerAdmin
        .firestore()
        .doc(`projects/${projectId}`)
        .update({
          ...request,
          updatedAt: Date.now(),
        });

      res.status(200).send({
        message: "Project updated successfully.",
      });
    } catch (error) {
      console.error("Error updating project:", error);
      res.status(500).send("Unexpected error.");
    }
    return;
  }

  // DELETE - Archive project (admin only)
  if (req.method === "DELETE") {
    try {
      const isUserAdminFlag = await checkIsUserAdmin(token.uid);
      
      if (!isUserAdminFlag) {
        res.status(403).send("Not authorized. Admin access required.");
        return;
      }

      const projectDoc = await firebaseServerAdmin
        .firestore()
        .doc(`projects/${projectId}`)
        .get();

      if (!projectDoc.exists) {
        res.status(404).send("Project not found.");
        return;
      }

      // Soft delete - mark as archived
      await firebaseServerAdmin
        .firestore()
        .doc(`projects/${projectId}`)
        .update({
          status: "archived",
          updatedAt: Date.now(),
        });

      res.status(200).send({
        message: "Project archived successfully.",
      });
    } catch (error) {
      console.error("Error archiving project:", error);
      res.status(500).send("Unexpected error.");
    }
    return;
  }

  res.status(400).send("Bad request");
}

