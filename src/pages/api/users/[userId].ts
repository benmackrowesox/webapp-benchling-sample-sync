import { NextApiRequest, NextApiResponse } from "next/types";
import { firebaseServerAdmin } from "src/lib/server/firebase-admin";
import { firestoreUser } from "src/types/user";

async function isAuthorizedUser(
  userId: string | undefined,
  req: NextApiRequest
) {
  const idToken = req.headers.authorization;

  if (!userId || !idToken) {
    return null;
  }

  const decodedToken = await firebaseServerAdmin.auth().verifyIdToken(idToken);

  return decodedToken.uid == userId;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const path = req.query.userId;
  const userId = Array.isArray(path) ? path[0] : path;

  if (!userId || !(await isAuthorizedUser(userId, req))) {
    res.status(401).send({ error: "Not authorized." });
    return;
  }

  const body = req.body;

  if (req.method == "POST") {
    const newUser: firestoreUser = {
      firstName: body.firstName,
      lastName: body.lastName,
      company: body.company,
      role: body.role,
      contactNo: body.contactNo,
      isAdmin: false,
      awaitingApproval: true,
      dateRegistered: Date.now(),
    };

    const userDoc = firebaseServerAdmin.firestore().doc(`/new_users/${userId}`);
    await userDoc.create(newUser);
    res.status(200).send("Ok");
  } else if (req.method == "PATCH") {
    try {
      const userUpdate: any = {
        firstName: body.firstName,
        lastName: body.lastName,
        postcode: body.postcode,
        line1: body.line1,
        line2: body.line2,
        townCity: body.townCity,
        county: body.county,
        country: body.country,
        contactNo: body.contactNo,
      };

      for (let key in userUpdate) {
        if (userUpdate[key] === undefined) {
          delete userUpdate[key];
        }
      }

      const userDoc = firebaseServerAdmin
        .firestore()
        .doc(`/new_users/${userId}`);
      await userDoc.set(userUpdate, { merge: true });
      res.status(200).send("Ok");
    } catch (error) {
      res.status(400).send(error);
    }
  } else if (req.method == "DELETE") {
    res.status(400).send("Bad request");
  } else {
    res.status(400).send("Bad request");
  }
}
