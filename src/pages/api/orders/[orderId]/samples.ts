import { NextApiRequest, NextApiResponse } from "next/types";
import { firebaseServerAdmin } from "src/lib/server/firebase-admin";
import { OrderedSample, Sample, UnsubmittedSample } from "src/types/order";

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

function updateMakesSense(
  orderedSamples: OrderedSample[],
  samplesToSubmit: UnsubmittedSample[],
  alreadySubmittedSamples?: Sample[]
): boolean {
  const sampleIdsToSubmit = samplesToSubmit.map((s) => s.name);
  const updatesAreDistinct =
    sampleIdsToSubmit.length == [...new Set(sampleIdsToSubmit)].length;

  const allSamplesToSubmitWereOrdered =
    sampleIdsToSubmit
      .map((u) => orderedSamples.findIndex((os) => os.name == u))
      .findIndex((x) => x == -1) == -1;

  const allSamplesToSubmitNotAlreadySubmitted =
    !alreadySubmittedSamples ||
    sampleIdsToSubmit.every(
      (u) => alreadySubmittedSamples.findIndex((os) => os.name == u) == -1
    );

  if (!updatesAreDistinct) {
    console.error(
      `Not all updates are distinct: ${sampleIdsToSubmit.join(", ")}`
    );
    return false;
  }

  if (!allSamplesToSubmitWereOrdered) {
    console.error(
      `Not all samples belong to order: ${sampleIdsToSubmit.join(", ")}`
    );
    return false;
  }

  if (!allSamplesToSubmitNotAlreadySubmitted) {
    console.error(
      `Some samples already submitted: ${sampleIdsToSubmit.join(", ")}`
    );
    return false;
  }

  // order status is correct
  // all updates are distinct
  return true;
}

async function customerCanUpdateDocument(
  orderDocRef: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>,
  uid: string,
  unsubmittedSamples: UnsubmittedSample[]
): Promise<boolean> {
  const orderDocData = (await orderDocRef.get()).data();
  const orderedSamples: OrderedSample[] = orderDocData?.orderedSamples;

  return (
    orderDocData?.userId == uid &&
    updateMakesSense(
      orderedSamples,
      unsubmittedSamples,
      orderDocData?.submittedSamples
    )
  );
}

async function update(
  orderDocRef: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>,
  unsubmittedSamples: UnsubmittedSample[],
  submittedSamples?: Sample[]
) {
  if (submittedSamples) {
    await orderDocRef.update({
      unsubmittedSamples: unsubmittedSamples,
      submittedSamples: submittedSamples,
    });
  } else {
    await orderDocRef.update({ unsubmittedSamples: unsubmittedSamples });
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const path = req.query.orderId;
  const orderId = Array.isArray(path) ? path[0] : path;
  const unsubmittedSamples: UnsubmittedSample[] = req.body.unsubmittedSamples;
  const submittedSamples: Sample[] = req.body.submittedSamples;

  if (req.method != "PATCH" || !orderId || !unsubmittedSamples) {
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
      await update(orderDocRef, unsubmittedSamples, submittedSamples);
    } else {
      if (
        !(await customerCanUpdateDocument(
          orderDocRef,
          token.uid,
          unsubmittedSamples
        ))
      ) {
        res.status(401).send("Not authorized.");
        return;
      } else {
        await update(orderDocRef, unsubmittedSamples); // not updating submittedSamples: only admin can change samples after submitted
      }
    }
    res.status(200).send("Ok");
  } catch (error) {
    console.error(error);
    res.status(500).send("Unexpected error.");
  }
}
