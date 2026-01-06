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
		// On Vercel, files from public/ are copied to the root of the Lambda (/var/task)
		// On local dev, they stay in public/ subfolder
		const possiblePaths = [
			path.join(process.cwd(), 'Norweigan_aquaculture_site_locations_030126.csv'), // Root of project
			path.join(process.cwd(), '..', 'public', 'Norweigan_aquaculture_site_locations_030126.csv'), // Local dev alternative
			path.join(process.cwd(), 'norwegian-sites.csv'), // Legacy fallback
			path.join(process.cwd(), '..', 'public', 'norwegian-sites.csv'), // Legacy fallback
		];
		
		let csvPath: string | null = null;
		for (const p of possiblePaths) {
			if (fs.existsSync(p)) {
				csvPath = p;
				break;
			}
		}
		
		if (!csvPath) {
			return res.status(404).json({ error: 'Norwegian data file not found' });
		}

		const csvFile = fs.readFileSync(csvPath, 'utf-8');

		// Strip BOM (Byte Order Mark) from the beginning of the file if present
		const csvContent = csvFile.startsWith('\uFEFF') ? csvFile.slice(1) : csvFile;

		Papa.parse(csvContent, {
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

