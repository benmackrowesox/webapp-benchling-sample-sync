import { NextApiRequest, NextApiResponse } from "next/types";
import { availableMoves } from "src/lib/client/stateMachine";
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

function customerCanSelfUpdate(
  oldStatus: OrderStatus,
  newStatus: OrderStatus
): boolean {
  const move = availableMoves[oldStatus];
  const transition = move?.filter((m) => m.newState == newStatus)[0];
  return transition && !transition.admin;
}

async function customerCanUpdateDocument(
  orderDocRef: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>,
  uid: string,
  newStatus: OrderStatus
): Promise<boolean> {
  const orderDoc = await orderDocRef.get();
  return (
    orderDoc.data()?.userId == uid &&
    customerCanSelfUpdate(orderDoc.data()?.status, newStatus)
  );
}

async function update(
  orderDocRef: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>,
  newStatus: OrderStatus
) {
  if (newStatus == "kit-sent") {
    await orderDocRef.update({
      status: newStatus,
      dispatchedAt: new Date().getTime(),
    });
  } else {
    await orderDocRef.update({ status: newStatus });
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const path = req.query.orderId;
  const orderId = Array.isArray(path) ? path[0] : path;
  const newStatus = req.body.status;

  if (req.method != "PATCH" || !orderId || !newStatus) {
    res.status(400).send("Bad request");
    return;
  }

  try {
    const token = await decodeToken(req);
    if (!token?.uid) {
      res.status(401).send("Not authorized.");
      return;
    }

    const orderDocRef = firebaseServerAdmin
      .firestore()
      .doc(`/new_orders/${orderId}`);

    if (await isAdmin(token.uid)) {
      await update(orderDocRef, newStatus);
    } else {
      if (!customerCanUpdateDocument(orderDocRef, token.uid, newStatus)) {
        res.status(401).send("Not authorized.");
        return;
      } else {
        await update(orderDocRef, newStatus);
      }
    }
    res.status(200).send("Ok");
  } catch (error) {
    console.error(error);
    res.status(500).send("Unexpected error.");
  }
}
