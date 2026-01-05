import { NextApiRequest, NextApiResponse } from "next/types";
import {
  firebaseServerAdmin,
  getAllMetadataFields,
} from "src/lib/server/firebase-admin";

async function decodeToken(req: NextApiRequest) {
  const idToken = req.headers.authorization;

  if (!idToken) {
    return null;
  }

  const decodedToken = await firebaseServerAdmin.auth().verifyIdToken(idToken);

  return decodedToken;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method != "GET") {
    res.status(400).send("Bad request");
    return;
  }

  const metadataFields = await getAllMetadataFields();
  res.status(200).send(metadataFields);
}
