// Unified API route for all aquaculture sites (UK, Iceland, Norway)
import { NextApiRequest, NextApiResponse } from "next/types";
import Papa from 'papaparse';
import fs from 'fs';
import path from 'path';
import { AquacultureSite, IcelandSite, NorwegianSite, MapData, IcelandMapData, NorwegianMapData } from '../types/site';
import { processUKSiteData, getUKFilterOptions, processIcelandSiteData, getIcelandFilterOptions, processNorwaySiteData, getNorwayFilterOptions } from './processing';

type MapDataResponse = MapData | IcelandMapData | NorwegianMapData | { error: string };

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

