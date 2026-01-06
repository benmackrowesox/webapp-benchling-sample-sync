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

/**
 * Norwegian to English species translation dictionary
 */
export const NORWEGIAN_SPECIES_TRANSLATIONS: Record<string, string> = {
  // Salmonids (Laksefisker)
  'Laks': 'Salmon',
  'Regnbueørret': 'Rainbow Trout',
  'Ørret': 'Trout',
  'Røye': 'Arctic Char',
  'Annen røye': 'Other Char',
  'Fjærerur': 'Surf Clam',
  
  // Flatfish (Flatfisk)
  'Kveite': 'Halibut',
  'Piggvar': 'Turbot',
  'Rødspette': 'Plaice',
  'Tunge': 'Sole',
  'Flekksteinbit': 'Spotted Catfish',
  'Gråsteinbit': 'Atlantic Catfish',
  'Gapeflyndre': 'Lemon Sole',
  
  // Cod family (Torskefisker)
  'Torsk': 'Cod',
  'Sei': 'Saithe',
  'Lange': 'Ling',
  'Lyr': 'Pollock',
  'Lysing': 'Hake',
  'Brosme': 'Tusk',
  'Paddetorsk': 'Paddock',
  
  // Cleaner fish / Other species (Rensefisk og andre)
  'Rognkjeks': 'Lumpfish',
  'Berggylt': 'Corkwing Wrasse',
  'Bergnebb': 'Ballan Wrasse',
  'Grønngylt': 'Green Wrasse',
  'Gressgylt': 'Cuckoo Wrasse',
  'Brungylt': 'Bronze Wrasse',
  'Blåstål': 'Blue Streak Wrasse',
  'Rødnebb': 'Red Wrasse',
  
  // Shellfish (Skalldyr)
  'Blåskjell': 'Blue Mussel',
  'Østers': 'Oyster',
  'Hummer': 'Lobster',
  'Taskekrabbe': 'Edible Crab',
  'Kongekrabbe': 'King Crab',
  'Kamskjell': 'Scallop',
  'Sjøkreps': 'Norway Lobster',
  'Reke': 'Shrimp',
  
  // Marine invertebrates (Marine virvelløse dyr)
  'Krill': 'Krill',
  'Sjøpinnsvin': 'Sea Urchin',
  'Drøbaksjøpiggsvin': 'Purple Sea Urchin',
  'Svabergsjøpiggsvin': 'Green Sea Urchin',
  'Piggkorstroll': 'Sea Star',
  'Piggsolstjerne': 'Sun Star',
  
  // Seaweed (Alger)
  'Sukkertare': 'Sugar Kelp',
  'Fingertare': 'Digitated Kelp',
  'Butare': 'Leaf Kelp',
  'Stortare': 'Oarweed',
  'Grisetang': 'Chambered Kelp',
  'Grisetangdokke': 'Divided Kelp',
  'Bladtare': 'Tangle',
  'Havsalat': 'Sea Lettuce',
  'Krusflik': 'Spiraled Wrack',
  'Sauetang': 'Egg Wrack',
  'Vanlig fjærehinne': 'Common Periwinkle',
  'Fjærehinne uspes.': 'Periwinkle (unspecified)',
  'Sekkdyr': 'Sea Squirt',
  'Sekkdyr, uspes.': 'Sea Squirt (unspecified)',
  'Grønnsekkdyr': 'Green Sea Squirt',
  'Blæretang': 'Bladder Wrack',
  
  // Other species (Andre arter)
  'Hestmakrell': 'Horse Mackerel',
  'Makrell': 'Mackerel',
  'Makrellstørje': 'Atlantic Mackerel',
  'Brisling': 'Sprat',
  'Lodde': 'Capelin',
  'Kolmule': 'Blue Whiting',
  'Havabbor': 'European Seabass',
  'Havål': 'Sea Lamprey',
  'Ål': 'Eel',
  'Hyse': 'Haddock',
  'Lomre': 'Megrim',
  'Breiflabb': 'Monksfish',
  'Kuskjell': 'Otter Shell',
  'Butt sandskjell': 'Bivalve',
  'O-skjell': 'Oyster',
  'Haneskjell': 'Cockle',
  'Harpeskjell': 'Harp Shell',
  'Rutet teppeskjell': 'Checkered Carpet Shell',
  'Sandskjell': 'Sand Shell',
  'Saueskjell uspes.': 'Limpet (unspecified)',
  'Dvergreke': 'Pistol Shrimp',
  'Blomsterreke': 'Flower Shrimp',
  'Blåkveite': 'Greenland Halibut',
  'Krokulke': 'Rockfish',
  'Dvergulke': 'Pygmy Sculpin',
  'Glattulke': 'Smooth Sculpin',
  'Nordlig knurrulke': 'Northern Searobin',
  'Nordlig lysprikkfisk': 'Northern Lanternfish',
  'Polartorsk': 'Polar Cod',
  'Anemoneeremittkreps': 'Anemone Hermit Crab',
  'Annen røye': 'Other Char',
  'Ansjos': 'Anchovy',
  'Marmorkrabbe': 'Marbled Crab',
  'Gitarpyntekrabbe': 'Guitar Crab',
  'Dvergsvømmekrabbe': 'Dwarf Swimming Crab',
  'Langfotkrabbe': 'Long-legged Crab',
  'Muddingtrollkreps': 'Mud Hopper',
  'Nipigget stingsild': 'Nine-spined Stickleback',
  'Edelkreps (Freshwater)': 'Noble Crayfish',
  'Reke av Penaeusslekten': 'Penaeus Shrimp',
  'Rødpølse': 'Red Whelk',
  'Sjøpiggsvin uspes.': 'Sea Urchin (unspecified)',
  'Acartia clausi **': 'Acartia clausi (Copepod)',
  'Acartia longiremis **': 'Acartia longiremis (Copepod)',
  'Acartia tonsa **': 'Acartia tonsa (Copepod)',
  'Andre krepsdyr': 'Other Crustaceans',
  'Anemoneeremittkreps': 'Anemone Hermit Crab',
  'Apherusa glacialis **': 'Apherusa glacialis (Amphipod)',
  'Arctic sea ice amphipod*': 'Arctic Sea Ice Amphipod',
  'Arktisk knurrulke': 'Arctic Searobin',
  'Calanus glacialis **': 'Calanus glacialis (Copepod)',
  'Calanus helgolandicus **': 'Calanus helgolandicus (Copepod)',
  'Calanus hyperboreus **': 'Calanus hyperboreus (Copepod)',
  'Chalky macoma *': 'Chalky Macoma (Bivalve)',
  'Common shrimp *': 'Common Shrimp',
  'Dvergreke': 'Dwarf Shrimp',
  'Dvergulke': 'Pygmy Sculpin',
  'Dypvannsreke': 'Deep Water Shrimp',
  'Eurytemora spp **': 'Eurytemora spp. (Copepod)',
  'Eusirus holmii **': 'Eusirus holmii (Amphipod)',
  'Gammarus setosus **': 'Gammarus setosus (Amphipod)',
  'Hairy cockle *': 'Hairy Cockle',
  'Kamuflasjereke': 'Camouflage Shrimp',
  'Knivskjell': 'Razor Shell',
  'Metridia longa **': 'Metridia longa (Copepod)',
  'Oithona similis **': 'Oithona similis (Copepod)',
  'Onisimus glacialis **': 'Onisimus glacialis (Amphipod)',
  'Onisimus litoralis**': 'Onisimus litoralis (Amphipod)',
  'Paraeuchaeta barbata **': 'Paraeuchaeta barbata (Copepod)',
  'Pseudocalanus acuspes **': 'Pseudocalanus acuspes (Copepod)',
  'Pseudocalanus minutus **': 'Pseudocalanus minutus (Copepod)',
  'Bernakereremittkreps': 'Bernacle Hermit Crab',
  'Martaum': "Mare's Tail",
  'Knapptang': 'Knopweed',
};

/**
 * Translate a single species name from Norwegian to English
 */
export function translateSpecies(norwegianName: string): string {
  if (!norwegianName || !norwegianName.trim()) return '';
  return NORWEGIAN_SPECIES_TRANSLATIONS[norwegianName.trim()] || norwegianName.trim();
}

/**
 * Translate a comma/semicolon/pipe-separated species string to English
 */
export function translateSpeciesString(speciesString: string): string {
  if (!speciesString || !speciesString.trim()) return '';
  
  // Split by comma, semicolon, or pipe
  const species = speciesString
    .split(/[;,|]/)
    .map(s => s.trim())
    .filter(s => s !== '');
  
  const translated = species.map(translateSpecies);
  
  // Rejoin with comma
  return translated.join(', ');
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
      species: translateSpeciesString(values[headerMap.get('species') || 18] || ''),
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

