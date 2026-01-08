import { NextApiRequest, NextApiResponse } from "next/types";
import {
  firebaseServerAdmin,
  isUserInOrganisation,
} from "src/lib/server/firebase-admin";
import { LinkOrderRequest } from "src/types/project";

async function decodeToken(req: NextApiRequest) {
  const idToken = req.headers.authorization;

  if (!idToken) {
    return null;
  }

  const decodedToken = await firebaseServerAdmin.auth().verifyIdToken(idToken);

  return decodedToken;
}

async function isUserAdmin(uid: string): Promise<boolean> {
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

  // POST - Link an order to a project
  if (req.method === "POST") {
    try {
      const isUserAdminFlag = await isUserAdmin(token.uid);
      
      if (!isUserAdminFlag) {
        res.status(403).send("Not authorized. Admin access required.");
        return;
      }

      const request: LinkOrderRequest = req.body;

      if (!request.orderId || request.orderId.trim().length === 0) {
        res.status(400).send("Order ID is required.");
        return;
      }

      // Fetch project
      const projectDoc = await firebaseServerAdmin
        .firestore()
        .doc(`projects/${projectId}`)
        .get();

      if (!projectDoc.exists) {
        res.status(404).send("Project not found.");
        return;
      }

      const projectData = projectDoc.data()!;
      const linkedOrderIds = projectData.linkedOrderIds || [];

      // Check if order is already linked
      if (linkedOrderIds.includes(request.orderId)) {
        res.status(400).send("Order is already linked to this project.");
        return;
      }

      // Verify order exists (in the legacy new_orders collection)
      const orderDoc = await firebaseServerAdmin
        .firestore()
        .doc(`new_orders/${request.orderId}`)
        .get();

      if (!orderDoc.exists) {
        res.status(404).send("Order not found. The order may have been deleted.");
        return;
      }

      // Link the order to the project
      const updatedOrderIds = [...linkedOrderIds, request.orderId];

      await firebaseServerAdmin
        .firestore()
        .doc(`projects/${projectId}`)
        .update({
          linkedOrderIds: updatedOrderIds,
          updatedAt: Date.now(),
        });

      // Also optionally update the order to reference the project
      // (This is optional - orders are primarily for historical reference)
      await firebaseServerAdmin
        .firestore()
        .doc(`new_orders/${request.orderId}`)
        .update({
          linkedProjectId: projectId,
          linkedProjectTitle: projectData.title,
        });

      res.status(200).send({
        message: "Order linked to project successfully.",
        orderId: request.orderId,
        projectId: projectId,
      });
    } catch (error) {
      console.error("Error linking order to project:", error);
      res.status(500).send("Unexpected error.");
    }
    return;
  }

  // DELETE - Unlink an order from a project
  if (req.method === "DELETE") {
    try {
      const isUserAdminFlag = await isUserAdmin(token.uid);
      
      if (!isUserAdminFlag) {
        res.status(403).send("Not authorized. Admin access required.");
        return;
      }

      const request: LinkOrderRequest = req.body;

      if (!request.orderId || request.orderId.trim().length === 0) {
        res.status(400).send("Order ID is required.");
        return;
      }

      // Fetch project
      const projectDoc = await firebaseServerAdmin
        .firestore()
        .doc(`projects/${projectId}`)
        .get();

      if (!projectDoc.exists) {
        res.status(404).send("Project not found.");
        return;
      }

      const projectData = projectDoc.data()!;
      const linkedOrderIds = projectData.linkedOrderIds || [];

      // Check if order is linked
      if (!linkedOrderIds.includes(request.orderId)) {
        res.status(400).send("Order is not linked to this project.");
        return;
      }

      // Unlink the order
      const updatedOrderIds = linkedOrderIds.filter((id: string) => id !== request.orderId);

      await firebaseServerAdmin
        .firestore()
        .doc(`projects/${projectId}`)
        .update({
          linkedOrderIds: updatedOrderIds,
          updatedAt: Date.now(),
        });

      // Remove project reference from order
      await firebaseServerAdmin
        .firestore()
        .doc(`new_orders/${request.orderId}`)
        .update({
          linkedProjectId: null,
          linkedProjectTitle: null,
        });

      res.status(200).send({
        message: "Order unlinked from project successfully.",
        orderId: request.orderId,
        projectId: projectId,
      });
    } catch (error) {
      console.error("Error unlinking order from project:", error);
      res.status(500).send("Unexpected error.");
    }
    return;
  }

  res.status(400).send("Bad request");
}

