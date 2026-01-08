import { NextApiRequest, NextApiResponse } from "next/types";
import {
  firebaseServerAdmin,
  getAllOrganisations,
  createOrganisation,
  getUserEmail,
} from "src/lib/server/firebase-admin";
import { isAdmin } from "src/lib/server/admin";
import { Organisation, CreateOrganisationRequest } from "src/types/organisation";

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
  res: NextApiResponse,
) {
  const token = await decodeToken(req);
  if (!token?.uid) {
    res.status(401).send("Not authenticated.");
    return;
  }

  // GET - List all organisations (admin only)
  if (req.method === "GET") {
    try {
      const isUserAdmin = await isAdmin(token.uid);
      if (!isUserAdmin) {
        res.status(403).send("Not authorized. Admin access required.");
        return;
      }

      const organisations = await getAllOrganisations();
      res.status(200).send(organisations);
    } catch (error) {
      console.error("Error fetching organisations:", error);
      res.status(500).send("Unexpected error.");
    }
    return;
  }

  // POST - Create new organisation (admin only)
  if (req.method === "POST") {
    try {
      const isUserAdmin = await isAdmin(token.uid);
      if (!isUserAdmin) {
        res.status(403).send("Not authorized. Admin access required.");
        return;
      }

      const request: CreateOrganisationRequest = req.body;

      if (!request.name || request.name.trim().length === 0) {
        res.status(400).send("Organisation name is required.");
        return;
      }

      const userEmail = await getUserEmail(token.uid);
      if (!userEmail) {
        res.status(400).send("User email not found.");
        return;
      }

      const organisationId = await createOrganisation(
        request.name,
        token.uid,
        request.description,
      );

      // Add the creator as owner
      await firebaseServerAdmin
        .firestore()
        .doc(`/organisations/${organisationId}`)
        .update({
          users: [
            {
              userId: token.uid,
              email: userEmail,
              name: userEmail,
              role: "owner",
              joinedAt: Date.now(),
            },
          ],
        });

      res.status(200).send({
        id: organisationId,
        name: request.name,
        message: "Organisation created successfully.",
      });
    } catch (error) {
      console.error("Error creating organisation:", error);
      res.status(500).send("Unexpected error.");
    }
    return;
  }

  res.status(400).send("Bad request");
}

