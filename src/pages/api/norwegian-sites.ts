import { NextApiRequest, NextApiResponse } from 'next/types';
import Papa from 'papaparse';
import { NorwegianSite, NorwegianMapData } from '../../maps/types/site';
import { processNorwaySiteData, getNorwayFilterOptions } from '../../maps/data/processing';

export default async function handler(req: NextApiRequest, res: NextApiResponse<NorwegianMapData | { error: string }>) {
	if (req.method !== 'GET') {
		return res.status(405).json({ error: 'Method not allowed' });
	}

	try {
		// Fetch the CSV from public folder (works on Vercel serverless)
		const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/norwegian-sites.csv`);
		
		if (!response.ok) {
			return res.status(404).json({ error: 'Norwegian data file not found' });
		}

		const csvFile = await response.text();

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

