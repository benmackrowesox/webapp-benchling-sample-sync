/**
 * Admin Samples Benchling API
 * 
 * Direct CRUD operations for samples with Benchling.
 */

import { NextApiRequest, NextApiResponse } from "next/types";
import { firebaseServerAdmin } from "src/lib/server/firebase-admin";
import {
  getAllSamples,
  getSampleById,
  createSample,
  updateSample,
  deleteSample,
  syncToBenchling,
  syncFromBenchling,
} from "src/lib/server/sync";
import { SyncedSample, SampleStatus } from "src/types/sync";

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
    // List all samples or get single sample
    const { id } = req.query;
    
    try {
      if (id) {
        const sample = await getSampleById(id as string);
        if (!sample) {
          res.status(404).json({ error: "Sample not found" });
          return;
        }
        res.status(200).json(sample);
      } else {
        const samples = await getAllSamples();
        res.status(200).json(samples);
      }
    } catch (error: any) {
      console.error("Error getting samples:", error);
      res.status(500).json({ error: "Failed to get samples" });
    }
  } else if (req.method === "POST") {
    // Create new sample
    const {
      sampleId,
      clientName,
      sampleType,
      sampleFormat,
      sampleDate,
      sampleStatus,
      orderId,
    } = req.body;

    // Validate required fields
    if (!sampleId || !clientName || !sampleType || !sampleDate || !sampleStatus) {
      res.status(400).json({ 
        error: "Missing required fields",
        required: ["sampleId", "clientName", "sampleType", "sampleDate", "sampleStatus"],
      });
      return;
    }

    try {
      const id = await createSample({
        sampleId,
        clientName,
        sampleType,
        sampleFormat: sampleFormat || "",
        sampleDate,
        sampleStatus: sampleStatus as SampleStatus,
        orderId,
        createdBy: token.uid,
      });

      res.status(201).json({ 
        message: "Sample created successfully",
        id,
      });
    } catch (error: any) {
      console.error("Error creating sample:", error);
      res.status(500).json({ 
        error: "Failed to create sample",
        message: error.message,
      });
    }
  } else if (req.method === "PATCH") {
    // Update sample
    const { id, ...updates } = req.body;

    if (!id) {
      res.status(400).json({ error: "Sample ID required" });
      return;
    }

    try {
      await updateSample(id, updates);
      res.status(200).json({ message: "Sample updated successfully" });
    } catch (error: any) {
      console.error("Error updating sample:", error);
      res.status(500).json({ 
        error: "Failed to update sample",
        message: error.message,
      });
    }
  } else if (req.method === "DELETE") {
    // Delete sample
    const { id } = req.query;

    if (!id) {
      res.status(400).json({ error: "Sample ID required" });
      return;
    }

    try {
      await deleteSample(id as string);
      res.status(200).json({ message: "Sample deleted successfully" });
    } catch (error: any) {
      console.error("Error deleting sample:", error);
      res.status(500).json({ 
        error: "Failed to delete sample",
        message: error.message,
      });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}

