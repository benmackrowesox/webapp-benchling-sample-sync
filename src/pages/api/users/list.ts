
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

interface UserListItem {
  id: string;
  email: string | null;
  firstName: string;
  lastName: string;
  company: string | null;
  isAdmin: boolean;
  awaitingApproval: boolean;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    res.status(400).send("Bad request");
    return;
  }

  try {
    const token = await decodeToken(req);
    if (!token?.uid || !(await isAdmin(token.uid))) {
      res.status(401).send("Not authorized.");
      return;
    }

    const allUsersSnapshot = await firebaseServerAdmin
      .firestore()
      .collection("/new_users")
      .get();

    const users: UserListItem[] = allUsersSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        email: data.email || null,
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        company: data.company || null,
        isAdmin: data.isAdmin || false,
        awaitingApproval: data.awaitingApproval ?? false,
      };
    });

    res.status(200).send(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).send("Unexpected error.");
  }
}

