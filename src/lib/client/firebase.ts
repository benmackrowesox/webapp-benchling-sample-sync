import { initializeApp } from "firebase/app";
import { doc, getDoc, getFirestore, setDoc } from "firebase/firestore";
import {
  deleteObject,
  getDownloadURL,
  getStorage,
  listAll,
  ref,
  uploadBytes,
  uploadString,
} from "firebase/storage";
import { firebaseConfig } from "../../public-config";
import { v4 as uuidv4 } from "uuid";
import { firestoreUser } from "src/types/user";

export const firebaseApp = initializeApp(firebaseConfig);
export const db = getFirestore(firebaseApp);
export const storage = getStorage(firebaseApp);

// these exist under `new_user/userId`
export const USER_FOLDERS = {
  ACCOUNT_DOCUMENTS: "account_documents",
  ORDER_REPORTS: (orderId: string) => `${orderId}/reports`,
  OLD_ORDER_REPORTS: (orderId: string) => `${orderId}`, // legacy reports
  ORDER_LEGAL_DOCUMENTS: (orderId: string) => `${orderId}/legal_documents`,
  ORDER_FINANCIAL_DOCUMENTS: (orderId: string) =>
    `${orderId}/financial_documents`,
  ORDER_ADDITIONAL_INFORMATION: (orderId: string) =>
    `${orderId}/additional_user_documents`,
};

export const getUserDetails = async (
  userId?: string,
): Promise<firestoreUser> => {
  if (!userId) {
    return Promise.reject("No user provided");
  }
  const docRef = doc(db, "new_users", userId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
      firstName: data.firstName,
      lastName: data.lastName,
      postcode: data.postcode,
      line1: data.line1,
      line2: data.line2,
      townCity: data.townCity,
      county: data.county,
      country: data.country,
      company: data.company,
      role: data.role,
      isAdmin: data.isAdmin,
      awaitingApproval: data.awaitingApproval,
      dateRegistered: data.dateRegistered,
      contactNo: data.contactNo,
    };
  } else {
    return Promise.reject("No such user found.");
  }
};

export const updateUser = async (
  userId: string,
  update: Partial<firestoreUser>,
): Promise<void> => {
  const cityRef = doc(db, "new_users", userId);
  setDoc(cityRef, update, { merge: true });
};

export async function getImage(location: string) {
  const ImageURL = await getDownloadURL(ref(storage, location));
  return await ImageURL;
}

const getMetadataByFileType = (filename: string) => {
  const isHTML = filename?.toLowerCase()?.endsWith("html");
  const contentType = isHTML ? "text/html" : "application/pdf";
  return { contentType: contentType };
};

export async function uploadPDFToUserFolder(
  userId: string,
  filename: string,
  file: File,
): Promise<string> {
  const path = `new_users/${userId}/${filename}`;
  const storageRef = ref(storage, path);
  const metadata = getMetadataByFileType(filename);
  const snapshot = await uploadBytes(storageRef, file, metadata);
  return getDownloadURL(storageRef);
}

export async function downloadFile(path: string) {
  function saveBlob(blob: any, fileName: string) {
    var a = document.createElement("a");
    a.href = window.URL.createObjectURL(blob);
    a.download = fileName;
    a.dispatchEvent(new MouseEvent("click"));
  }
  const storageRef = ref(storage, path);
  getDownloadURL(storageRef)
    .then((url) => {
      const xhr = new XMLHttpRequest();
      xhr.responseType = "blob";
      xhr.onload = (event) => {
        const blob = xhr.response;
        saveBlob(blob, storageRef.name);
      };
      xhr.open("GET", url);
      xhr.send();
    })
    .catch((error) => {
      alert(error);
    });
}

// admin only - firebase cloud storage security permissions
export async function deleteFile(url: string): Promise<void> {
  const storageRef = ref(storage, url);
  return await deleteObject(storageRef);
}

export async function uploadBase64ToPublicFolder(base64: string) {
  // this is because the file requires includes metadata the the firebase storage does not want
  const substring = base64.split(",").pop() ?? "";
  const id = `public/${uuidv4()}.png`;
  const storageRef = ref(storage, id);
  const metadata = {
    contentType: "image/png",
  };
  await uploadString(storageRef, substring, "base64", metadata);
  return getDownloadURL(storageRef);
}

export async function uploadBase64PDFToPublicFolder(base64: string) {
  // this is because the file requires includes metadata the the firebase storage does not want
  const substring = base64.split(",").pop() ?? "";
  const id = `public/${uuidv4()}.pdf`;
  const storageRef = ref(storage, id);
  const metadata = {
    contentType: "application/pdf",
  };
  await uploadString(storageRef, substring, "base64", metadata);
  return getDownloadURL(storageRef);
}

export const getFilesInFolder = async (folderPath: string) => {
  const folderRef = ref(storage, folderPath);
  const fileList = [];

  try {
    const res = await listAll(folderRef);

    for (const itemRef of res.items) {
      const url = await getDownloadURL(itemRef);
      fileList.push({
        name: itemRef.name,
        url: url,
      });
    }

    return fileList;
  } catch (error) {
    console.error("Error listing files:", error);
    throw error;
  }
};
