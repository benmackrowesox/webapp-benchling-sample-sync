export interface InternalUser {
  id: string;
  avatar?: string;
  email: string;
  isAdmin: boolean;
  isApproved: boolean;
  emailVerified: boolean;
  [key: string]: any;
}

export type firestoreUser = {
  firstName: string;
  lastName: string;
  company: string;
  role: string;
  contactNo?: string;
  postcode?: string;
  line1?: string;
  line2?: string;
  townCity?: string;
  county?: string;
  country?: string;
  isAdmin?: boolean;
  awaitingApproval: boolean;
  dateRegistered: number;
};

export type Address = {
  name: string;
  postcode?: string;
  line1?: string;
  line2?: string;
  townCity?: string;
  county?: string;
  country?: string;
};

export interface UserRegistrationFields {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
  company: string;
  contactNo: string;
}
