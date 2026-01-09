import type { FC, ReactNode } from "react";
import { createContext, useEffect, useReducer } from "react";
import PropTypes from "prop-types";
import {
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendEmailVerification,
  updatePassword,
  confirmPasswordReset,
  applyActionCode,
  EmailAuthProvider,
} from "firebase/auth";
import { firebaseApp, getUserDetails } from "../lib/client/firebase";
import { reauthenticateWithCredential } from "firebase/auth";
import type {
  InternalUser,
  UserRegistrationFields,
  firestoreUser,
} from "../types/user";
import axios from "axios";

const auth = getAuth(firebaseApp);

interface State {
  isInitialized: boolean;
  isAuthenticated: boolean;
  user: InternalUser | null;
}

export interface AuthContextValue extends State {
  platform: "Firebase";
  createUser: (user: UserRegistrationFields) => Promise<any>;
  signInWithEmailAndPassword: (email: string, password: string) => Promise<any>;
  sendPasswordReset: (email: string) => Promise<any>;
  signInWithGoogle: () => Promise<any>;
  updateUserPassword: (
    existingPassword: string,
    newPassword: string
  ) => Promise<any>;
  handlePasswordReset: (newPassword: string, oobCode: string) => Promise<void>;
  handleVerifyEmail: (oobCode: string) => Promise<void>;
  sendVerificationEmail: () => Promise<any>;
  sendRequest: <T, S>(
    url: string,
    verb: "GET" | "POST" | "PATCH" | "DELETE",
    requestBody?: T
  ) => Promise<S>;
  logout: () => Promise<void>;
}

interface AuthProviderProps {
  children: ReactNode;
}

enum ActionType {
  AUTH_STATE_CHANGED = "AUTH_STATE_CHANGED",
}

type AuthStateChangedAction = {
  type: ActionType.AUTH_STATE_CHANGED;
  payload: {
    isAuthenticated: boolean;
    user: InternalUser | null;
  };
};

type Action = AuthStateChangedAction;

const initialState: State = {
  isAuthenticated: false,
  isInitialized: false,
  user: null,
};

const reducer = (state: State, action: Action): State => {
  if (action.type === "AUTH_STATE_CHANGED") {
    const { isAuthenticated, user } = action.payload;

    return {
      ...state,
      isAuthenticated,
      isInitialized: true,
      user,
    };
  }

  return state;
};

export const AuthContext = createContext<AuthContextValue>({
  ...initialState,
  platform: "Firebase",
  createUser: () => Promise.resolve(),
  signInWithEmailAndPassword: () => Promise.resolve(),
  signInWithGoogle: () => Promise.resolve(),
  sendPasswordReset: () => Promise.resolve(),
  handlePasswordReset: () => Promise.resolve(),
  handleVerifyEmail: () => Promise.resolve(),
  updateUserPassword: () => Promise.resolve(),
  sendVerificationEmail: () => Promise.resolve(),
  sendRequest: <T, S>(_: string, __: string = "POST", ___?: T) =>
    Promise.reject(),
  logout: () => Promise.resolve(),
});

export const AuthProvider: FC<AuthProviderProps> = (props) => {
  const { children } = props;
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(
    () =>
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          const userDetails = await getUserDetails(user.uid).catch((error) =>
            Promise.resolve(null)
          );

          const isApprovedUser =
            (userDetails && !userDetails.awaitingApproval) || false;

          dispatch({
            type: ActionType.AUTH_STATE_CHANGED,
            payload: {
              isAuthenticated: true,
              user: {
                id: user.uid,
                avatar: user.photoURL || "/static/esoxSwimming.jpg",
                email: user.email || "",
                isAdmin: userDetails?.isAdmin || false,
                isApproved: isApprovedUser,
                emailVerified: user.emailVerified || false,
              },
            },
          });
        } else {
          dispatch({
            type: ActionType.AUTH_STATE_CHANGED,
            payload: {
              isAuthenticated: false,
              user: null,
            },
          });
        }
      }),
    [dispatch]
  );

  const _signInWithEmailAndPassword = async (
    email: string,
    password: string
  ): Promise<void> => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signInWithGoogle = async (): Promise<void> => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const sendPasswordReset = async (email: string): Promise<void> => {
    await sendPasswordResetEmail(auth, email);
  };

  const handlePasswordReset = async (
    newPassword: string,
    oobCode: string
  ): Promise<void> => {
    await confirmPasswordReset(auth, oobCode, newPassword);
  };

  const updateUserPassword = async (
    existingPassword: string,
    newPassword: string
  ): Promise<void> => {
    if (!auth.currentUser) {
      return;
    }
    var credential = EmailAuthProvider.credential(
      auth.currentUser.email ?? "",
      existingPassword
    );

    try {
      await reauthenticateWithCredential(auth.currentUser, credential);
    } catch (e) {
      console.error(e);
      throw { message: "Existing password is incorrect." };
    }
    await updatePassword(auth.currentUser, newPassword);
  };

  const sendVerificationEmail = async (): Promise<void> => {
    if (!auth.currentUser) {
      return;
    }
    sendEmailVerification(auth.currentUser);
  };

  /**
   * Sends API request with current user's firebase auth token.
   */
  const sendRequest = async <T, S>(
    url: string,
    verb: "GET" | "POST" | "PATCH" | "DELETE" = "POST",
    request?: T
  ): Promise<S> => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      return Promise.reject("Not logged in.");
    }
    try {
      const idToken = await currentUser.getIdToken();
      const headers = {
        headers: {
          authorization: idToken,
        },
      };
      if (verb == "GET") {
        const response = await axios.get<S>(url, headers);
        return response.data;
      }
      if (verb == "POST") {
        const response = await axios.post<S>(url, request, headers);
        return response.data;
      } else if (verb == "PATCH") {
        const response = await axios.patch<S>(url, request, headers);
        return response.data;
      } else if (verb == "DELETE") {
        const response = await axios.delete(url, headers);
        return response.data;
      } else {
        return Promise.reject("Invalid HTTP verb");
      }
    } catch (error) {
      console.error("Error making the request:", error.message);
      return Promise.reject(error);
    }
  };

  const handleVerifyEmail = async (oobCode: string): Promise<void> => {
    await applyActionCode(auth, oobCode);
  };

  const _createUser = async (user: UserRegistrationFields): Promise<void> => {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      user.email,
      user.password
    );
    const firestoreUser: Partial<firestoreUser> = {
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      company: user.company,
      role: user.role,
      contactNo: user.contactNo,
    };
    const idToken = await userCredential.user.getIdToken();
    await axios.post(`/api/users/${userCredential.user.uid}`, firestoreUser, {
      headers: {
        authorization: idToken,
      },
    });
  };

  const logout = async (): Promise<void> => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        platform: "Firebase",
        createUser: _createUser,
        signInWithEmailAndPassword: _signInWithEmailAndPassword,
        sendPasswordReset,
        handlePasswordReset,
        handleVerifyEmail,
        signInWithGoogle,
        updateUserPassword,
        sendVerificationEmail,
        sendRequest,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const AuthConsumer = AuthContext.Consumer;
