import { NextApiRequest, NextApiResponse } from "next/types";
import {
  firebaseServerAdmin,
  getAllMetadataFields,
  getUserDetails,
  getUserEmail,
} from "src/lib/server/firebase-admin";
import { isAdmin } from "src/lib/server/admin";
import {
  MetadataField,
  NewOrder,
  OrderRequest,
  OrderServiceItem,
} from "src/types/order";
import { firestoreUser } from "src/types/user";

async function decodeToken(req: NextApiRequest) {
  const idToken = req.headers.authorization;

  if (!idToken) {
    return null;
  }

  const decodedToken = await firebaseServerAdmin.auth().verifyIdToken(idToken);

  return decodedToken;
}

function orderId(userEmail: string) {
  function base36Encode(num: string) {
    var encodedChunks = [];

    // continue until we've processed the entire string.
    while (num.length) {
      // start somewhere.
      var splitPosition = 7;

      // try incrementally larger pieces until we get one that's exectly
      // 8 characters long.
      var encodedNum = "";
      do {
        // toString(36) converts decimal to base36.
        // add a leading 1 for safety, as any leading zeroes would otherwise
        // be lost.
        encodedNum = Number("1" + num.substr(0, ++splitPosition)).toString(36);
      } while (
        encodedNum.length < 8 &&
        splitPosition < num.length &&
        splitPosition < 15
      );

      // push our chunk onto the list of encoded chunks and remove these
      // digits from our string.
      encodedChunks.push(encodedNum);
      num = num.substr(splitPosition);
    }

    // return a big ol' string.
    return encodedChunks.join("");
  }
  function hashCode(s: string) {
    var hash = 0;
    for (var i = 0; i < s.length; i++) {
      var code = s.charCodeAt(i);
      hash = (hash << 5) - hash + code;
      hash = Math.abs(hash & hash); // convert to 32bit integer
    }
    return hash;
  }
  const emailHash = hashCode(userEmail);
  const secs = Math.round(new Date().getTime() / 1000) - 1707770000;
  const idRaw = "" + emailHash + secs;

  const id = base36Encode(idRaw).toUpperCase();
  return id;
}

function isRelevantToResponse(metadataField: MetadataField, response: string) {
  const isAlias = Array.isArray(metadataField.questionnaireResponseAlias)
    ? !!metadataField.questionnaireResponseAlias.find((x) => x == response)
    : metadataField.questionnaireResponseAlias == response;

  return (
    isAlias ||
    metadataField.name == response ||
    metadataField.displayName == response
  );
}

function buildMetadataFields(
  services: OrderServiceItem[],
  allMetadataFields: MetadataField[],
  answers: Record<string, { name: string; value: any }[]>,
): { name: string; displayName: string }[] {
  const alwaysPresentFields = [
    "sampleType",
    // "hostSpecies",
    "notes",
    "samplingDateTime",
  ];
  if (services.find((s) => s.service == "qPCR")) {
    alwaysPresentFields.push("qPCRPathogens");
  }
  if (services.find((s) => s.service == "GenomeSequencing")) {
    alwaysPresentFields.push("taxonomicID");
  }
  const answeredFields = Object.keys(answers)
    .flatMap((k) => answers[k])
    .filter((x) => x.value != undefined && (x.value as any) != false)
    .map((a) => a.name);

  const fields = [...alwaysPresentFields, ...answeredFields]
    .map((n) => allMetadataFields.find((x) => isRelevantToResponse(x, n)))
    .filter((m) => !!m)
    .map((m) => ({
      name: m!.name,
      displayName: m!.displayName,
    }));
  return fields;
}

function buildOrder(
  userEmail: string,
  userDetails: firestoreUser,
  orderRequest: OrderRequest,
  allMetadataFields: MetadataField[],
): NewOrder {
  const order: NewOrder = {
    status: "reviewing",
    id: orderId(userEmail),
    createdAt: new Date().getTime(),
    userId: orderRequest.userId,
    customer: {
      name: orderRequest.deliveryAddress.name,
      company: userDetails.company ?? "Unknown",
      role: userDetails.role ?? "Unknown",
      email: userEmail,
    },
    deliveryAddress: orderRequest.deliveryAddress,
    requestedServices: orderRequest.services,
    questionnaireAnswers: orderRequest.questionnaireAnswers,
    metadataFields: buildMetadataFields(
      orderRequest.services,
      allMetadataFields,
      orderRequest.questionnaireAnswers,
    ),
    title: orderRequest.title,
    proposal: orderRequest.proposal,
  };
  return order;
}

async function createOrderRequest(req: NextApiRequest, res: NextApiResponse) {
  const token = await decodeToken(req);
  if (!token?.email) {
    res.status(400).send({ error: "No email configured." });
    return;
  }
  const orderRequest: OrderRequest = req.body;
  const userId = orderRequest.userId;

  try {
    if (token.uid !== userId && !(await isAdmin(token.uid))) {
      res.status(401).send({ error: "Not authorized." });
    }

    const userDetails = await getUserDetails(userId);
    const userEmail = await getUserEmail(userId);
    if (!userEmail) {
      res.status(400).send({ error: "No email configured for user." });
      return;
    }

    const allMetadataFields = await getAllMetadataFields();

    const newOrder = buildOrder(
      userEmail,
      userDetails,
      orderRequest,
      allMetadataFields,
    );

    await firebaseServerAdmin
      .firestore()
      .doc(`/new_orders/${newOrder.id}`)
      .set(newOrder);

    res.status(200).send({
      orderNumber: newOrder.id,
      email: userEmail,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Unexpected error.");
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method == "POST") {
    return await createOrderRequest(req, res);
  }
  if (req.method != "GET") {
    res.status(400).send("Bad request");
    return;
  }

  const requestPageOptions = await firebaseServerAdmin
    .firestore()
    .doc(`/customer-options/request-page`)
    .get();

  res.status(200).send(requestPageOptions.data());
}
