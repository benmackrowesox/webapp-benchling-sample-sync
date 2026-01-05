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

    const usersAwaitingApproval = await firebaseServerAdmin
      .firestore()
      .collection("/new_users")
      .where("awaitingApproval", "==", true)
      .get();

    const userInfo = usersAwaitingApproval.docs.map((d) => {
      const data = d.data();
      return {
        id: d.ref.id,
        name: `${data.firstName} ${data.lastName}`,
        dateRegistered: new Date(data.dateRegistered),
        company: data.company,
        role: data.role,
        contactNo: data.contactNo,
      };
    });

    res.status(200).send(userInfo);
  } catch (error) {
    console.error(JSON.stringify(error));
    res.status(500).send("Unexpected error.");
  }
}
