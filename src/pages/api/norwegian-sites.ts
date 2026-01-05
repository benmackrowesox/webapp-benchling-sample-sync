import { NextApiRequest, NextApiResponse } from 'next/types';
import Papa from 'papaparse';
import fs from 'fs';
import path from 'path';
import { NorwegianSite, NorwegianMapData } from '../../maps/types/site';
import { processNorwaySiteData, getNorwayFilterOptions } from '../../maps/data/processing';

export default async function handler(req: NextApiRequest, res: NextApiResponse<NorwegianMapData | { error: string }>) {
	if (req.method !== 'GET') {
		return res.status(405).json({ error: 'Method not allowed' });
	}

	try {
		// Read CSV from public folder (works on Vercel serverless - files are in /var/task)
		const csvPath = path.join(process.cwd(), 'norwegian-sites.csv');
		
		if (!fs.existsSync(csvPath)) {
			return res.status(404).json({ error: 'Norwegian data file not found' });
		}

		const csvFile = fs.readFileSync(csvPath, 'utf-8');

		Papa.parse(csvFile, {
			header: true,
			skipEmptyLines: true,
			complete: (results) => {
				const sites = results.data as NorwegianSite[];
				const processedSites = processNorwaySiteData(sites);
				const filters = getNorwayFilterOptions(processedSites);

				const mapData: NorwegianMapData = {
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
		console.error('Error loading Norwegian site data:', error);
		res.status(500).json({ error: 'Failed to load Norwegian site data' });
	}
}

