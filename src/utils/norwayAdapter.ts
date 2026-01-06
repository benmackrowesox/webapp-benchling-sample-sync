// Adapter for loading Norwegian aquaculture site data from CSV
import { NorwegianSite, NorwegianFilterOptions, NorwegianMapData } from '../maps/types/site';
import { getNorwayFilterOptions } from '../maps/data/processing';

/**
 * Parse a number from a string, handling commas as thousand separators
 */
function parseNumber(value: string | undefined): number {
  if (!value || !value.trim()) return 0;
  const cleaned = value.replace(/,/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

export function parseNorwegianCSV(csvText: string): NorwegianSite[] {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) {
    throw new Error('CSV file appears to be empty or has no header row');
  }
  const header = parseCSVLine(lines[0]);
  const headerMap = new Map<string, number>();
  header.forEach((col, idx) => {
    headerMap.set(col.trim().toLowerCase(), idx);
  });
  const sites: NorwegianSite[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const values = parseCSVLine(line);
    const site: NorwegianSite = {
      site_id: values[headerMap.get('site id') || 0] || '',
      site_name: values[headerMap.get('name') || 1] || '',
      site_status: values[headerMap.get('site status') || 2] || '',
      approval_date: values[headerMap.get('approval date') || 3] || '',
      approval_type: values[headerMap.get('approval type') || 4] || '',
      site_capacity: parseNumber(values[headerMap.get('site capacity') || 5]),
      temporary_capacity: parseNumber(values[headerMap.get('temporary_capacity') || 6]),
      capacity_unit_type: values[headerMap.get('capacity_unit_type') || 7] || '',
      placement: values[headerMap.get('placement') || 8] || '',
      water_type: values[headerMap.get('water_type') || 9] || '',
      site_details: values[headerMap.get('site_details') || 10] || '',
      county: values[headerMap.get('county') || 11] || '',
      municipality_id: values[headerMap.get('municipality_id') || 12] || '',
      municipality: values[headerMap.get('municipality') || 13] || '',
      production_area_code: values[headerMap.get('production_area_code') || 14] || '',
      latitude: parseNumber(values[headerMap.get('latitude') || 15]) || undefined,
      longitude: parseNumber(values[headerMap.get('longitude') || 16]) || undefined,
      symbol: values[headerMap.get('symbol') || 17] || '',
      species: values[headerMap.get('species') || 18] || '',
      company: values[headerMap.get('company') || 19] || '',
      site_url: values[headerMap.get('site_url') || 20] || '',
      external_site_url: values[headerMap.get('external_site_url') || 21] || '',
      permits: values[headerMap.get('permits') || 22] || '',
      purpose: values[headerMap.get('purpose') || 23] || '',
      production_method: values[headerMap.get('production_method') || 24] || '',
    };
    sites.push(site);
  }
  return sites;
}

function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current.trim());
  return values;
}

export async function loadNorwegianMapData(csvPath: string): Promise<NorwegianMapData> {
  try {
    const response = await fetch(csvPath);
    if (!response.ok) {
      throw new Error(`Failed to fetch CSV file: ${response.status} ${response.statusText}`);
    }
    const csvText = await response.text();
    const sites = parseNorwegianCSV(csvText);
    const validSites = sites.filter(site =>
      site.latitude !== undefined &&
      site.longitude !== undefined &&
      !isNaN(site.latitude as number) &&
      !isNaN(site.longitude as number)
    );
    const filters = getNorwayFilterOptions(validSites);
    return {
      sites: validSites,
      filters,
      totalCount: validSites.length,
    };
  } catch (error) {
    console.error('Error loading Norwegian map data:', error);
    throw error;
  }
}

