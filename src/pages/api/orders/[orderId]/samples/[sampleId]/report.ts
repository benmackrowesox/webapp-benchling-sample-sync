import { NextApiRequest, NextApiResponse } from "next/types";
import { firebaseServerAdmin } from "src/lib/server/firebase-admin";
import { NewOrder, OrderStatus } from "src/types/order";

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

async function update(
  orderDocRef: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>,
  newStatus: OrderStatus
) {
  await orderDocRef.update({ status: newStatus });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const path = req.query.orderId;
  const path2 = req.query.sampleId;
  const orderId = Array.isArray(path) ? path[0] : path;
  const sampleId = Array.isArray(path2) ? path2[0] : path2;
  const newReportUrl = req.body.reportUrl;

  if (req.method != "PATCH" || !orderId || !sampleId) {
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

    const order = (await orderDocRef.get()).data();
    if (!order) {
      res.status(404).send("Order does not exist");
      return;
    }

    const updatedOrder = order as NewOrder;
    const updatedSample = updatedOrder.submittedSamples?.find(
      (s) => s.name == sampleId
    );
    if (!updatedSample) {
      res.status(404).send("Sample does not exist on order.");
      return;
    }
    updatedSample.reportUrl = newReportUrl ?? null;
    updatedSample.status = "complete";

    await orderDocRef.update({
      submittedSamples: updatedOrder.submittedSamples,
    });

    res.status(200).send("Ok");
  } catch (error) {
    console.error(JSON.stringify(error));
    res.status(500).send("Unexpected error.");
  }
}
