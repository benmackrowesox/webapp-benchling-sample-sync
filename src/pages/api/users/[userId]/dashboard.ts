import { NextApiRequest, NextApiResponse } from "next/types";
import { firebaseServerAdmin } from "src/lib/server/firebase-admin";
import { NewOrder } from "src/types/order";

async function isAuthorizedUser(userDoc: any, req: NextApiRequest) {
  const idToken = req.headers.authorization;

  if (!idToken) {
    return false;
  }

  const decodedToken = await firebaseServerAdmin.auth().verifyIdToken(idToken);

  return decodedToken.uid == userDoc.id || (await isAdmin(userDoc));
}

function toSampleCounts(order: NewOrder) {
  if (
    order.status != "kit-arrived" ||
    (order.orderedSamples?.length ?? 0) == 0
  ) {
    return {};
  }

  const totalSampleCount = order.orderedSamples!.length;
  const submittedSamples = order.submittedSamples ?? [];
  const counts: Record<string, number> = {
    ["returned"]: submittedSamples.filter((s) => s.status == "sample-returned")
      .length,
    ["processing"]: submittedSamples.filter((s) => s.status == "processing")
      .length,
    ["complete"]: submittedSamples.filter((s) => s.status == "complete").length,
  };
  counts.reviewing =
    totalSampleCount - counts.returned - counts.processing - counts.complete;

  return counts;
}

async function isAdmin(userDoc: any): Promise<boolean> {
  return userDoc.data()?.isAdmin ?? false;
}

async function getUserDoc(uid?: string) {
  if (!uid) {
    return undefined;
  }
  return await firebaseServerAdmin.firestore().doc(`/new_users/${uid}`).get();
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const path = req.query.userId;
  const userId = Array.isArray(path) ? path[0] : path;

  const userDoc = await getUserDoc(userId);

  if (!userDoc || !userDoc.exists || !isAuthorizedUser(userDoc, req)) {
    res.status(401).send({ error: "Not authorized." });
    return;
  }

  if (req.method != "GET") {
    res.status(400).send("Bad request");
    return;
  }

  const docs = await firebaseServerAdmin
    .firestore()
    .collection("new_orders")
    .where("userId", "==", userId)
    .get();

  const counts = docs.docs.map((d) => toSampleCounts(d.data() as NewOrder));
  const totals = counts.reduce(
    (acc, n) => ({
      reviewing: (acc.reviewing ?? 0) + (n.reviewing ?? 0),
      returned: (acc.returned ?? 0) + (n.returned ?? 0),
      processing: (acc.processing ?? 0) + (n.processing ?? 0),
      complete: (acc.complete ?? 0) + (n.complete ?? 0),
    }),
    { reviewing: 0, returned: 0, processing: 0, complete: 0 },
  );

  const orders = docs.docs.map((d) => d.data() as NewOrder);

  res.status(200).send({
    friendlyName: userDoc.data()!.firstName,
    tileData: totals,
    orders: orders,
  });
}
