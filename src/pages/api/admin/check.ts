import { NextApiRequest, NextApiResponse } from "next/types";
import { firebaseServerAdmin } from "src/lib/server/firebase-admin";

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
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const token = await decodeToken(req);
    
    if (!token?.uid) {
      res.status(401).json({ isAdmin: false, error: "Not authenticated" });
      return;
    }

    const adminStatus = await isAdmin(token.uid);
    res.status(200).json({ isAdmin: adminStatus });
  } catch (error: any) {
    console.error("Error checking admin status:", error);
    res.status(500).json({ isAdmin: false, error: "Internal server error" });
  }
}

