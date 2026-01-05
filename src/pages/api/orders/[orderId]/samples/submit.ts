import _ from "lodash";
import { NextApiRequest, NextApiResponse } from "next/types";
import { updateSamples } from "src/lib/server/benchling";
import { firebaseServerAdmin } from "src/lib/server/firebase-admin";
import { NewOrder, Sample } from "src/types/order";

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

function customerCanUpdateDocument(orderDoc: NewOrder, uid: string): boolean {
  return orderDoc?.userId == uid;
}

async function submit(
  orderDocRef: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>,
  existingOrder: NewOrder,
  sampleIds: string[],
  resubmitIfAlreadySubmitted?: boolean
) {
  const [unsubmittedSamplesToSubmit, samplesToRemainUnsubmitted] = _.partition(
    existingOrder.unsubmittedSamples ?? [],
    (s) => sampleIds.find((id) => s.name == id)
  );

  const submittedSamplesToResubmit = resubmitIfAlreadySubmitted
    ? (existingOrder.submittedSamples ?? []).filter((s) =>
        sampleIds.find((id) => s.name == id)
      )
    : [];

  const samplesToSubmit = unsubmittedSamplesToSubmit.map<Sample>((s) => ({
    ...s,
    status: "sample-returned",
    lastUpdated: Date.now(),
  }));

  await updateSamples(existingOrder, [
    ...samplesToSubmit,
    ...submittedSamplesToResubmit,
  ]);

  const submittedSamples = (existingOrder.submittedSamples ?? []).concat(
    samplesToSubmit
  );

  await orderDocRef.update({
    unsubmittedSamples: samplesToRemainUnsubmitted,
    submittedSamples: submittedSamples,
  });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const path = req.query.orderId;
  const orderId = Array.isArray(path) ? path[0] : path;
  const sampleIds: string[] = req.body.sampleIds;

  if (req.method != "POST" || !orderId) {
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

    const orderDoc = (await orderDocRef.get()).data() as NewOrder;

    if (await isAdmin(token.uid)) {
      await submit(orderDocRef, orderDoc, sampleIds, true);
    } else {
      if (!customerCanUpdateDocument(orderDoc, token.uid)) {
        res.status(401).send("Not authorized.");
        return;
      } else {
        await submit(orderDocRef, orderDoc, sampleIds, false);
      }
    }
    res.status(200).send("Ok");
  } catch (error) {
    console.error(error);
    res.status(500).send("Unexpected error.");
  }
}
