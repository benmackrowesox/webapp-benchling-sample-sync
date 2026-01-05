import { NextApiRequest, NextApiResponse } from 'next/types';
import Papa from 'papaparse';
import fs from 'fs';
import path from 'path';
import { AquacultureSite, MapData } from '../../types/site';
import { processSiteData, getFilterOptions } from '../../utils/dataProcessing';

export default function handler(req: NextApiRequest, res: NextApiResponse<MapData | { error: string }>) {
	if (req.method !== 'GET') {
		return res.status(405).json({ error: 'Method not allowed' });
	}

	try {
		const csvPath = path.join(process.cwd(), 'Norweigan_aquaculture_site_locations_030126.csv');
		if (!fs.existsSync(csvPath)) {
			return res.status(404).json({ error: 'Norwegian data file not found' });
		}

		const csvFile = fs.readFileSync(csvPath, 'utf-8');

		Papa.parse(csvFile, {
			header: true,
			skipEmptyLines: true,
			complete: (results) => {
				const sites = results.data as AquacultureSite[];
				const processedSites = processSiteData(sites);
				const filters = getFilterOptions(processedSites);

				const mapData: MapData = {
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
