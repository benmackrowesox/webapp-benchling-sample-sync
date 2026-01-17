/**
 * Admin Samples Sync API
 * 
 * Main sync operations endpoint for admin users.
 * Handles sync status, manual sync triggers, and queue management.
 */

import { NextApiRequest, NextApiResponse } from "next/types";
import { firebaseServerAdmin } from "src/lib/server/firebase-admin";
import {
  getSyncStatus,
  processSyncQueue,
  importFromBenchling,
  updateSyncMetadata,
} from "src/lib/server/sync";

async function decodeToken(req: NextApiRequest) {
  const idToken = req.headers.authorization;

  if (!idToken) {
    return null;
  }

  const decodedToken = await firebaseServerAdmin.auth().verifyIdToken(idToken);

  return decodedToken;
}

async function isAdmin(uid: string): Promise<boolean> {
  const userDoc = await firebaseServerAdmin
    .firestore()
    .doc(`/new_users/${uid}`)
    .get();

  return userDoc.data()?.isAdmin ?? false;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const token = await decodeToken(req);
  if (!token?.uid || !(await isAdmin(token.uid))) {
    res.status(401).json({ error: "Not authorized" });
    return;
  }

  if (req.method === "GET") {
    // Get sync status
    try {
      const status = await getSyncStatus();
      res.status(200).json(status);
    } catch (error: any) {
      console.error("Error getting sync status:", error);
      res.status(500).json({ error: "Failed to get sync status" });
    }
  } else if (req.method === "POST") {
    // Trigger sync operations
    const { action } = req.body;

    try {
      if (action === "process-queue") {
        // Process pending sync operations
        const result = await processSyncQueue();
        res.status(200).json({
          message: "Sync queue processed",
          ...result,
        });
      } else if (action === "import") {
        // Start import from Benchling
        const importResult = await importFromBenchling();
        res.status(200).json({
          message: "Import completed",
          ...importResult,
        });
      } else if (action === "clear-errors") {
        // Clear sync errors from metadata
        await updateSyncMetadata({ syncErrors: [] });
        res.status(200).json({ message: "Sync errors cleared" });
      } else {
        res.status(400).json({ error: "Invalid action" });
      }
    } catch (error: any) {
      console.error("Error processing sync action:", error);
      res.status(500).json({ 
        error: "Sync action failed",
        message: error.message,
      });
    }
  } else if (req.method === "DELETE") {
    // Clear sync queue
    try {
      const db = firebaseServerAdmin.firestore();
      
      // Delete all pending/failed queue items
      const snapshot = await db
        .collection("sync_queue")
        .where("status", "in", ["pending", "failed"])
        .get();
      
      const batch = db.batch();
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
      
      res.status(200).json({ 
        message: "Sync queue cleared",
        deleted: snapshot.size,
      });
    } catch (error: any) {
      console.error("Error clearing sync queue:", error);
      res.status(500).json({ error: "Failed to clear sync queue" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}

