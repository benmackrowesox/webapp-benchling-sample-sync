import { NextApiRequest, NextApiResponse } from "next/types";
import {
  startCreatingOrderRequest,
  waitForTasksAndPopulateSamplesOnOrder,
} from "src/lib/server/benchling";
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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const path = req.query.orderId;
  const orderId = Array.isArray(path) ? path[0] : path;

  if (req.method != "POST" || !orderId) {
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

    const taskIds =
      order.taskIds ?? (await startCreatingOrderRequest(order as NewOrder));

    console.log(taskIds);
    // save on order, in case request times out while waiting for tasks to complete.
    // then, doesn't try to recreate order on subsequent calls.
    await orderDocRef.update({ taskIds: taskIds });

    const orderWithSamples = await waitForTasksAndPopulateSamplesOnOrder(
      taskIds,
      order as NewOrder,
    );

    const newStatus: OrderStatus = "approved";

    await orderDocRef.update({
      status: newStatus,
      orderedSamples: orderWithSamples.orderedSamples,
    });

    res.status(200).send("Ok");
  } catch (error) {
    console.error(JSON.stringify(error));
    if (error.status && error.status !== "SUCCEEDED") {
      res
        .status(500)
        .send(
          "Benchling task is not yet fully setup, please wait 1 min before trying to Approve again.",
        );
      return;
    }
    res.status(500).send("Unexpected error.");
  }
}
