// Utility functions for data processing and coordinate transformation

import proj4 from 'proj4';
import { AquacultureSite } from '../types/site';
import { IcelandSite } from '../types/iceland-site';

// Define the coordinate transformation: British National Grid (EPSG:27700) → WGS84 (EPSG:4326)
// This matches the transformation used in the original Python script
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
 * Uses the proj4 library with the correct transformation parameters
 * This matches the pyproj.Transformer used in the original Python script
 */
export function osGridToLatLon(easting: number, northing: number): { lat: number; lon: number } {
  // proj4 uses (x, y) = (easting, northing) order
  const [lon, lat] = proj4(BNG_TO_WGS84, 'EPSG:4326', [easting, northing]);
  return { lat, lon };
}

/**
 * Process raw CSV data and add transformed coordinates
 */
export function processSiteData(sites: AquacultureSite[]): AquacultureSite[] {
  return sites.map(site => {
    if (site.easting && site.northing && !site.latitude) {
      const { lat, lon } = osGridToLatLon(Number(site.easting), Number(site.northing));
      site.latitude = lat;
      site.longitude = lon;
    }
    site.hover_text = buildHoverText(site);
    return site;
  });
}

/**
 * Build hover text for a site
 */
export function buildHoverText(site: AquacultureSite): string {
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
 * Get unique values for filtering
 */
export function getFilterOptions(sites: AquacultureSite[]) {
  // Helper to split fields that may contain multiple values separated by comma/semicolon/pipe
  function splitAndTrim(value?: string): string[] {
    if (!value || !value.trim()) return [];
    return value
      .split(/[;,|]/)
      .map(v => v.trim())
      .filter(v => v !== '' && v !== 'N/A');
  }

  const allSpecies: string[] = [];
  const allCompanies: string[] = [];
  const allWatertypes: string[] = [];
  const allRegions: string[] = [];

  sites.forEach(s => {
    if (s.species && s.species.trim()) {
      // species fields can contain comma-separated lists like "Char, Salmon"
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

  const species = [...new Set(allSpecies)].sort();
  const companies = [...new Set(allCompanies)].sort();
  const watertypes = [...new Set(allWatertypes)].sort();
  const regions = [...new Set(allRegions)].sort();

  return { species, companies, watertypes, regions };
}

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

// Iceland-specific functions

/**
 * Extract individual species from a comma-separated species string
 * e.g., "Char, Salmon" -> ["Char", "Salmon"]
 */
function extractSpecies(speciesString: string): string[] {
  if (!speciesString || !speciesString.trim()) {
    return [];
  }
  return speciesString.split(',').map(s => s.trim()).filter(s => s !== '');
}

/**
 * Check if a site produces a specific species
 * Returns true if the site's species list contains the target species
 */
export function siteProducesSpecies(site: IcelandSite, targetSpecies: string): boolean {
  if (!site.species || !site.species.trim()) {
    return false;
  }
  const siteSpecies = extractSpecies(site.species);
  return siteSpecies.some(s => s.toLowerCase() === targetSpecies.toLowerCase());
}

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
 * Get unique values for Iceland filtering
 * Extracts individual species from combined strings (e.g., "Char, Salmon" -> "Char", "Salmon")
 */
export function getIcelandFilterOptions(sites: IcelandSite[]) {
  const companies = [...new Set(sites.map(s => s.company).filter(c => c && c.trim() !== ''))].sort();
  
  // Extract all individual species and create a unique sorted list
  const allSpecies: string[] = [];
  sites.forEach(site => {
    if (site.species && site.species.trim()) {
      const individualSpecies = extractSpecies(site.species);
      allSpecies.push(...individualSpecies);
    }
  });
  const species = [...new Set(allSpecies)].sort();
  
  const types = [...new Set(sites.map(s => s.type).filter(t => t && t.trim() !== ''))].sort();
  
  return { companies, species, types };
}
