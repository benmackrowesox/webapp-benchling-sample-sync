/**
 * Benchling Webhook Handler
 * 
 * Receives real-time update events from Benchling
 * and syncs changes to Firestore.
 */

import { NextApiRequest, NextApiResponse } from "next/types";
import { firebaseServerAdmin } from "src/lib/server/firebase-admin";
import { handleBenchlingWebhook } from "src/lib/server/sync";
import { EBM_SAMPLE_CONFIG } from "src/types/sync";

// Benchling webhook signature header name
const BENCHLING_SIGNATURE_HEADER = "X-Benchling-Signature";

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

/**
 * Verify Benchling webhook signature (optional but recommended)
 * In production, you should implement HMAC verification using your Benchling webhook secret
 */
function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  // This is a placeholder - implement actual HMAC verification
  // const crypto = require('crypto');
  // const expectedSignature = crypto
  //   .createHmac('sha256', secret)
  //   .update(payload)
  //   .digest('hex');
  // return signature === expectedSignature;
  return true; // For development - implement in production
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    // Optional: Verify admin authorization for webhook config
    const token = await decodeToken(req);
    // Comment out admin check for development if needed
    // if (!token?.uid || !(await isAdmin(token.uid))) {
    //   res.status(401).json({ error: "Not authorized" });
    //   return;
    // }

    // Get webhook payload
    const payload = req.body;
    
    // Verify signature (if configured)
    const signature = req.headers[BENCHLING_SIGNATURE_HEADER.toLowerCase()] as string;
    const webhookSecret = process.env.BENCHLING_WEBHOOK_SECRET;
    
    if (webhookSecret && signature) {
      const payloadString = JSON.stringify(payload);
      if (!verifyWebhookSignature(payloadString, signature, webhookSecret)) {
        res.status(401).json({ error: "Invalid webhook signature" });
        return;
      }
    }

    // Extract event information
    const { eventType, entityType, entityId, entityRegistryId, modifiedAt, schemaId } = payload;

    // Only process events for metagenomics samples (EBM samples)
    if (schemaId && schemaId !== EBM_SAMPLE_CONFIG.schemaId) {
      res.status(200).json({ 
        message: "Ignoring event - not a metagenomics sample",
        schemaId,
      });
      return;
    }

    // Only process custom entity events
    if (entityType !== "CustomEntity") {
      res.status(200).json({ 
        message: "Ignoring event - not a custom entity",
        entityType,
      });
      return;
    }

    // Only process EBM prefixed samples
    if (entityRegistryId && !entityRegistryId.startsWith(EBM_SAMPLE_CONFIG.idPrefix)) {
      res.status(200).json({ 
        message: "Ignoring event - not an EBM sample",
        entityRegistryId,
      });
      return;
    }

    // Process the webhook
    await handleBenchlingWebhook(
      eventType,
      entityId,
      entityRegistryId,
      modifiedAt
    );

    res.status(200).json({ 
      success: true,
      message: "Webhook processed successfully",
      eventType,
      entityRegistryId,
    });
  } catch (error: any) {
    console.error("Error processing Benchling webhook:", error);
    res.status(500).json({ 
      error: "Internal server error",
      message: error.message,
    });
  }
}

