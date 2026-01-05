"use server";

import { getApps } from "firebase-admin/app";
import firebaseAdmin from "firebase-admin";
import { firebaseAdminConfig } from "src/private-config";
import { firestoreUser } from "src/types/user";
import { MetadataField } from "src/types/order";

const alreadyCreatedApps = getApps();

export const firebaseServerAdmin =
  alreadyCreatedApps.length === 0
    ? firebaseAdmin.initializeApp({
        credential: firebaseAdmin.credential.cert(firebaseAdminConfig),
      })
    : (alreadyCreatedApps[0] as firebaseAdmin.app.App);

export const getUserEmail = async (userId?: string): Promise<string | null> => {
  if (!userId) {
    return null;
  }

  const userRecord = await firebaseServerAdmin.auth().getUser(userId);
  if (!userRecord?.email) {
    return null;
  }

  return userRecord.email;
};

export const getUserDetails = async (
  userId?: string,
): Promise<firestoreUser> => {
  if (!userId) {
    return Promise.reject("No user provided");
  }
  const docRef = firebaseServerAdmin.firestore().doc(`new_users/${userId}`);
  return docRef
    .get()
    .then((docSnap) => {
      const data = docSnap.data();
      if (!data) {
        throw "";
      }
      const user: firestoreUser = {
        firstName: data.firstName,
        lastName: data.lastName,
        postcode: data.postcode,
        line1: data.line1,
        line2: data.line2,
        townCity: data.townCity,
        county: data.county,
        country: data.country,
        isAdmin: data.isAdmin,
        awaitingApproval: data.awaitingApproval ?? false,
        company: data.company,
        contactNo: data.contactNo,
        role: data.role,
        dateRegistered: data.dateRegistered,
      };
      return user;
    })
    .catch((error) => Promise.reject("No such user found."));
};

// could certainly cache these...
export const getAllMetadataFields = async (): Promise<MetadataField[]> => {
  const collection = await firebaseServerAdmin
    .firestore()
    .collection(`metadata-fields`)
    .get();

  const fields = collection.docs
    .map((d) => ({ name: d.ref.id.split("/").pop() ?? "", data: d.data() }))
    .map<MetadataField>(({ name, data }) => ({
      name: name,
      displayName: data.displayName,
      questionnaireResponseAlias: data.questionnaireResponseAlias,
      type: data.type,
      units: data.units,
      valueOptions: data.valueOptions,
      gridColumnWidth: data.gridColumnWidth,
      helpText: data.helpText,
    }));

  return fields;
};
