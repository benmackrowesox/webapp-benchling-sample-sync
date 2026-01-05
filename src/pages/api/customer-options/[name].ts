import { NextApiRequest, NextApiResponse } from "next/types";
import firebaseAdmin from "firebase-admin";

import { firebaseServerAdmin } from "src/lib/server/firebase-admin";
import { isAdmin, decodeToken } from "src/lib/server/admin";

// strips characters that aren't A-Z, a-z, or hyphen.
// most importantly, this disallows / and .., and anything else I haven't thought of
// that might give access to unexpected documents
function sanitizeDocName(optionsDocName: string) {
  return optionsDocName.replace(/[^-a-zA-Z]/g, "");
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const optionsDocName = req.query.name;

  if (typeof optionsDocName !== "string") {
    res.status(400).send("Bad request");
    return;
  }

  try {
    // note: unsecured endpoint. Sanitise all input!
    const sanitizedDocName = sanitizeDocName(optionsDocName);

    const token = await decodeToken(req);

    if (req.method == "POST") {
      if (!token?.uid || !(await isAdmin(token.uid))) {
        res.status(401).send("Not authorized.");
        return;
      }

      const docRef = firebaseServerAdmin
        .firestore()
        .doc(`/customer-options/${sanitizedDocName}`);
      await docRef.update({
        hostSpecies: firebaseAdmin.firestore.FieldValue.arrayUnion(
          req.body.hostSpecies,
        ),
      });

      res.status(200).send("Ok");
    }

    if (req.method == "DELETE") {
      if (!token?.uid || !(await isAdmin(token.uid))) {
        res.status(401).send("Not authorized.");
        return;
      }
      const docRef = firebaseServerAdmin
        .firestore()
        .doc(`/customer-options/${sanitizedDocName}`);

      await docRef.update({
        hostSpecies: firebaseAdmin.firestore.FieldValue.arrayRemove(
          req.query.hostSpecies,
        ),
      });

      res.status(200).send("Ok");
    }

    if (req.method != "GET") {
      res.status(400).send("Bad request");
      return;
    }

    const customerOptionsDoc = await firebaseServerAdmin
      .firestore()
      .doc(`/customer-options/${sanitizedDocName}`)
      .get();

    const data = customerOptionsDoc.data();

    if (!data) {
      return res.status(404).send(`${optionsDocName} not found.`);
    }

    res.status(200).send(data);
  } catch (err) {
    res.status(400).send("Bad request");
  }
}
