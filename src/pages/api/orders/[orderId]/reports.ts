import { NextApiRequest, NextApiResponse } from "next/types";
import { firebaseServerAdmin } from "src/lib/server/firebase-admin";
import { NewOrder } from "src/types/order";

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

function deleteReport(filename: string, existingReports?: any[]) {
  const idx = existingReports?.findIndex((r) => r.filename == filename);

  if (!existingReports || !idx || idx == -1) {
    return [];
  }
  existingReports.splice(idx, 1);
  return existingReports;
}

function addReport(
  filename: string,
  newReportUrl: string,
  existingReports?: any[]
) {
  if (!existingReports) {
    existingReports = [];
  }
  existingReports.push({
    filename: filename,
    downloadUrl: newReportUrl,
  });
  return existingReports;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const path = req.query.orderId;
  const orderId = Array.isArray(path) ? path[0] : path;
  const newReportUrl = req.body.downloadUrl;
  const filename =
    req.method == "POST" ? req.body.filename : req.query.filename;

  if (!orderId || (req.method != "POST" && req.method != "DELETE")) {
    res.status(400).send("Bad request");
    return;
  }

  if (
    (req.method == "POST" && (!newReportUrl || !filename)) ||
    (req.method == "DELETE" && !filename)
  ) {
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

    if (req.method == "DELETE") {
      updatedOrder.orderReports = deleteReport(
        filename,
        updatedOrder.orderReports
      );
    } else if (req.method == "POST") {
      updatedOrder.orderReports = addReport(
        filename,
        newReportUrl,
        updatedOrder.orderReports
      );
    }

    await orderDocRef.update({
      orderReports: updatedOrder.orderReports,
    });

    res.status(200).send("Ok");
  } catch (error) {
    console.error(JSON.stringify(error));
    res.status(500).send("Unexpected error.");
  }
}
