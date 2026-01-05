import { Address } from "./user";

interface OrderCustomer {
  email: string;
  name: string;
  company: string;
  role: string;
}

export type OrderStatus = "reviewing" | "approved" | "kit-sent" | "kit-arrived";

export type SampleStatus =
  | "sample-collected"
  | "sample-returned"
  | "processing"
  | "complete";

export interface OrderServiceItem {
  service: string;
  sampleType: string;
  // hostSpecies: string;
  numberOfSamples: number;
}

export interface OrderRequest {
  userId: string;
  title: string;
  proposal: string;
  services: OrderServiceItem[];
  questionnaireAnswers: Record<string, { name: string; value: string }[]>;
  deliveryAddress: Address;
}

export interface NewOrder {
  id: string; // this is the unique id
  status: OrderStatus; // this is used for the status of the order
  title: string;
  proposal: string;
  createdAt: number; // time the order was created at
  dispatchedAt?: number; // time the order was dispatched
  customer: OrderCustomer; // customer who completed the order
  deliveryAddress: Address;
  userId: string; // uid of user who completed the order
  questionnaireAnswers: Record<string, { name: string; value: string }[]>;
  requestedServices: OrderServiceItem[];
  orderedSamples?: OrderedSample[];
  unsubmittedSamples?: UnsubmittedSample[];
  submittedSamples?: Sample[];
  metadataFields: { name: string; displayName: string }[];
  orderReports?: { filename: string; downloadUrl: string }[];
}

export interface UnsubmittedSample {
  name: string;
  service: string;
  metadata: Record<string, MetadataSubmission>;
}

export interface Sample {
  name: string;
  status: SampleStatus;
  service: string;
  metadata: Record<string, MetadataSubmission>;
  reportUrl?: string;
  lastUpdated: number;
}

// export interface Report {
//   path: string;
//   dateUploaded: number;
// }

export interface BasicSample {
  name: string;
  service: string;
  reportUrl?: string;
  status?: SampleStatus;
  metadata?: Record<string, MetadataSubmission>;
  orderId: string;
  orderTitle: string;
}

export interface OrderedSample {
  apiId: string;
  name: string;
  service: string;
}

export interface MetadataSubmission {
  name: string;
  displayName: string;
  units?: string;
  value: any;
}

export interface MetadataField {
  name: string;
  displayName: string;
  questionnaireResponseAlias?: string | Array<string>;
  type: "string" | "boolean" | "number" | "singleSelect";
  units?: string | Array<string>;
  valueOptions?: string[];
  gridColumnWidth?: number;
  helpText?: string;
}
