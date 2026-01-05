export interface CustomerOrderFields {
  "On Behalf of"?: { value: string };
  "Sent From": { value: string };
  "Date/Time of Submission": { value: Date };
  "Client Name": { value: string };
  "Order Receipt Status"?: { value: string };
  Notes?: { value: string };
}

export interface DiagnosticCustomerSampleFields {
  "Customer Order": { value: string };
  "Date/Time Sampled"?: { value: Date };
}

export interface GenomeSequencingSampleFields {
  "Customer Order": { value: string };
  "Date/Time Sampled"?: { value: Date };
  // "Sample Type"?: { value: string };
  // "Host Species"?: { value: string };
}

export interface QPCRSampleFields {
  "Customer Order": { value: string };
  "Date/Time Sampled"?: { value: Date };
  // "Sample Type"?: { value: string };
  // "Host Species"?: { value: string };
}

export interface MetagenomicsSampleFields {
  "Customer Order": { value: string };
  "Date/Time Sampled"?: { value: Date };
}

export class CustomerOrder
  implements CustomBenchlingEntity<CustomerOrderFields>
{
  fields: CustomerOrderFields;
  folderId: string;
  schemaId: string;
  registryId: string;
  name: string;
  entityRegistryId: string;
  customFields?: Record<string, any>;

  constructor(orderId: string, folderId: string, fields: CustomerOrderFields) {
    this.schemaId = "ts_kNAYj3h4";
    this.registryId = "src_xro8e9rf";
    this.entityRegistryId = `EB_CO${orderId}`;
    this.name = `EB_CO${orderId}`;
    this.folderId = folderId;
    this.fields = fields;
  }
}

export class GenomeSequencingSample
  implements CustomBenchlingEntity<GenomeSequencingSampleFields>
{
  fields: GenomeSequencingSampleFields;
  folderId: string;
  schemaId: string;
  registryId: string;
  name: string;
  namingStrategy: NamingStrategy;
  customFields?: Record<string, any>;

  constructor(
    name: string,
    folderId: string,
    fields: GenomeSequencingSampleFields,
  ) {
    this.schemaId = "ts_Jy2wFEft";
    this.registryId = "src_xro8e9rf";
    this.namingStrategy = "DELETE_NAMES";
    this.name = name; // even if Benchling configured to replace name, a unique name within tne batch must be provided
    this.folderId = folderId;
    this.fields = fields;
  }
}

export class QPCRSample implements CustomBenchlingEntity<QPCRSampleFields> {
  fields: QPCRSampleFields;
  folderId: string;
  schemaId: string;
  registryId: string;
  name: string;
  namingStrategy: NamingStrategy;
  customFields?: Record<string, any>;

  constructor(name: string, folderId: string, fields: QPCRSampleFields) {
    this.schemaId = "ts_wfTG1Txp";
    this.registryId = "src_xro8e9rf";
    this.namingStrategy = "DELETE_NAMES";
    this.name = name; // even if Benchling configured to replace name, a unique name within tne batch must be provided
    this.folderId = folderId;
    this.fields = fields;
  }
}

export type CustomerSample =
  | MetagenomicsSample
  | QPCRSample
  | GenomeSequencingSample;

export class MetagenomicsSample
  implements CustomBenchlingEntity<MetagenomicsSampleFields>
{
  fields: MetagenomicsSampleFields;
  folderId: string;
  schemaId: string;
  registryId: string;
  name: string;
  namingStrategy: NamingStrategy;
  customFields?: Record<string, any>;

  constructor(
    name: string,
    folderId: string,
    fields: MetagenomicsSampleFields,
  ) {
    this.schemaId = "ts_NJDS3UwU";
    this.registryId = "src_xro8e9rf";
    this.namingStrategy = "DELETE_NAMES";
    this.name = name; // even if Benchling configured to replace name, a unique name within tne batch must be provided
    this.folderId = folderId;
    this.fields = fields;
  }
}

export class DiagnosticCustomerSample
  implements CustomBenchlingEntity<DiagnosticCustomerSampleFields>
{
  fields: DiagnosticCustomerSampleFields;
  folderId: string;
  schemaId: string;
  registryId: string;
  name: string;
  namingStrategy: NamingStrategy;
  customFields?: Record<string, any>;

  constructor(
    name: string,
    folderId: string,
    fields: DiagnosticCustomerSampleFields,
  ) {
    this.schemaId = "ts_6UVHrwAz";
    this.registryId = "src_xro8e9rf";
    this.namingStrategy = "SET_FROM_NAME_PARTS";
    this.name = name;
    this.folderId = folderId;
    this.fields = fields;
  }
}

export interface CustomBenchlingEntity<T> {
  fields: T;
  folderId?: string;
  name: string;
  schemaId: string;
  entityRegistryId?: string;
  namingStrategy?: NamingStrategy;
  registryId: string;
}

export type NamingStrategy =
  | "NEW_IDS"
  | "IDS_FROM_NAMES"
  | "DELETE_NAMES"
  | "SET_FROM_NAME_PARTS"
  | "REPLACE_NAMES_FROM_PARTS"
  | "KEEP_NAMES"
  | "REPLACE_ID_AND_NAME_FROM_PARTS";
