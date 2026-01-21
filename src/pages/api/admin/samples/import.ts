/**
 * Admin Samples Import API
 * 
 * Handles initial import of all EBM samples from Benchling.
 */

import { NextApiRequest, NextApiResponse } from "next/types";
import { firebaseServerAdmin } from "src/lib/server/firebase-admin";
import { importFromBenchling, getSyncStatus } from "src/lib/server/sync";

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
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const token = await decodeToken(req);
  if (!token?.uid || !(await isAdmin(token.uid))) {
    res.status(401).json({ error: "Not authorized" });
    return;
  }

  try {
    // Check if import is already in progress
    const status = await getSyncStatus();
    
    const db = firebaseServerAdmin.firestore();
    const metadataDoc = await db.doc("benchling_samples/sync_metadata").get();
    const metadata = metadataDoc.exists ? metadataDoc.data() : null;
    
    if (metadata?.importInProgress) {
      res.status(409).json({ 
        error: "Import already in progress",
        progress: metadata.importProgress,
      });
      return;
    }

    // Start import
    const importResult = await importFromBenchling();

    res.status(200).json({
      message: "Import completed successfully",
      totalSamplesFound: importResult.total,
      imported: importResult.imported,
      errors: importResult.errors,
      syncStatus: await getSyncStatus(),
    });
  } catch (error: any) {
    console.error("Error during import:", error);
    
    // Provide more helpful error messages
    let errorMessage = error.message;
    let errorCode = "UNKNOWN_ERROR";
    
    if (error.message?.includes("ENOTFOUND") || error.message?.includes("getaddrinfo")) {
      errorMessage = "Cannot connect to Benchling API. Please check your API URL configuration.";
      errorCode = "DNS_ERROR";
    } else if (error.message?.includes("ENOTFOUND")) {
      errorMessage = "Cannot resolve Benchling API domain. Please verify NEXT_PRIVATE_BENCHLING_API_URL is correct.";
      errorCode = "DNS_ERROR";
    } else if (error.response?.status === 401) {
      errorMessage = "Authentication failed. Please check your Benchling API key.";
      errorCode = "AUTH_ERROR";
    } else if (error.response?.status === 403) {
      errorMessage = "Access denied. Please check your Benchling API permissions.";
      errorCode = "PERMISSION_ERROR";
    } else if (error.response?.status === 404) {
      const userMessage = error.response?.data?.userMessage || "";
      if (userMessage.includes("signing in") || userMessage.includes("Resource not found")) {
        errorMessage = "Authentication failed or API key invalid. Please verify your Benchling API key is correct and has proper permissions.";
        errorCode = "AUTH_ERROR";
      } else {
        errorMessage = "Benchling schema or registry not found. Please check your schema and registry IDs.";
        errorCode = "NOT_FOUND_ERROR";
      }
    } else if (error.isAuthError) {
      errorMessage = "Authentication failed. Please check your Benchling API key is valid and has not expired.";
      errorCode = "AUTH_ERROR";
    }
    
    res.status(500).json({ 
      error: "Import failed",
      message: errorMessage,
      code: errorCode,
    });
  }
}

