import { firebaseServerAdmin } from "src/lib/server/firebase-admin";

interface MetadataField {
  displayName: string;
  gridColumnWidth?: string;
  type: string;
  units?: string | string[];
  valueOptions?: string[];
  questionnaireResponseAlias?: string | string[];
}

export const populateNewUserQuestions = async () => {
  const newUserQuestionFields: Record<string, string[]> = {
    ["dataOutcomes"]: [
      "Pathogen Detection",
      "Taxonomic Profiles",
      "Microbial Abundances",
      "Functional Pathways Identification",
      "Population Diversity Stats",
      "Complete Genome Sequence",
      "Other",
    ],
    ["healthConcerns"]: [
      "Bacterial Pathogens",
      "Viral Pathogens",
      "Parastic Infections",
      "Algal Blooms",
      "Biofilter Health",
      "Water Quality",
      "Livestock Health",
      "Other",
    ],
    ["sampleTypes"]: ["Water", "Tissue", "Sediment", "Mucosal", "Biofilter"],
    ["services"]: [
      "Metagenomics",
      "qPCR",
      "Histology",
      "Rapid Detection Kits",
      "Genome Sequencing",
    ],
    ["species"]: [
      "Atlantic Salmon (Salmo salar)",
      "Rainbow Trout (Oncorhynchus mykiss)",
      "European Carp (Cyprinus carpio)",
      "Ballan Wrasse (Labrus bergylta)",
      "Lumpfish (Cyclopterus lumpus)",
      "Yellow Perch (Perca flavescens)",
      "Atlantic Cod (Gadus morhua)",
      "European Bass (Dicentrarchus labrax)",
      "Gilthead Seabream (Sparus Aurata)",
      "Turbot (Scophthalmus maximus)",
      "Whiteleg Shrimp (Litopenaeus vannamei)",
      "Tiger Shrimp (Penaeus monodon)",
      "Abalone (Haliotidae)",
      "Oyster (All species)",
      "Other",
    ],
  };

  await firebaseServerAdmin
    .firestore()
    .collection("customer-options")
    .doc("new-user-questionnaire")
    .set(newUserQuestionFields);
};

export const populateRequestPage = async () => {
  const requestFields: Record<string, string[]> = {
    ["completionTime"]: [
      "2 weeks",
      "1 month",
      "3 months",
      "6 months",
      "12 months",
    ],
    ["concerns"]: [
      "Bacterial Pathogens",
      "Viral Pathogens",
      "Parastic Infections",
      "Algal Blooms",
      "Biofilter Health",
      "Water Quality",
      "Livestock Health",
      "Other",
    ],
    ["dataOutcomes"]: [
      "Pathogen Detection",
      "Taxonomic Profiles",
      "Microbial Abundances",
      "Functional Pathways Identification",
      "Population Diversity Stats",
      "Complete Genome Sequence",
      "Other",
    ],
    ["dataStorage"]: [
      "Spreadsheet (CSV, Excel)",
      "Text Documents (doc, Word, PDF)",
      "Internal farm management software",
      "External farm management software",
      "Image files",
      "Other",
    ],

    ["environmental"]: [
      "Sampling Depth (External and Internal)",
      "Site Location (External)",
      "Weather Conditions (External)",
      "Tidal Direction (External)",
      "Frequency / Speed / Volume of Recircularisation (Internal)",
      "Light Intensity or Exposure Time (Internal)",
      "Water Pressure (Internal)",
      "Other",
    ],

    ["facilities"]: [
      "Fridge (4C)",
      "Freezer (-20C)",
      "Freezer (-80C)",
      "Dry Ice",
      "Microbial Filters",
      "Vacuum Pump",
    ],

    ["furtherInformation"]: [
      "Facility location",
      "Facility design and layout",
      "Commercial Feed samples",
      "Commercial Biofilter samples",
    ],

    ["husbandry"]: [
      "Feed Frequency",
      "Feed Quantity",
      "Biomass of Livestock",
      "Previously Detected Pathogens",
      "Current Treatment Regime",
      "Mortality",
      "Descriptions of Livestock",
      "Other",
    ],

    ["livestock"]: [
      "Atlantic Salmon (Salmo salar)",
      "Rainbow Trout (Oncorhynchus mykiss)",
      "European Carp (Cyprinus carpio)",
      "Ballan Wrasse (Labrus bergylta)",
      "Lumpfish (Cyclopterus lumpus)",
      "Yellow Perch (Perca flavescens)",
      "Atlantic Cod (Gadus morhua)",
      "European Bass (Dicentrarchus labrax)",
      "Gilthead Seabream (Sparus Aurata)",
      "Turbot (Scophthalmus maximus)",
      "Whiteleg Shrimp (Litopenaeus vannamei)",
      "Tiger Shrimp (Penaeus monodon)",
      "Abalone (Haliotidae)",
      "Oyster (All species)",
      "Other",
    ],

    ["productionEnvironments"]: [
      "External (Open Water)",
      "Internal (Closed systems)",
    ],

    ["projectOutcomes"]: [
      "Confirmation of Pathogen",
      "Customised Pathogen Detection Tools",
      "Improved Treatment Plans",
      "Biofilter Monitoring / Maintenance",
      "Benthic Scores",
      "Other",
    ],

    ["sampleTypes"]: ["Water", "Tissue", "Sediment", "Mucosal", "Biofilter"],

    ["services"]: ["Metagenomics", "qPCR", "Genome Sequencing"],

    ["systemPreparation"]: [
      "UV",
      "Chemical",
      "Heat",
      "Pressure",
      "Ozone",
      "Other",
    ],

    ["waterQuality"]: [
      "pH",
      "Salinity",
      "Temperature",
      "Dissolved Oxygen",
      "CO2",
      "Conductivity",
      "Turbidity",
      "Ammonia",
      "Nitrite",
      "Nitrate",
      "Phosphate",
      "Chloramine",
      "Other",
    ],
  };

  await firebaseServerAdmin
    .firestore()
    .collection("customer-options")
    .doc("request-page")
    .set(requestFields);
};

export const populateMetadataFields = async () => {
  const metadataFields: Record<string, MetadataField> = {
    ["ammonia"]: {
      displayName: "Ammonia",
      gridColumnWidth: "200",
      type: "number",
      units: ["mg/L", "ppm"],
    },
    ["biomassPerAnimal"]: {
      displayName: "Biomass / animal",
      gridColumnWidth: "200",
      type: "number",
      units: "kg",
    },
    ["chloramine"]: {
      displayName: "Chloramine",
      gridColumnWidth: "200",
      type: "number",
      units: ["ppm", "mg/L"],
    },
    ["co2"]: {
      displayName: "CO2",
      gridColumnWidth: "200",
      type: "number",
      units: ["mg/L", "ppm"],
    },
    ["conductivity"]: {
      displayName: "Conductivity",
      gridColumnWidth: "210",
      type: "number",
      units: "mS/m",
    },
    ["dissolvedOxygen"]: {
      displayName: "Dissolved Oxygen",
      gridColumnWidth: "220",
      type: "number",
      units: ["mg/L", "ppm"],
    },
    ["feedFrequency"]: {
      displayName: "Feed Frequency",
      gridColumnWidth: "200",
      type: "singleSelect",
      valueOptions: ["Hourly", "Daily", "Weekly"],
    },
    ["feedQuantity"]: {
      displayName: "Feed Quantity",
      gridColumnWidth: "200",
      type: "number",
      units: "kg/L",
    },
    ["habitat"]: {
      displayName: "Habitat",
      gridColumnWidth: "150",
      type: "singleSelect",
      valueOptions: [
        "River",
        "Lake",
        "Shoreline",
        "Sea Loch",
        "Freshwater Loch",
        "Offshore",
        "RAS",
      ],
    },
    ["knownPathology"]: {
      displayName: "Known associated pathology",
      gridColumnWidth: "200",
      type: "singleSelect",
      valueOptions: [
        "Complex Gill Disease",
        "Hatchery mortality",
        "Parasitic pathogen",
        "Bacterial pathogen",
        "Viral pathogen",
        "Fungal pathogen",
        "Algal bloom",
        "Sore or lession",
        "OTHER",
      ],
    },
    ["livestockSpecies"]: {
      displayName: "Livestock (Species)",
      gridColumnWidth: "200",
      type: "singleSelect",
      valueOptions: [
        "Oncorhynchus mykiss",
        "Salmo salar",
        "Cyprinus carpio",
        "Labrus bergylta",
        "Cyclopterus lumpus",
        "OTHER",
      ],
    },
    ["nitrate"]: {
      displayName: "Nitrate",
      gridColumnWidth: "150",
      type: "number",
      units: ["mg/L", "ppm"],
    },
    ["nitrite"]: {
      displayName: "Nitrite",
      gridColumnWidth: "150",
      type: "number",
      units: ["mg/L", "ppm"],
    },
    ["notes"]: {
      displayName: "Notes",
      gridColumnWidth: "400",
      type: "string",
    },
    ["pH"]: {
      displayName: "pH",
      gridColumnWidth: "100",
      type: "number",
    },
    ["pathogenType"]: {
      displayName: "Pathogen Type",
      gridColumnWidth: "150",
      type: "singleSelect",
      valueOptions: ["Animal", "Bacteria", "Fungi", "Virus", "Parasite"],
    },
    ["phosphate"]: {
      displayName: "Phosphate",
      gridColumnWidth: "150",
      type: "number",
      units: ["mg/L", "ppm"],
    },
    ["qPCRPathogens"]: {
      displayName: "Pathogens (qPCR)",
      gridColumnWidth: "200",
      type: "multiSelect",
      valueOptions: [
        "Aeromonas salmonicida",
        "Atlantic Salmon paramyxovirus ",
        "Caligus sp.",
        "Diplostomum sp.",
        "Flavobacterium branchiophilum",
        "Flavobacterium psychrophilum",
        "Ichthyobodo necator (Costia)",
        "Ichthyobodo salmonis",
        "Ichthyophthirius multifiliis",
        "Infectious haematopoietic necrosis virus",
        "Infectious pancreatic necrosis virus",
        "Infectious salmon anaemia virus",
        "Koi Herpes Virus",
        "Lactococcus spp. Garvieae",
        "Lepeophtheirus salmonis",
        "Moritella viscosa",
        "Mycobacterium sp.",
        "Neoparamoeba perurans",
        "Pan-piscine orthoreovirus (1, 2 and 3)",
        "Paramoeba perurans",
        "Pasteurella skyensis",
        "Pisirickettsia salmonosis",
        "Renibacterium salmoninarum",
        "Salmonoid alphavirus",
        "Saprolegnia sp.",
        "Tenacibaculum maritimum ",
        "Tetracapsuloides bryosalmonae",
        "Vibrio anguillarum",
        "Viral haemorrhagic septicaemia virus",
        "Yersinia ruckeri",
      ],
    },
    ["salinity"]: {
      displayName: "Salinity",
      gridColumnWidth: "150",
      type: "number",
      units: ["ppt", "%"],
    },
    ["sampleStorageConditions"]: {
      displayName: "Sample Storage Conditions",
      gridColumnWidth: "200",
      type: "singleSelect",
      valueOptions: [
        "Fridge (4C)",
        "Freeer (-20C)",
        "Freezer (-80C)",
        "Dry Ice",
        "Room Temp",
        "Preservation Buffer",
        "Ethanol",
      ],
    },
    ["sampleType"]: {
      displayName: "Sample Type",
      gridColumnWidth: "120",
      type: "singleSelect",
      valueOptions: [
        "Water (Fresh)",
        "Water (Marine)",
        "Sediment",
        "Brain (Tissue)",
        "Kidney (Tissue)",
        "Liver (Tissue)",
        "Heart (Tissue)",
        "Skin (Tissue)",
        "Gill (Tissue)",
        "Splean (Tissue)",
        "Gill (Swab)",
        "Skin (Swab)",
        "Whole animal",
        "Mucousal Swab",
        "Skin Swab",
        "BioFilter",
        "Isolated Pathogen",
      ],
    },
    ["samplingDateTime"]: {
      displayName: "Collection Date/Time",
      gridColumnWidth: "200",
      type: "dateTime",
    },
    ["taxonomicID"]: {
      displayName: "Taxonomic ID",
      gridColumnWidth: "150",
      type: "string",
    },
    ["temperature"]: {
      displayName: "Temp",
      gridColumnWidth: "100",
      questionnaireResponseAlias: "Temperature",
      type: "number",
      units: "Celcius",
    },
    ["turbidity"]: {
      displayName: "Turbidity",
      gridColumnWidth: "150",
      type: "number",
      units: ["NTU", "FTU"],
    },
  };

  for (const key in metadataFields) {
    const data = metadataFields[key];
    await firebaseServerAdmin
      .firestore()
      .collection("metadata-fields")
      .doc(key)
      .set(data);
  }
};
