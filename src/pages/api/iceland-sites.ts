import { NextApiRequest, NextApiResponse } from "next/types";
import Papa from 'papaparse';
import fs from 'fs';
import path from 'path';
import { IcelandSite, IcelandMapData } from '../../types/iceland-site';
import { buildIcelandHoverText, getIcelandFilterOptions } from '../../utils/dataProcessing';

export default function handler(req: NextApiRequest, res: NextApiResponse<IcelandMapData | { error: string }>) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Path to the Iceland CSV file in the aquaculture site data folder
    const csvPath = path.join(process.cwd(), 'aquaculture_site_data', 'iceland_aquaculture_sites', 'iceland-sites.csv');
    
    // Check if file exists
    if (!fs.existsSync(csvPath)) {
      return res.status(404).json({ error: 'Iceland data file not found' });
    }

    // Read and parse the CSV file
    const csvFile = fs.readFileSync(csvPath, 'utf-8');
    
    Papa.parse(csvFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const sites = results.data as IcelandSite[];
        
        // Process the data to add hover text
        const processedSites = sites.map(site => ({
          ...site,
          hover_text: buildIcelandHoverText(site)
        }));
        
        // Get filter options
        const filters = getIcelandFilterOptions(processedSites);
        
        const mapData: IcelandMapData = {
          sites: processedSites,
          filters,
          totalCount: processedSites.length,
        };
        
        res.status(200).json(mapData);
      },
      error: (error: Error) => {
        res.status(500).json({ error: `Failed to parse CSV: ${error.message}` });
      },
    });
  } catch (error) {
    console.error('Error loading Iceland site data:', error);
    res.status(500).json({ error: 'Failed to load Iceland site data' });
  }
}

