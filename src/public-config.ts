
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "demo-api-key",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "demo-app-id",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "demo-project.firebaseapp.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "demo-project",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "demo-project.appspot.com",
};


export const gtmConfig = {
  containerId: process.env.NEXT_PUBLIC_GTM_CONTAINER_ID || "GTM-DEMO",
};

export const emailJSConfig = {
  publicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || "demo-emailjs-key",
};

export const calendlyConfig = {
  calendlyUrl: process.env.NEXT_PUBLIC_CALENDLY_URL || "https://calendly.com/demo",
};
