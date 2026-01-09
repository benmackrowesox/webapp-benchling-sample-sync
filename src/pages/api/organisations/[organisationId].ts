import { NextApiRequest, NextApiResponse } from "next/types";
import {
  firebaseServerAdmin,
  getOrganisation,
  updateOrganisation,
  isUserInOrganisation,
  addUserToOrganisation,
  removeUserFromOrganisation,
  getUserEmail,
} from "src/lib/server/firebase-admin";
import { UpdateOrganisationRequest, AddUserRequest } from "src/types/organisation";

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

async function checkIsOrgAdminOrOwner(organisationId: string, uid: string): Promise<{ isAdmin: boolean; isOwner: boolean; role: string | null }> {
  const organisation = await getOrganisation(organisationId);
  if (!organisation) {
    return { isAdmin: false, isOwner: false, role: null };
  }

  const user = organisation.users.find((u) => u.userId === uid);
  return {
    isAdmin: user?.role === "admin" || user?.role === "owner",
    isOwner: user?.role === "owner",
    role: user?.role || null,
  };
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
      const { isOwner } = await checkIsOrgAdminOrOwner(organisationId, token.uid);

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

  // POST - Add user to organisation (admin only or org admin/owner)
  if (req.method === "POST") {
    try {
      const isUserAdmin = await checkIsUserAdmin(token.uid);
      const { isAdmin: isOrgAdmin } = await checkIsOrgAdminOrOwner(organisationId, token.uid);

      if (!isUserAdmin && !isOrgAdmin) {
        res.status(403).send("Not authorized. Only organisation admins can add users.");
        return;
      }

      const request: AddUserRequest = req.body;

      if (!request.userId || !request.email) {
        res.status(400).send("User ID and email are required.");
        return;
      }

      const role = request.role || "member";

      await addUserToOrganisation(organisationId, request.userId, request.email, role);

      res.status(200).send({
        message: "User added to organisation successfully.",
      });
    } catch (error: any) {
      console.error("Error adding user to organisation:", error);
      if (error.message === "Organisation not found") {
        res.status(404).send("Organisation not found.");
        return;
      }
      res.status(500).send(error.message || "Unexpected error.");
    }
    return;
  }

  // DELETE - Remove user from organisation (admin only or org admin/owner)
  if (req.method === "DELETE") {
    try {
      const isUserAdmin = await checkIsUserAdmin(token.uid);
      const { isAdmin: isOrgAdmin } = await checkIsOrgAdminOrOwner(organisationId, token.uid);

      if (!isUserAdmin && !isOrgAdmin) {
        res.status(403).send("Not authorized. Only organisation admins can remove users.");
        return;
      }

      const { userId } = req.query;

      if (!userId || typeof userId !== "string") {
        res.status(400).send("User ID is required.");
        return;
      }

      // Prevent removing yourself if you're the only owner
      const organisation = await getOrganisation(organisationId);
      if (!organisation) {
        res.status(404).send("Organisation not found.");
        return;
      }

      const userToRemove = organisation.users.find((u) => u.userId === userId);
      if (userToRemove?.role === "owner") {
        const ownerCount = organisation.users.filter((u) => u.role === "owner").length;
        if (ownerCount === 1) {
          res.status(400).send("Cannot remove the only owner. Transfer ownership first.");
          return;
        }
      }

      await removeUserFromOrganisation(organisationId, userId);

      res.status(200).send({
        message: "User removed from organisation successfully.",
      });
    } catch (error: any) {
      console.error("Error removing user from organisation:", error);
      if (error.message === "Organisation not found") {
        res.status(404).send("Organisation not found.");
        return;
      }
      res.status(500).send(error.message || "Unexpected error.");
    }
    return;
  }

  res.status(400).send("Bad request");
}

