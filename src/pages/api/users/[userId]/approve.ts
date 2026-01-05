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
  const path = req.query.userId;
  const userId = Array.isArray(path) ? path[0] : path;

  if (req.method != "POST" || !userId) {
    res.status(400).send("Bad request");
    return;
  }

  try {
    const token = await decodeToken(req);
    if (!token?.uid || !(await isAdmin(token.uid))) {
      res.status(401).send("Not authorized.");
      return;
    }

    const userDocRef = firebaseServerAdmin
      .firestore()
      .doc(`/new_users/${userId}`);

    const user = (await userDocRef.get()).data();
    if (!user) {
      res.status(404).send("User does not exist");
      return;
    }

    await userDocRef.update({
      awaitingApproval: null,
    });

    res.status(200).send("Ok");
  } catch (error) {
    console.error(JSON.stringify(error));
    res.status(500).send("Unexpected error.");
  }
}
