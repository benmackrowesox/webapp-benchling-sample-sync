import { NextApiRequest, NextApiResponse } from "next/types";
import { firebaseServerAdmin } from "src/lib/server/firebase-admin";

async function isAuthorizedUser(
  userId: string | undefined,
  req: NextApiRequest
) {
  const idToken = req.headers.authorization;

  if (!userId || !idToken) {
    return null;
  }

  const decodedToken = await firebaseServerAdmin.auth().verifyIdToken(idToken);

  return decodedToken.uid == userId || (await isAdmin(decodedToken.uid));
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
  const path = req.query.userId;
  const userId = Array.isArray(path) ? path[0] : path;

  if (!userId || !(await isAuthorizedUser(userId, req))) {
    res.status(401).send({ error: "Not authorized." });
    return;
  }

  const body = req.body;

  if (req.method == "GET") {
    return firebaseServerAdmin
      .firestore()
      .doc(`/new_users/${userId}/docs/new-user-questionnaire`)
      .get()
      .then((d) => {
        res.status(200).send(d.data());
      })
      .catch((_) => {
        res.status(404).send("Not found.");
      });
  }

  if (req.method != "POST") {
    res.status(400).send("Bad request");
    return;
  }

  const newUserQuestionnaire = firebaseServerAdmin
    .firestore()
    .doc(`/new_users/${userId}/docs/new-user-questionnaire`);

  await newUserQuestionnaire.set(body);
  res.status(200).send("Ok");
}
