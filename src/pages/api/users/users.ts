import { NextApiRequest, NextApiResponse } from "next/types";
import {
  firebaseServerAdmin,
  getUserEmail,
} from "src/lib/server/firebase-admin";
import { DocumentData } from "firebase/firestore";

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
  if (req.method != "GET") {
    res.status(400).send("Bad request");
    return;
  }

  try {
    const token = await decodeToken(req);
    if (!token?.uid || !(await isAdmin(token.uid))) {
      res.status(401).send("Not authorized.");
      return;
    }

    const allUsers = await firebaseServerAdmin
      .firestore()
      .collection("/new_users")
      .get();

    const ordersSnapshot = await firebaseServerAdmin
      .firestore()
      .collection("/new_orders")
      .get();

    let orders: DocumentData[] = [];
    ordersSnapshot.forEach((doc) => {
      orders.push(doc.data());
    });

    const usersInfo = await Promise.all(
      allUsers.docs.map(async (d, i) => {
        const data = d.data();

        const userId = d.ref.id;
        let email = null;
        try {
          email = await getUserEmail(userId);
        } catch (error) {
          console.log(error);
        }

        const userOrders = orders.filter((order) => order.userId === d.ref.id);

        return {
          id: d.ref.id,
          name: `${data.firstName} ${data.lastName}`,
          email: email,
          dateRegistered: new Date(data.dateRegistered),
          company: data.company,
          role: data.role,
          contactNo: data.contactNo,
          isAdmin: data.isAdmin,
          awaitingApproval: data.awaitingApproval,
          numberOfOrders: userOrders.length,
          address: [
            data.line1,
            data.line2,
            data.townCity,
            data.county,
            data.postcode,
          ]
            .filter((chunk) => chunk?.trim().length > 0)
            .join(", "),
        };
      }),
    );
    res.status(200).send(usersInfo);
  } catch (error) {
    console.error(JSON.stringify(error));
    res.status(500).send("Unexpected error.");
  }
}
