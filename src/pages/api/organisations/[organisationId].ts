import { NextApiRequest, NextApiResponse } from "next/types";
import {
  firebaseServerAdmin,
  getOrganisation,
  updateOrganisation,
  isUserInOrganisation,
} from "src/lib/server/firebase-admin";
import { UpdateOrganisationRequest } from "src/types/organisation";

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

  const path = req.query.organisationId;
  const organisationId = Array.isArray(path) ? path[0] : path;

  if (!organisationId) {
    res.status(400).send("Organisation ID is required.");
    return;
  }

  // GET - Get organisation details
  if (req.method === "GET") {
    try {
      const isUserAdmin = await checkIsUserAdmin(token.uid);
      
      // Check if user has access
      const isMember = await isUserInOrganisation(organisationId, token.uid);
      
      if (!isUserAdmin && !isMember) {
        res.status(403).send("Not authorized. You don't have access to this organisation.");
        return;
      }

      const organisation = await getOrganisation(organisationId);
      
      if (!organisation) {
        res.status(404).send("Organisation not found.");
        return;
      }

      res.status(200).send(organisation);
    } catch (error) {
      console.error("Error fetching organisation:", error);
      res.status(500).send("Unexpected error.");
    }
    return;
  }

  // PATCH - Update organisation (admin only or owner)
  if (req.method === "PATCH") {
    try {
      const isUserAdmin = await checkIsUserAdmin(token.uid);
      const organisation = await getOrganisation(organisationId);

      if (!organisation) {
        res.status(404).send("Organisation not found.");
        return;
      }

      // Check if user is owner or admin
      const isOwner = organisation.users.some(
        (u) => u.userId === token.uid && u.role === "owner"
      );

      if (!isUserAdmin && !isOwner) {
        res.status(403).send("Not authorized. Only owners or admins can update organisations.");
        return;
      }

      const request: UpdateOrganisationRequest = req.body;

      await updateOrganisation(organisationId, request);

      res.status(200).send({
        message: "Organisation updated successfully.",
      });
    } catch (error) {
      console.error("Error updating organisation:", error);
      res.status(500).send("Unexpected error.");
    }
    return;
  }

  // DELETE - Archive organisation (admin only)
  if (req.method === "DELETE") {
    try {
      const isUserAdmin = await checkIsUserAdmin(token.uid);
      
      if (!isUserAdmin) {
        res.status(403).send("Not authorized. Admin access required.");
        return;
      }

      const organisation = await getOrganisation(organisationId);
      
      if (!organisation) {
        res.status(404).send("Organisation not found.");
        return;
      }

      // Soft delete - mark as inactive
      await updateOrganisation(organisationId, { isActive: false });

      res.status(200).send({
        message: "Organisation archived successfully.",
      });
    } catch (error) {
      console.error("Error archiving organisation:", error);
      res.status(500).send("Unexpected error.");
    }
    return;
  }

  res.status(400).send("Bad request");
}

