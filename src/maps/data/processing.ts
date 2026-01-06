// Data processing utilities for aquaculture site maps

import proj4 from 'proj4';
import { AquacultureSite, IcelandSite, NorwegianSite, NorwegianFilterOptions } from '../types/site';

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

