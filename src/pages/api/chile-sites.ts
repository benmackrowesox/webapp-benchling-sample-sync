import { NextApiRequest, NextApiResponse } from 'next/types';
import fs from 'fs';
import path from 'path';
import * as XLSX from 'xlsx';
import { ChileSite, ChileMapData, ChileFilterOptions } from '../../types/chile-site';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ChileMapData | { error: string }>) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Path to the Chile Excel file
    const excelPath = path.join(process.cwd(), 'aquaculture_site_data', 'chile_aquaculture_site_100126', 'aquaculturesites_chile_100126.xlsx');

    // Check if file exists
    if (!fs.existsSync(excelPath)) {
      return res.status(404).json({ error: 'Chile data file not found' });
    }

    // Read and parse the Excel file
    const workbook = XLSX.readFile(excelPath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rawData = XLSX.utils.sheet_to_json(worksheet);

    // Process the data
    const sites = processChileData(rawData);
    
    // Generate filter options
    const filters = getChileFilterOptions(sites);

    const mapData: ChileMapData = {
      sites,
      filters,
      totalCount: sites.length,
    };

    res.status(200).json(mapData);
  } catch (error) {
    console.error('Error loading Chile site data:', error);
    res.status(500).json({ error: 'Failed to load Chile site data' });
  }
}

/**
 * Process raw Chile site data from Excel
 */
function processChileData(rawData: any[]): ChileSite[] {
  return rawData.map((row, index) => {
    // Extract and normalize data
    const site: ChileSite = {
      id: `chile-${index}`,
      site_id: row['N°'] || row['Numero'] || row['id'] || row['ID'] || String(index),
      concession_number: row['N° CONCESIÓN'] || row['Concesion'] || row['Concession Number'] || '',
      site_name: row['NOMBRE SITIO'] || row['Nombre Sitio'] || row['Site Name'] || row['Sitio'] || '',
      location: row['UBICACIÓN'] || row['Ubicacion'] || row['Location'] || row['Direccion'] || '',
      commune: row['COMUNA'] || row['Comuna'] || row['Commune'] || '',
      region: row['REGIÓN'] || row['Region'] || row['REGION'] || '',
      latitude: parseCoordinate(row['LATITUD'] || row['Latitud'] || row['Lat'] || row['latitude']),
      longitude: parseCoordinate(row['LONGITUD'] || row['Longitud'] || row['Lon'] || row['Longitude']),
      company: row['TITULAR'] || row['Titular'] || row['Company'] || row['Empresa'] || '',
      holder: row['TITULAR'] || row['Titular'] || '',
      operator: row['OPERADOR'] || row['Operador'] || row['Operator'] || '',
      species: extractSpecies(row['ESPECIE'] || row['Especie'] || row['Species'] || ''),
      species_type: row['TIPO ESPECIE'] || row['Tipo Especie'] || row['Species Type'] || '',
      concession_type: row['TIPO CONCESIÓN'] || row['Tipo Concesion'] || row['Concession Type'] || '',
      status: normalizeStatus(row['ESTADO TRÁMITE'] || row['Estado Tramite'] || row['Status'] || row['Estado'] || ''),
      status_description: row['DETALLE ESTADO'] || row['Detalle Estado'] || row['Status Detail'] || '',
      activity_type: row['TIPO ACTIVIDAD'] || row['Tipo Actividad'] || row['Activity Type'] || '',
      business_type: row['GIRO'] || row['Giro'] || row['Business Type'] || '',
      registration_date: row['FECHA INSCRIPCIÓN'] || row['Fecha Inscripcion'] || row['Registration Date'] || '',
      expiration_date: row['FECHA VENCIMIENTO'] || row['Fecha Vencimiento'] || row['Expiration Date'] || '',
      administrative_resolution: row['RESOLUCIÓN'] || row['Resolucion'] || row['Resolution'] || '',
      area_ha: parseNumber(row['SUPERFICIE (ha)'] || row['Superficie (ha)'] || row['Area (HA)'] || row['Hectareas'] || ''),
      area_utilized_ha: parseNumber(row['SUPERFICIE UTILIZADA (ha)'] || row['Superficie Utilizada (ha)'] || row['Area Utilized (HA)'] || ''),
    };

    // Generate hover text
    site.hover_text = buildChileHoverText(site);

    return site;
  });
}

/**
 * Parse coordinate value
 */
function parseCoordinate(value: string | number | undefined): number | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  
  if (typeof value === 'number') {
    return isNaN(value) ? undefined : value;
  }
  
  const cleaned = String(value).replace(/[^\d.\-]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? undefined : parsed;
}

/**
 * Parse number value
 */
function parseNumber(value: string | number | undefined): number | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  
  if (typeof value === 'number') {
    return isNaN(value) ? undefined : value;
  }
  
  // Handle European number format (commas as decimal separators)
  const cleaned = String(value).replace(/,/g, '.').replace(/[^\d.]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? undefined : parsed;
}

/**
 * Extract species from comma/semicolon separated string
 */
function extractSpecies(speciesString: string): string[] {
  if (!speciesString || !speciesString.trim()) return [];
  return speciesString
    .split(/[,;&]/)
    .map(s => cleanSpeciesName(s.trim()))
    .filter(s => s !== '' && s !== 'N/A' && s.toLowerCase() !== 'unknown');
}

/**
 * Clean up species name
 */
function cleanSpeciesName(speciesName: string): string {
  if (!speciesName) return '';
  
  // Remove leading numbers with optional colon and space
  let cleaned = speciesName.replace(/^\d+:\s*/, '').replace(/^\d+\s*/, '').trim();
  
  // Capitalize first letter of each word
  return cleaned
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Normalize status values to consistent format
 */
function normalizeStatus(status: string): string {
  if (!status) return 'Unknown';
  
  const normalized = status.toLowerCase().trim();
  
  if (normalized.includes('vigente') || normalized.includes('vigente') || normalized === 'active') {
    return 'Vigente';
  }
  if (normalized.includes('tramite') || normalized.includes('trámite') || normalized === 'pending') {
    return 'En Trámite';
  }
  if (normalized.includes('caduco') || normalized.includes('caducado') || normalized === 'expired') {
    return 'Caduco';
  }
  if (normalized.includes('renovacion') || normalized.includes('renovación') || normalized === 'renewal') {
    return 'Renovación';
  }
  if (normalized.includes('suspendido') || normalized === 'suspended') {
    return 'Suspendido';
  }
  if (normalized.includes('archivado') || normalized === 'archived') {
    return 'Archivado';
  }
  
  return status;
}

/**
 * Build hover text for a Chile site
 */
function buildChileHoverText(site: ChileSite): string {
  const parts: string[] = [];
  
  // Header with site name
  if (site.site_name && site.site_name.trim() !== '') {
    parts.push(`<b>${site.site_name}</b>`);
  } else if (site.concession_number) {
    parts.push(`<b>Concesión ${site.concession_number}</b>`);
  }
  
  // Location
  if (site.location && site.location.trim() !== '') {
    parts.push(`Location: ${site.location}`);
  }
  if (site.commune) {
    parts.push(`Commune: ${site.commune}`);
  }
  if (site.region) {
    parts.push(`Region: ${site.region}`);
  }
  
  // Company
  if (site.company && site.company.trim() !== '') {
    parts.push(`Holder: ${site.company}`);
  }
  if (site.operator && site.operator.trim() !== '' && site.operator !== site.company) {
    parts.push(`Operator: ${site.operator}`);
  }
  
  // Species
  if (site.species && site.species.length > 0) {
    parts.push(`Species: ${site.species.join(', ')}`);
  }
  
  // Status and type
  if (site.status) {
    parts.push(`Status: ${site.status}`);
  }
  if (site.concession_type) {
    parts.push(`Concession Type: ${site.concession_type}`);
  }
  if (site.activity_type) {
    parts.push(`Activity: ${site.activity_type}`);
  }
  
  // Area
  if (site.area_ha) {
    parts.push(`Area: ${site.area_ha} ha`);
  }
  if (site.area_utilized_ha) {
    parts.push(`Utilized: ${site.area_utilized_ha} ha`);
  }
  
  // Dates
  if (site.registration_date) {
    parts.push(`Registered: ${site.registration_date}`);
  }
  if (site.expiration_date) {
    parts.push(`Expires: ${site.expiration_date}`);
  }
  
  return parts.join('<br>');
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
    // Species
    if (s.species && s.species.length > 0) {
      allSpecies.push(...s.species);
    }
    
    // Companies (holder)
    if (s.company && s.company.trim() !== '' && s.company !== 'N/A') {
      allCompanies.push(s.company);
    }
    
    // Statuses
    if (s.status && s.status.trim() !== '') {
      allStatuses.push(s.status);
    }
    
    // Regions
    if (s.region && s.region.trim() !== '') {
      allRegions.push(s.region);
    }
    
    // Concession types
    if (s.concession_type && s.concession_type.trim() !== '') {
      allConcessionTypes.push(s.concession_type);
    }
    
    // Activity types
    if (s.activity_type && s.activity_type.trim() !== '') {
      allActivityTypes.push(s.activity_type);
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

