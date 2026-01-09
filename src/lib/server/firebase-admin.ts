"use server";

import { getApps } from "firebase-admin/app";
import firebaseAdmin from "firebase-admin";
import { firebaseAdminConfig } from "src/private-config";
import { firestoreUser } from "src/types/user";
import { MetadataField } from "src/types/order";
import { Organisation } from "src/types/organisation";

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
        email: data.email,
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
        organisationId: data.organisationId,
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

// Organisation helper functions
export const getOrganisation = async (
  organisationId: string,
): Promise<Organisation | null> => {
  const docRef = firebaseServerAdmin
    .firestore()
    .doc(`organisations/${organisationId}`);
  
  const docSnap = await docRef.get();
  
  if (!docSnap.exists) {
    return null;
  }
  
  return {
    ...docSnap.data(),
    id: docSnap.id,
  } as Organisation;
};

export const createOrganisation = async (
  name: string,
  createdBy: string,
  description?: string,
): Promise<string> => {
  const docRef = await firebaseServerAdmin
    .firestore()
    .collection("organisations")
    .add({
      name,
      description,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      createdBy,
      users: [],
      isActive: true,
    });
  
  return docRef.id;
};

export const addUserToOrganisation = async (
  organisationId: string,
  userId: string,
  email: string,
  role: "owner" | "admin" | "member" | "viewer" = "member",
): Promise<void> => {
  const org = await getOrganisation(organisationId);
  if (!org) {
    throw new Error("Organisation not found");
  }
  
  const newUser = {
    userId,
    email,
    name: email,
    role,
    joinedAt: Date.now(),
  };
  
  const updatedUsers = [...org.users, newUser];
  
  await firebaseServerAdmin
    .firestore()
    .doc(`organisations/${organisationId}`)
    .update({
      users: updatedUsers,
      updatedAt: Date.now(),
    });
  
  // Also update the user's profile with their organisationId
  await firebaseServerAdmin
    .firestore()
    .doc(`new_users/${userId}`)
    .set({
      organisationId: organisationId,
    }, { merge: true });
};

export const removeUserFromOrganisation = async (
  organisationId: string,
  userId: string,
): Promise<void> => {
  const org = await getOrganisation(organisationId);
  if (!org) {
    throw new Error("Organisation not found");
  }
  
  const updatedUsers = org.users.filter((u) => u.userId !== userId);
  
  await firebaseServerAdmin
    .firestore()
    .doc(`organisations/${organisationId}`)
    .update({
      users: updatedUsers,
      updatedAt: Date.now(),
    });
};

export const getUserOrganisation = async (
  userId: string,
): Promise<Organisation | null> => {
  const snapshot = await firebaseServerAdmin
    .firestore()
    .collection("organisations")
    .where("users.userId", "==", userId)
    .limit(1)
    .get();
  
  if (snapshot.empty) {
    return null;
  }
  
  const doc = snapshot.docs[0];
  return {
    ...doc.data(),
    id: doc.id,
  } as Organisation;
};

export const getUserOrganisationId = async (
  userId: string,
): Promise<string | null> => {
  const org = await getUserOrganisation(userId);
  return org?.id ?? null;
};

export const isUserInOrganisation = async (
  organisationId: string,
  userId: string,
): Promise<boolean> => {
  const org = await getOrganisation(organisationId);
  if (!org) {
    return false;
  }
  
  return org.users.some((u) => u.userId === userId);
};

export const getAllOrganisations = async (): Promise<Organisation[]> => {
  const snapshot = await firebaseServerAdmin
    .firestore()
    .collection("organisations")
    .orderBy("createdAt", "desc")
    .get();
  
  return snapshot.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
  })) as Organisation[];
};

export const updateOrganisation = async (
  organisationId: string,
  updates: Partial<Organisation>,
): Promise<void> => {
  await firebaseServerAdmin
    .firestore()
    .doc(`organisations/${organisationId}`)
    .update({
      ...updates,
      updatedAt: Date.now(),
    });
};
