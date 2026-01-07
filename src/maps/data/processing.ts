// Data processing utilities for aquaculture site maps

import proj4 from 'proj4';
import { AquacultureSite, IcelandSite, NorwegianSite, NorwegianFilterOptions, CanadianSite, CanadianFilterOptions } from '../types/site';

// Define the coordinate transformation: British National Grid (EPSG:27700) → WGS84 (EPSG:4326)
const BNG_TO_WGS84 = '+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +ellp=airy +datum=OSGB36 +units=m +no_defs';

// Color palette for companies (matching the original Flask app)
const COLORS = [
  '#1f77b4', // blue
  '#ff7f0e', // orange
  '#2ca02c', // green
  '#d62728', // red
  '#9467bd', // purple
  '#8c564b', // brown
  '#e377c2', // pink
  '#7f7f7f', // gray
  '#bcbd22', // yellow-green
  '#17becf', // cyan
  '#393b79', // dark blue
  '#637939', // dark green
  '#8c6d31', // dark goldenrod
  '#843c39', // dark red
  '#7b4173', // dark purple
  '#3182bd', // light blue
  '#e6550d', // light orange
  '#31a354', // light green
  '#756bb1', // light purple
  '#636363', // dark gray
];

/**
 * Convert British National Grid (EPSG:27700) to WGS84 (EPSG:4326)
 */
export function osGridToLatLon(easting: number, northing: number): { lat: number; lon: number } {
  const [lon, lat] = proj4(BNG_TO_WGS84, 'EPSG:4326', [easting, northing]);
  return { lat, lon };
}

/**
 * Clean up species name by removing numeric prefixes and extra whitespace
 * e.g., "1 American Oyster" -> "American Oyster", "Atlantic salmon" -> "Atlantic salmon"
 */
export function cleanSpeciesName(speciesName: string): string {
  // Remove leading numbers and whitespace (e.g., "1 ", "2 ", "10 ")
  const cleaned = speciesName.replace(/^\d+\s*/, '').trim();
  return cleaned;
}

/**
 * Extract individual species from a comma-separated species string
 * e.g., "Char, Salmon" -> ["Char", "Salmon"]
 */
export function extractSpecies(speciesString: string): string[] {
  if (!speciesString || !speciesString.trim()) {
    return [];
  }
  return speciesString.split(',').map(s => s.trim()).filter(s => s !== '');
}

/**
 * Extract individual species from Canadian site data and clean up names
 * Handles comma-separated species and removes numeric prefixes
 */
function extractAndCleanSpecies(speciesString: string): string[] {
  if (!speciesString || !speciesString.trim()) {
    return [];
  }
  return speciesString
    .split(/[,;&]/)  // Split by comma, semicolon, or ampersand
    .map(s => cleanSpeciesName(s.trim()))
    .filter(s => s !== '' && s !== 'N/A' && s.toLowerCase() !== 'unknown');
}

/**
 * Helper to split fields that may contain multiple values separated by comma/semicolon/pipe
 */
function splitAndTrim(value?: string): string[] {
  if (!value || !value.trim()) return [];
  return value
    .split(/[;,|]/)
    .map(v => v.trim())
    .filter(v => v !== '' && v !== 'N/A');
}

// ============ UK Site Processing ============

/**
 * Build hover text for a UK site
 */
export function buildUKHoverText(site: AquacultureSite): string {
  const parts: string[] = [`<b>${site.site_name}</b>`];
  
  const importantFields: Array<[string, string]> = [
    ['Species', site.species],
    ['Company', site.company],
    ['Type', site.aquaculture_type],
    ['Water Type', site.watertype],
    ['Stage', site.stage],
    ['Region', site.region],
    ['Local Authority', site.local_authority],
    ['Health Surveillance', site.health_surveillance],
    ['Producing', site.producing_in_last_3_years],
    ['MS Management Area', site.ms_management_area],
  ];
  
  for (const [label, value] of importantFields) {
    if (value && value.trim() !== '' && value !== 'N/A') {
      parts.push(`${label}: ${value}`);
    }
  }
  
  return parts.join('<br>');
}

/**
 * Process raw UK site data and add transformed coordinates
 */
export function processUKSiteData(sites: AquacultureSite[]): AquacultureSite[] {
  return sites.map(site => {
    if (site.easting && site.northing && !site.latitude) {
      const { lat, lon } = osGridToLatLon(Number(site.easting), Number(site.northing));
      site.latitude = lat;
      site.longitude = lon;
    }
    site.hover_text = buildUKHoverText(site);
    return site;
  });
}

/**
 * Get unique values for UK site filtering
 */
export function getUKFilterOptions(sites: AquacultureSite[]) {
  const allSpecies: string[] = [];
  const allCompanies: string[] = [];
  const allWatertypes: string[] = [];
  const allRegions: string[] = [];

  sites.forEach(s => {
    if (s.species && s.species.trim()) {
      const sp = extractSpecies(s.species);
      allSpecies.push(...sp);
    }
    if (s.company && s.company.trim()) {
      allCompanies.push(...splitAndTrim(s.company));
    }
    if (s.watertype && s.watertype.trim()) {
      allWatertypes.push(...splitAndTrim(s.watertype));
    }
    if (s.region && s.region.trim()) {
      allRegions.push(...splitAndTrim(s.region));
    }
  });

  return {
    species: [...new Set(allSpecies)].sort(),
    companies: [...new Set(allCompanies)].sort(),
    watertypes: [...new Set(allWatertypes)].sort(),
    regions: [...new Set(allRegions)].sort(),
  };
}

// ============ Iceland Site Processing ============

/**
 * Build hover text for an Iceland site
 */
export function buildIcelandHoverText(site: IcelandSite): string {
  const parts: string[] = [`<b>${site.location}</b>`];
  
  const importantFields: Array<[string, string | number | undefined]> = [
    ['Company', site.company],
    ['ID', site.id_number],
    ['Species', site.species],
    ['Type', site.type],
    ['Max Biomass', site.maximal_allowed_biomass ? `${site.maximal_allowed_biomass} tonnes` : undefined],
    ['Valid Until', site.valid_until],
  ];
  
  for (const [label, value] of importantFields) {
    if (value !== undefined && value !== null && value !== '') {
      parts.push(`${label}: ${value}`);
    }
  }
  
  return parts.join('<br>');
}

/**
 * Process raw Iceland site data
 */
export function processIcelandSiteData(sites: IcelandSite[]): IcelandSite[] {
  return sites.map(site => ({
    ...site,
    hover_text: buildIcelandHoverText(site),
  }));
}

/**
 * Get unique values for Iceland site filtering
 */
export function getIcelandFilterOptions(sites: IcelandSite[]) {
  const companies = [...new Set(sites.map(s => s.company).filter(c => c && c.trim() !== ''))].sort();
  
  const allSpecies: string[] = [];
  sites.forEach(site => {
    if (site.species && site.species.trim()) {
      const individualSpecies = extractSpecies(site.species);
      allSpecies.push(...individualSpecies);
    }
  });
  
  const types = [...new Set(sites.map(s => s.type).filter(t => t && t.trim() !== ''))].sort();
  
  return {
    companies,
    species: [...new Set(allSpecies)].sort(),
    types,
  };
}

// ============ Norway Site Processing ============

/**
 * Build hover text for a Norwegian site
 */
export function buildNorwayHoverText(site: NorwegianSite): string {
  const parts: string[] = [`<b>${site.site_name}</b>`];
  
  const importantFields: Array<[string, string | undefined]> = [
    ['Species', site.species],
    ['Company', site.company],
    ['County', site.county],
    ['Municipality', site.municipality],
    ['Purpose', site.purpose],
    ['Production Method', site.production_method],
    ['Status', site.site_status],
    ['Water Type', site.water_type],
    ['Placement', site.placement],
  ];
  
  for (const [label, value] of importantFields) {
    if (value && value.trim() !== '' && value !== 'N/A') {
      parts.push(`${label}: ${value}`);
    }
  }
  
  return parts.join('<br>');
}

/**
 * Process raw Norwegian site data
 */
export function processNorwaySiteData(sites: NorwegianSite[]): NorwegianSite[] {
  return sites.map(site => ({
    ...site,
    hover_text: buildNorwayHoverText(site),
  }));
}

/**
 * Get unique values for Norwegian site filtering
 */
export function getNorwayFilterOptions(sites: NorwegianSite[]): NorwegianFilterOptions {
  const allSpecies: string[] = [];
  const allCompanies: string[] = [];
  const allCounties: string[] = [];
  const allWatertypes: string[] = [];

  sites.forEach(s => {
    if (s.species && s.species.trim()) {
      allSpecies.push(...splitAndTrim(s.species));
    }
    if (s.company && s.company.trim()) {
      allCompanies.push(...splitAndTrim(s.company));
    }
    if (s.county && s.county.trim()) {
      allCounties.push(...splitAndTrim(s.county));
    }
    if (s.water_type && s.water_type.trim()) {
      allWatertypes.push(...splitAndTrim(s.water_type));
    }
  });

  return {
    species: [...new Set(allSpecies)].sort(),
    companies: [...new Set(allCompanies)].sort(),
    watertypes: [...new Set(allWatertypes)].sort(),
    regions: [...new Set(allCounties)].sort(),
  };
}

// ============ Color Utilities ============

/**
 * Generate color for a company
 */
export function getCompanyColor(company: string, companyIndex: Map<string, number>): string {
  const index = companyIndex.get(company) ?? 0;
  return COLORS[index % COLORS.length];
}

/**
 * Create company color index map
 */
export function createCompanyColorIndex(companies: string[]): Map<string, number> {
  const indexMap = new Map<string, number>();
  companies.forEach((company, index) => {
    indexMap.set(company, index);
  });
  return indexMap;
}

// ============ Canadian Site Processing ============

/**
 * Convert Degrees Minutes Seconds (DMS) to Decimal Degrees (DD)
 * Handles formats like: "45° 56' 28.865"", "-61° 3' 48.615"""
 */
export function dmsToDecimalDegrees(dmsString: string): number | undefined {
  if (!dmsString || dmsString.trim() === '') {
    return undefined;
  }
  
  // Remove quotes and extra whitespace
  const cleaned = dmsString.replace(/["']/g, ' ').trim();
  
  // Parse DMS components
  const parts = cleaned.split(/[°\'\s]+/).filter(p => p.trim() !== '');
  
  if (parts.length < 2) {
    return undefined;
  }
  
  const degrees = parseFloat(parts[0]);
  const minutes = parts.length > 1 ? parseFloat(parts[1]) : 0;
  const seconds = parts.length > 2 ? parseFloat(parts[2]) : 0;
  
  const decimal = degrees + (minutes / 60) + (seconds / 3600);
  
  return isNaN(decimal) ? undefined : decimal;
}

/**
 * Convert Web Mercator (EPSG:3857) to WGS84 (EPSG:4326)
 */
export function webMercatorToWgs84(x: number, y: number): { lat: number; lon: number } {
  const lon = (x / 20037508.34) * 180;
  let lat = (y / 20037508.34) * 180;
  lat = 180 / Math.PI * (2 * Math.atan(Math.exp(lat * Math.PI / 180)) - Math.PI / 2);
  return { lat, lon };
}

/**
 * Parse Nova Scotia latitude from DMS format
 */
export function parseNovaScotiaLatitude(dmsString: string): number | undefined {
  const decimal = dmsToDecimalDegrees(dmsString);
  return decimal;
}

/**
 * Parse Nova Scotia longitude from DMS format (always negative for Western hemisphere)
 */
export function parseNovaScotiaLongitude(dmsString: string): number | undefined {
  const decimal = dmsToDecimalDegrees(dmsString);
  return decimal !== undefined ? -Math.abs(decimal) : undefined;
}

/**
 * Build hover text for a Canadian site
 */
export function buildCanadianHoverText(site: CanadianSite): string {
  const parts: string[] = [];
  
  // Header with site name/location
  if (site.location && site.location.trim() !== '') {
    parts.push(`<b>${site.location}</b>`);
  } else if (site.site_id) {
    parts.push(`<b>Site ${site.site_id}</b>`);
  }
  
  // Common fields
  if (site.province) {
    parts.push(`Province: ${site.province}`);
  }
  if (site.company && site.company.trim() !== '') {
    parts.push(`Company: ${site.company}`);
  }
  if (site.species && site.species.trim() !== '') {
    parts.push(`Species: ${site.species}`);
  }
  if (site.species_type && site.species_type.trim() !== '') {
    parts.push(`Type: ${site.species_type}`);
  }
  
  // Province-specific fields
  if (site.cultivation_method && site.cultivation_method.trim() !== '') {
    parts.push(`Cultivation: ${site.cultivation_method}`);
  }
  if (site.site_size_ha) {
    parts.push(`Size: ${site.site_size_ha} HA`);
  }
  if (site.hectares) {
    parts.push(`Hectares: ${site.hectares}`);
  }
  if (site.activity_type && site.activity_type.trim() !== '') {
    parts.push(`Activity: ${site.activity_type}`);
  }
  if (site.site_status && site.site_status.trim() !== '') {
    parts.push(`Status: ${site.site_status}`);
  }
  if (site.county && site.county.trim() !== '') {
    parts.push(`County: ${site.county}`);
  }
  if (site.tenure && site.tenure.trim() !== '') {
    parts.push(`Tenure: ${site.tenure}`);
  }
  if (site.expiry_date && site.expiry_date.trim() !== '') {
    parts.push(`Expires: ${site.expiry_date}`);
  }
  
  return parts.join('<br>');
}

/**
 * Process raw Canadian site data from any province
 */
export function processCanadianSiteData(sites: CanadianSite[]): CanadianSite[] {
  return sites.map(site => {
    // Ensure province is set
    if (!site.province) {
      site.province = 'Unknown';
    }
    
    // Parse coordinates for Nova Scotia (DMS format)
    if (site.province.toLowerCase() === 'nova scotia' && !site.latitude) {
      // The CSV has lat/lon as DMS in string format - this would need parsing
      // but the current data structure stores them as pre-parsed numbers
    }
    
    // Generate hover text
    site.hover_text = buildCanadianHoverText(site);
    
    return site;
  });
}

/**
 * Get unique values for Canadian site filtering
 */
export function getCanadianFilterOptions(sites: CanadianSite[]): CanadianFilterOptions {
  const allSpecies: string[] = [];
  const allCompanies: string[] = [];
  const allProvinces: string[] = [];
  const allSpeciesTypes: string[] = [];
  const allActivityTypes: string[] = [];

  sites.forEach(s => {
    // Species - use extractAndCleanSpecies to handle numeric prefixes and split properly
    if (s.species && s.species.trim()) {
      const individualSpecies = extractAndCleanSpecies(s.species);
      allSpecies.push(...individualSpecies);
    }
    
    // Companies
    if (s.company && s.company.trim()) {
      allCompanies.push(...splitAndTrim(s.company));
    }
    
    // Provinces
    if (s.province && s.province.trim()) {
      allProvinces.push(s.province);
    }
    
    // Species types
    if (s.species_type && s.species_type.trim()) {
      allSpeciesTypes.push(...splitAndTrim(s.species_type));
    }
    
    // Activity types (Quebec)
    if (s.activity_type && s.activity_type.trim()) {
      allActivityTypes.push(...splitAndTrim(s.activity_type));
    }
  });

  return {
    species: [...new Set(allSpecies)].sort(),
    companies: [...new Set(allCompanies)].sort(),
    provinces: [...new Set(allProvinces)].sort(),
    species_types: [...new Set(allSpeciesTypes)].sort(),
    activity_types: [...new Set(allActivityTypes)].sort(),
  };
}

