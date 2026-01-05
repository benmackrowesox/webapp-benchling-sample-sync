import { NextApiRequest } from "next/types";
import { firebaseServerAdmin } from "src/lib/server/firebase-admin";

export async function isAdmin(uid: string): Promise<boolean> {
	const userDoc = await firebaseServerAdmin
		.firestore()
		.doc(`/new_users/${uid}`)
		.get();

	return userDoc.data()?.isAdmin ?? false;
}

export async function decodeToken(req: NextApiRequest) {
	const idToken = req.headers.authorization;

	if (!idToken) {
		return null;
	}

	const decodedToken = await firebaseServerAdmin.auth().verifyIdToken(idToken);

	return decodedToken;
}
