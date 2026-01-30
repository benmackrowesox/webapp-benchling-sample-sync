import { NextApiRequest, NextApiResponse } from "next/types";
import fs from "fs";
import path from "path";
import * as XLSX from "xlsx";
import { ChileSite, ChileMapData, ChileFilterOptions } from "../../types/chile-site";

// Chile to English species translation dictionary
const CHILE_SPECIES_TRANSLATIONS: Record<string, string> = {
  "SALMON ATLANTICO": "Atlantic Salmon",
  "SALMON DEL ATLANTICO": "Atlantic Salmon",
  "ATLANTIC SALMON": "Atlantic Salmon",
  "SALAR": "Atlantic Salmon",
  "SALMON COHO": "Coho Salmon",
  "COHO": "Coho Salmon",
  "SALMON CHINOOK": "Chinook Salmon",
  "CHINOOK": "Chinook Salmon",
  "SALMON ROSA": "Pink Salmon",
  "PINK": "Pink Salmon",
  "SALMON KETA": "Chum Salmon",
  "CHUM": "Chum Salmon",
  "TRUCHA ARCOIRIS": "Rainbow Trout",
  "RAINBOW TROUT": "Rainbow Trout",
  "TRUCHA": "Trout",
  "TROUT": "Trout",
  "TURBOT": "Turbot",
  "RODABALLO": "Turbot",
  "CAMARON": "Shrimp",
  "SHRIMP": "Shrimp",
  "OSTION": "Scallop",
  "SCALLOP": "Scallop",
  "MEJILLON": "Mussel",
  "MUSSEL": "Mussel",
  "CHORO": "Mussel",
  "ALGA": "Seaweed",
  "ALGAS": "Seaweed",
  "SEAWEED": "Seaweed",
  "KELP": "Kelp",
  "HUIRO": "Kelp",
  "COCHAYUYO": "Cochayuyo",
  "LUGA": "Luga",
  "LUCHE": "Luche",
  "CHASCON": "Chascon",
  "PELILLO": "Pelillo",
  "LUGA NEGRA": "Black Luga",
  "LUGA ROJA": "Red Luga",
  "CRESPA": "Crispa",
  "OREJA DE MAR": "Abalone",
  "ABALONE": "Abalone",
  "LOCO": "Locos",
  "PICOROCO": "Picoroco",
  "ERIZO": "Sea Urchin",
  "SEA URCHIN": "Sea Urchin",
  "CONGRIO": "Conger",
  "CONGER": "Conger",
  "BACALAO": "Cod",
  "COD": "Cod",
  "MERLUZA": "Hake",
  "HAKE": "Hake",
  "JUREL": "Jack Mackerel",
  "JACK MACKEREL": "Jack Mackerel",
  "CABALLA": "Mackerel",
  "MACKEREL": "Mackerel",
  "ANCHOVETA": "Anchoveta",
  "ANCHOVY": "Anchoveta",
  "SARDINA": "Sardine",
  "SARDINE": "Sardine",
  "ATUN": "Tuna",
  "TUNA": "Tuna",
};

// Chile region translation dictionary (Spanish to English)
const CHILE_REGION_TRANSLATIONS: Record<string, string> = {
  "REGIÓN DE ARICA Y PARINACOTA": "Arica and Parinacota",
  "REGIÓN DE TARAPACÁ": "Tarapacá",
  "REGIÓN DE ANTOFAGASTA": "Antofagasta",
  "REGIÓN DE ATACAMA": "Atacama",
  "REGIÓN DE COQUIMBO": "Coquimbo",
  "REGIÓN DE VALPARAÍSO": "Valparaíso",
  "REGIÓN DEL LIBERTADOR BERNARDO O'HIGGINS": "O'Higgins",
  "REGIÓN DEL MAULE": "Maule",
  "REGIÓN DE ÑUBLE": "Ñuble",
  "REGIÓN DEL BIOBÍO": "Bío Bío",
  "REGIÓN DE LA ARAUCANÍA": "Araucanía",
  "REGIÓN DE LOS RÍOS": "Los Ríos",
  "REGIÓN DE LOS LAGOS": "Los Lagos",
  "REGIÓN DE AISÉN DEL GENERAL CARLOS IBÁÑEZ DEL CAMPO": "Aysén",
  "REGIÓN DE MAGALLANES Y DE LA ANTÁRTICA CHILENA": "Magallanes",
};

// Chile concession type translation dictionary
const CHILE_CONCESSION_TYPE_TRANSLATIONS: Record<string, string> = {
  "ACUÍCOLA": "Aquaculture",
  "ACUICOLA": "Aquaculture",
  "PESQUERA": "Fishing",
  "PESCA": "Fishing",
};

// Chile species type translation dictionary
const CHILE_SPECIES_TYPE_TRANSLATIONS: Record<string, string> = {
  "PECES": "Fish",
  "PEZ": "Fish",
  "MOLUSCOS": "Shellfish",
  "MOLUSCO": "Shellfish",
  "CRUSTÁCEOS": "Crustaceans",
  "CRUSTACEOS": "Crustaceans",
  "ALGAS": "Seaweed",
  "ALGA": "Seaweed",
};

// Chile status translation dictionary (Spanish to English)
const CHILE_STATUS_TRANSLATIONS: Record<string, string> = {
  "VIGENTE": "Active",
  "EN TRÁMITE": "Pending",
  "EN TRAMITE": "Pending",
  "CADUCO": "Expired",
  "CADUCADO": "Expired",
  "RENOVACIÓN": "Renewal",
  "RENOVACION": "Renewal",
  "SUSPENDIDO": "Suspended",
  "SUSPENSIÓN": "Suspended",
};

/**
 * Translate a Chile region name to English
 */
function translateChileRegion(region: string): string {
  if (!region) return region;
  
  const upper = region.toUpperCase().trim();
  
  // Direct translation
  if (CHILE_REGION_TRANSLATIONS[upper]) {
    return CHILE_REGION_TRANSLATIONS[upper];
  }
  
  // Try partial matching
  for (const [spanish, english] of Object.entries(CHILE_REGION_TRANSLATIONS)) {
    if (upper.includes(spanish) || spanish.includes(upper)) {
      return english;
    }
  }
  
  return region;
}

/**
 * Translate a Chile concession type to English
 */
function translateChileConcessionType(concessionType: string): string {
  if (!concessionType) return concessionType;
  
  const upper = concessionType.toUpperCase().trim();
  
  // Direct translation
  if (CHILE_CONCESSION_TYPE_TRANSLATIONS[upper]) {
    return CHILE_CONCESSION_TYPE_TRANSLATIONS[upper];
  }
  
  return concessionType;
}

/**
 * Translate a Chile species type to English
 */
function translateChileSpeciesType(speciesType: string): string {
  if (!speciesType) return speciesType;
  
  const upper = speciesType.toUpperCase().trim();
  
  // Direct translation
  if (CHILE_SPECIES_TYPE_TRANSLATIONS[upper]) {
    return CHILE_SPECIES_TYPE_TRANSLATIONS[upper];
  }
  
  return speciesType;
}

/**
 * Translate Chile status to English
 */
function translateChileStatus(status: string): string {
  if (!status) return "Unknown";
  
  const normalized = status.toUpperCase().trim();
  
  // Direct translation
  if (CHILE_STATUS_TRANSLATIONS[normalized]) {
    return CHILE_STATUS_TRANSLATIONS[normalized];
  }
  
  return status;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ChileMapData | { error: string }>) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Path to the Chile Excel file
    const excelPath = path.join(process.cwd(), "aquaculture_site_data", "chile_aquaculture_site_100126", "aquaculturesites_chile_100126.xlsx");

    // Check if file exists
    if (!fs.existsSync(excelPath)) {
      return res.status(404).json({ error: "Chile data file not found" });
    }

    // Read and parse the Excel file
    const workbook = XLSX.readFile(excelPath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rawData = XLSX.utils.sheet_to_json(worksheet);

    console.log(`Chile Excel: Found ${rawData.length} rows`);

    // Process the data
    const sites = processChileData(rawData);
    
    console.log(`Chile Excel: Processed ${sites.length} sites with valid coordinates`);

    // Generate filter options
    const filters = getChileFilterOptions(sites);

    const mapData: ChileMapData = {
      sites,
      filters,
      totalCount: sites.length,
    };

    res.status(200).json(mapData);
  } catch (error) {
    console.error("Error loading Chile site data:", error);
    res.status(500).json({ error: "Failed to load Chile site data" });
  }
}

/**
 * Process raw Chile site data from Excel (Spanish column names)
 * All fields are translated to English
 */
function processChileData(rawData: any[]): ChileSite[] {
  return rawData.map((row, index) => {
    // Extract coordinates - may have multiple sets, take first valid one
    const coords = parseDMSCoordinates(row["Coordenadas Geográficas"] || row["Coordenadas"] || "");
    
    // Extract individual species from the "Especies" column and translate to English
    const speciesArray = extractChileSpecies(row["Especies"] || "");
    
    // Get raw status and translate to English
    const rawStatus = row["Estado"] || row["Estado de Trámite"] || "";
    const translatedStatus = translateChileStatus(rawStatus);
    
    const site: ChileSite = {
      id: String(row["OBJECTID"] || row["N° Pert"] || index),
      site_id: String(row["N° Pert"] || row["Código de Centro"] || ""),
      concession_number: String(row["N° Pert"] || ""),
      site_name: row["Ubicación Geográfica"]?.trim() || row["NOMBRE SITIO"] || "",
      location: row["Ubicación Geográfica"]?.trim() || "",
      // Commune is kept as-is (typically proper names)
      commune: (row["Comuna"] || "").trim(),
      // Translate region to English
      region: translateChileRegion(row["Región"] || row["REGIÓN"] || ""),
      latitude: coords.lat,
      longitude: coords.lon,
      company: (row["Nombre de Titular"] || row["TITULAR"] || "").trim(),
      holder: (row["Nombre de Titular"] || row["TITULAR"] || "").trim(),
      operator: "",
      species: speciesArray,
      // Translate species type to English
      species_type: translateChileSpeciesType((row["Grupo Especie"] || "").trim()),
      // Translate concession type to English
      concession_type: translateChileConcessionType((row["Tipo Concesión"] || row["TIPO CONCESIÓN"] || "").trim()),
      status: translatedStatus,
      // Status description in English
      status_description: translatedStatus,
      activity_type: "",
      business_type: "",
      registration_date: "",
      expiration_date: "",
      administrative_resolution: row["N° Resolución SUBPESCA"] || "",
      area_ha: parseNumber(row["Superficie (Há)"] || row["Superficie (ha)"] || ""),
      area_utilized_ha: undefined,
    };

    // Generate hover text
    site.hover_text = buildChileHoverText(site);

    return site;
  }).filter(site => site.latitude !== undefined && site.longitude !== undefined);
}

/**
 * Parse DMS coordinates like "S 41°35´14.4850, W 73°37´45.1614"
 * Returns the first valid coordinate pair found
 */
function parseDMSCoordinates(coordString: string): { lat: number | undefined; lon: number | undefined } {
  if (!coordString || !coordString.trim()) {
    return { lat: undefined, lon: undefined };
  }

  // Split by newlines to handle multiple coordinate sets
  const lines = coordString.split("\n").filter(l => l.trim());
  
  for (const line of lines) {
    // Match pattern like "S 41°35´14.4850, W 73°37´45.1614"
    const dmsPattern = /([NS]?)\s*(\d+)[°]\s*(\d+)[´']\s*([\d.]+)[´"]?\s*,?\s*([EW]?)\s*(\d+)[°]\s*(\d+)[´']\s*([\d.]+)[´"]?/i;
    const match = line.match(dmsPattern);
    
    if (match) {
      const latDir = match[1].toUpperCase() || (line.toUpperCase().includes("S") ? "S" : "N");
      const latDeg = parseFloat(match[2]);
      const latMin = parseFloat(match[3]);
      const latSec = parseFloat(match[4]);
      
      const lonDir = match[5].toUpperCase() || (line.toUpperCase().includes("W") ? "W" : "E");
      const lonDeg = parseFloat(match[6]);
      const lonMin = parseFloat(match[7]);
      const lonSec = parseFloat(match[8]);
      
      // Convert DMS to decimal degrees
      let lat = latDeg + latMin / 60 + latSec / 3600;
      let lon = lonDeg + lonMin / 60 + lonSec / 3600;
      
      // Apply direction
      if (latDir === "S") lat = -lat;
      if (lonDir === "W") lon = -lon;
      
      // Validate ranges (Chile should be roughly: lat -18 to -56, lon -68 to -81)
      if (lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
        return { lat, lon };
      }
    }
  }

  return { lat: undefined, lon: undefined };
}

/**
 * Extract and translate individual species from Chile data
 */
function extractChileSpecies(speciesString: string): string[] {
  if (!speciesString || !speciesString.trim()) {
    return [];
  }
  
  // Split by comma
  const species = speciesString
    .split(",")
    .map(s => s.trim())
    .filter(s => s !== "" && s.toUpperCase() !== "N/A");
  
  // Translate each species to English
  return species.map(s => translateChileSpecies(s));
}

/**
 * Translate a Chile species name to English
 */
function translateChileSpecies(chileName: string): string {
  const upper = chileName.toUpperCase().trim();
  
  // Direct translation
  if (CHILE_SPECIES_TRANSLATIONS[upper]) {
    return CHILE_SPECIES_TRANSLATIONS[upper];
  }
  
  // Try partial matching
  for (const [chile, english] of Object.entries(CHILE_SPECIES_TRANSLATIONS)) {
    if (upper.includes(chile) || chile.includes(upper)) {
      return english;
    }
  }
  
  // Capitalize first letter if no translation found
  return chileName
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Parse number value
 */
function parseNumber(value: string | number | undefined): number | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  
  if (typeof value === "number") {
    return isNaN(value) ? undefined : value;
  }
  
  // Handle European number format (commas as decimal separators)
  const cleaned = String(value).replace(/,/g, ".").replace(/[^\d.]/g, "");
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? undefined : parsed;
}

/**
 * Build hover text for a Chile site (all labels in English)
 */
function buildChileHoverText(site: ChileSite): string {
  const parts: string[] = [];
  
  // Header
  if (site.location && site.location.trim() !== "") {
    parts.push(`<b>${site.location}</b>`);
  } else if (site.site_id) {
    parts.push(`<b>Site ${site.site_id}</b>`);
  }
  
  // Concession number
  if (site.concession_number) {
    parts.push(`Concession No.: ${site.concession_number}`);
  }
  
  // Location
  if (site.commune) {
    parts.push(`Commune: ${site.commune}`);
  }
  if (site.region) {
    parts.push(`Region: ${site.region}`);
  }
  
  // Company
  if (site.company && site.company.trim() !== "") {
    parts.push(`Holder: ${site.company}`);
  }
  
  // Species
  if (site.species && site.species.length > 0) {
    parts.push(`Species: ${site.species.join(", ")}`);
  }
  
  // Species type
  if (site.species_type) {
    parts.push(`Type: ${site.species_type}`);
  }
  
  // Status
  if (site.status) {
    parts.push(`Status: ${site.status}`);
  }
  
  // Concession type
  if (site.concession_type) {
    parts.push(`Concession: ${site.concession_type}`);
  }
  
  // Area
  if (site.area_ha) {
    parts.push(`Area: ${site.area_ha} ha`);
  }
  
  // Resolution
  if (site.administrative_resolution) {
    parts.push(`Resolution: ${site.administrative_resolution}`);
  }
  
  return parts.join("<br>");
}

/**
 * Get unique values for Chile site filtering
 */
function getChileFilterOptions(sites: ChileSite[]): ChileFilterOptions {
  const allSpecies: string[] = [];
  const allCompanies: string[] = [];
  const allStatuses: string[] = [];
  const allRegions: string[] = [];
  const allConcessionTypes: string[] = [];
  const allActivityTypes: string[] = [];

  sites.forEach(s => {
    // Species - each individual species should be searchable
    if (s.species && s.species.length > 0) {
      allSpecies.push(...s.species);
    }
    
    // Companies (holder)
    if (s.company && s.company.trim() !== "" && s.company !== "N/A") {
      allCompanies.push(s.company);
    }
    
    // Statuses
    if (s.status && s.status.trim() !== "") {
      allStatuses.push(s.status);
    }
    
    // Regions
    if (s.region && s.region.trim() !== "") {
      allRegions.push(s.region);
    }
    
    // Concession types
    if (s.concession_type && s.concession_type.trim() !== "") {
      allConcessionTypes.push(s.concession_type);
    }
    
    // Species types (from Grupo Especie)
    if (s.species_type && s.species_type.trim() !== "") {
      allActivityTypes.push(s.species_type);
    }
  });

  return {
    species: [...new Set(allSpecies)].sort(),
    companies: [...new Set(allCompanies)].sort(),
    statuses: [...new Set(allStatuses)].sort(),
    regions: [...new Set(allRegions)].sort(),
    concession_types: [...new Set(allConcessionTypes)].sort(),
    activity_types: [...new Set(allActivityTypes)].sort(),
  };
}
