import { NextApiRequest, NextApiResponse } from "next/types";
import { firebaseServerAdmin } from "src/lib/server/firebase-admin";
import { OrderStatus } from "src/types/order";

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
  const path = req.query.orderId;
  const orderId = Array.isArray(path) ? path[0] : path;
  const updatedMetadata = req.body;

  if (req.method != "PATCH" || !orderId || !Array.isArray(updatedMetadata)) {
    res.status(400).send("Bad request");
    return;
  }

  try {
    const token = await decodeToken(req);
    if (!token?.uid || !(await isAdmin(token.uid))) {
      res.status(401).send("Not authorized.");
      return;
    }

    const orderDocRef = firebaseServerAdmin
      .firestore()
      .doc(`/new_orders/${orderId}`);

    await orderDocRef.update({
      metadataFields: updatedMetadata,
    });

    res.status(200).send("Ok");
  } catch (error) {
    console.error(JSON.stringify(error));
    res.status(500).send("Unexpected error.");
  }
}
