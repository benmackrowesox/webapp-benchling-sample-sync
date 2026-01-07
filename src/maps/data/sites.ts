// Unified API route for all aquaculture sites (UK, Iceland, Norway, Canada)
import { NextApiRequest, NextApiResponse } from "next/types";
import Papa from 'papaparse';
import fs from 'fs';
import path from 'path';
import { AquacultureSite, IcelandSite, NorwegianSite, MapData, IcelandMapData, NorwegianMapData, CanadianSite, CanadianMapData } from '../types/site';
import { processUKSiteData, getUKFilterOptions, processIcelandSiteData, getIcelandFilterOptions, processNorwaySiteData, getNorwayFilterOptions, processCanadianSiteData, getCanadianFilterOptions, webMercatorToWgs84, parseNovaScotiaLatitude, parseNovaScotiaLongitude } from './processing';

type MapDataResponse = MapData | IcelandMapData | NorwegianMapData | CanadianMapData | { error: string };

export default function handler(req: NextApiRequest, res: NextApiResponse<MapDataResponse>) {
  const { region = 'uk' } = req.query;
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const regionName = (region as string).toLowerCase();

  try {
    let csvPath: string;
    
    switch (regionName) {
      case 'iceland':
        csvPath = path.join(process.cwd(), 'public', 'iceland-sites.csv');
        break;
      case 'norway':
        csvPath = path.join(process.cwd(), 'Norweigan_aquaculture_site_locations_030126.csv');
        break;
      case 'canada':
      case 'britishcolumbia':
      case 'newbrunswick':
      case 'newfoundland':
      case 'novascotia':
      case 'quebec':
        csvPath = path.join(process.cwd(), 'canadian_aquaculture_sites_070126', `${regionName}_aquaculture_sites_070126.csv`);
        if (!fs.existsSync(csvPath)) {
          // Try alternate filename for newfoundland
          if (regionName === 'newfoundland') {
            csvPath = path.join(process.cwd(), 'canadian_aquaculture_sites_070126', 'newfoundland_aquaculture_site_070126.csv');
          } else if (regionName === 'novascotia') {
            csvPath = path.join(process.cwd(), 'canadian_aquaculture_sites_070126', 'nova_scotia_aqauaculture_sites_070126.csv');
          } else if (regionName === 'quebec') {
            csvPath = path.join(process.cwd(), 'canadian_aquaculture_sites_070126', 'quebec_marine_aquaculture_sites_2017_070126.csv');
          }
        }
        break;
      case 'uk':
      default:
        csvPath = path.join(process.cwd(), 'public', 'aquaculture-sites.csv');
        break;
    }

    // Check if file exists
    if (!fs.existsSync(csvPath)) {
      return res.status(404).json({ error: `Data file not found for region: ${regionName}` });
    }

    // Read and parse the CSV file
    const csvFile = fs.readFileSync(csvPath, 'utf-8');
    
    Papa.parse(csvFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        switch (regionName) {
          case 'iceland':
            handleIcelandSites(results.data, res);
            break;
          case 'norway':
            handleNorwaySites(results.data, res);
            break;
          case 'canada':
          case 'britishcolumbia':
          case 'newbrunswick':
          case 'newfoundland':
          case 'novascotia':
          case 'quebec':
            handleCanadianSites(results.data, res, regionName);
            break;
          case 'uk':
          default:
            handleUKSites(results.data, res);
            break;
        }
      },
      error: (error: Error) => {
        res.status(500).json({ error: `Failed to parse CSV: ${error.message}` });
      },
    });
  } catch (error) {
    console.error('Error loading site data:', error);
    res.status(500).json({ error: 'Failed to load site data' });
  }
}

function handleUKSites(data: any[], res: NextApiResponse<MapDataResponse>) {
  const sites = data as AquacultureSite[];
  const processedSites = processUKSiteData(sites);
  const filters = getUKFilterOptions(processedSites);
  
  const mapData: MapData = {
    sites: processedSites,
    filters,
    totalCount: processedSites.length,
  };
  
  res.status(200).json(mapData);
}

function handleIcelandSites(data: any[], res: NextApiResponse<MapDataResponse>) {
  const sites = data as IcelandSite[];
  const processedSites = processIcelandSiteData(sites);
  const filters = getIcelandFilterOptions(processedSites);
  
  const mapData: IcelandMapData = {
    sites: processedSites,
    filters,
    totalCount: processedSites.length,
  };
  
  res.status(200).json(mapData);
}

function handleNorwaySites(data: any[], res: NextApiResponse<MapDataResponse>) {
  const sites = data as NorwegianSite[];
  const processedSites = processNorwaySiteData(sites);
  const filters = getNorwayFilterOptions(processedSites);
  
  const mapData: NorwegianMapData = {
    sites: processedSites,
    filters,
    totalCount: processedSites.length,
  };
  
  res.status(200).json(mapData);
}

function handleCanadianSites(data: any[], res: NextApiResponse<MapDataResponse>, regionName: string) {
  // Transform raw CSV data to CanadianSite format
  const sites: CanadianSite[] = data.map((row: any) => {
    const site: CanadianSite = {
      site_id: row.site_ID || row.site_id || '',
      company: row.company_person || row.company || '',
      species: row.species || '',
      species_type: row.species_type || '',
      location: row.location || row.site_name || '',
      province: row.region || row.province || getProvinceName(regionName),
      latitude: undefined,
      longitude: undefined,
    };
    
    // Parse coordinates based on province format
    if (regionName === 'britishcolumbia' || regionName === 'canada') {
      // British Columbia - already in decimal degrees
      if (row.latitude && row.longitude) {
        site.latitude = parseFloat(row.latitude);
        site.longitude = parseFloat(row.longitude);
      }
      site.license_type = row.license_type;
      site.operating_group = row.Operating_group;
    } else if (regionName === 'newbrunswick') {
      // New Brunswick - no coordinates in source, UTM would need conversion
      site.authorization_type = row.AUTHORIZATION_TYPE;
      site.expiry_date = row['Expiry Date of Lease/Permit/Licence'];
      site.cultivation_method = row['Cultivation Method'];
      site.site_size_ha = parseFloat(row['Site Size (HA)']);
    } else if (regionName === 'newfoundland') {
      // Newfoundland - Web Mercator coordinates
      if (row.latitude && row.longitude) {
        const mercatorLat = parseFloat(row.latitude);
        const mercatorLon = parseFloat(row.longitude);
        if (!isNaN(mercatorLat) && !isNaN(mercatorLon)) {
          const coords = webMercatorToWgs84(mercatorLon, mercatorLat);
          site.latitude = coords.lat;
          site.longitude = coords.lon;
        }
      }
      site.tenure = row.TENURE;
      site.licence_type = row.LICENCE_TYPE;
      site.operation_type = row.OPERATION_TYPE;
      site.status = row.STATUS;
      site.contact = row.CONTACT;
      site.address = (row.ADDRESS1 || '') + (row.ADDRESS2 ? ', ' + row.ADDRESS2 : '');
      site.community = row.COMMUNITY;
      site.postal_code = row.POSTAL;
    } else if (regionName === 'novascotia') {
      // Nova Scotia - DMS format
      if (row.latitude && typeof row.latitude === 'string') {
        site.latitude = parseNovaScotiaLatitude(row.latitude);
      }
      if (row.longitude && typeof row.longitude === 'string') {
        site.longitude = parseNovaScotiaLongitude(row.longitude);
      }
      site.county = row.County;
      site.site_status = row.SiteStatus;
      site.nav_chart = row.NavChart;
      site.hectares = parseFloat(row.Hectares);
    } else if (regionName === 'quebec') {
      // Quebec - already has centroid coordinates
      if (row['Centroid Latitude'] && row['Centroid Longitude']) {
        site.latitude = parseFloat(row['Centroid Latitude']);
        site.longitude = parseFloat(row['Centroid Longitude']);
      }
      site.permit_number = row['Permit Number'];
      site.research_site = row['Research Site'];
      site.operating_sector = row['Operating Sector'];
      site.permit_issued = row['Permit Issued On'];
      site.permit_expired = row['Permit Expired On'];
      site.activity_type = row['Activity Type'];
      site.area_ha = parseFloat(row['Area (HA)']);
      site.hectares_used = parseFloat(row['Hectares Used']);
      site.occupancy_percent = parseFloat(row['Occupancy (%)']);
      site.footprint_wkt = row['Footprint WKT'];
    }
    
    return site;
  });
  
  const processedSites = processCanadianSiteData(sites);
  const filters = getCanadianFilterOptions(processedSites);
  
  const mapData: CanadianMapData = {
    sites: processedSites,
    filters,
    totalCount: processedSites.length,
  };
  
  res.status(200).json(mapData);
}

/**
 * Get the display name for a Canadian province
 */
function getProvinceName(regionName: string): string {
  const provinceNames: Record<string, string> = {
    'britishcolumbia': 'British Columbia',
    'newbrunswick': 'New Brunswick',
    'newfoundland': 'Newfoundland',
    'novascotia': 'Nova Scotia',
    'quebec': 'Quebec',
    'canada': 'Canada',
  };
  return provinceNames[regionName] || regionName;
}

