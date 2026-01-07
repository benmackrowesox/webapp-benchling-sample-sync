/**
 * Translate Quebec Marine Aquaculture CSV from French to English
 * 
 * Usage: node scripts/translate-quebec-csv.js
 */

const fs = require('fs');
const path = require('path');

const INPUT_FILE = path.join(__dirname, '../canadian_aquaculture_sites_070126/quebec_marine_aquaculture_sites_2017_070126.csv');
const OUTPUT_FILE = path.join(__dirname, '../canadian_aquaculture_sites_070126/quebec_marine_aquaculture_sites_2017_070126_translated.csv');

// Column header translations (French -> English)
const HEADER_TRANSLATIONS = {
  '# de permis': 'Permit Number',
  'Site de recherche': 'Research Site',
  "Nom d'entreprise": 'Company Name',
  'Région': 'Region',
  "SECTEUR D'EXPLOITATION": 'Operating Sector',
  'PERMIS ÉMIS LE': 'Permit Issued On',
  'PERMIS ÉCHU LE': 'Permit Expired On',
  'ESPÈCE AUTORISÉE': 'Authorized Species',
  "TYPE D'ACTIVITÉ": 'Activity Type',
  'SUPERFICIE (HA)': 'Area (HA)',
  'HECTARES UTILISÉS': 'Hectares Used',
  'OCCUPATION (%)': 'Occupancy (%)',
  'footprintWKT': 'Footprint WKT',
  'LATITUDE 1': 'Latitude 1',
  'LONGITUDE 1': 'Longitude 1',
  'LATITUDE 2': 'Latitude 2',
  'LONGITUDE 2': 'Longitude 2',
  'LATITUDE 3': 'Latitude 3',
  'LONGITUDE 3': 'Longitude 3',
  'LATITUDE 4': 'Latitude 4',
  'LONGITUDE 4': 'Longitude 4',
  'LATITUDE 5': 'Latitude 5',
  'LONGITUDE 5': 'Longitude 5',
  'LATITUDE 6': 'Latitude 6',
  'LONGITUDE 6': 'Longitude 6',
  'LATITUDE 7': 'Latitude 7',
  'LONGITUDE 7': 'Longitude 7',
  'LATITUDE Centroide': 'Centroid Latitude',
  'LONGITUDE Centroide': 'Centroid Longitude'
};

// Region translations
const REGION_TRANSLATIONS = {
  'Îles-de-la-Madeleine': 'Magdalen Islands',
  'Gaspésie': 'Gaspé',
  'Bas-Saint-Laurent': 'Bas-Saint-Laurent',
  'Côte-Nord': 'North Shore'
};

// Species translations
const SPECIES_TRANSLATIONS = {
  'Moule bleue': 'Blue Mussel',
  'Huître américaine': 'American Oyster',
  'Laminaire à long stipe': 'Sugar Kelp',
  'Pétoncle géant': 'Giant Scallop',
  'Mye commune': 'Common Softshell Clam',
  'Oursin vert': 'Green Sea Urchin',
  'Macroalgues': 'Macroalgae',
  'Pétoncle d\'Islande': 'Iceland Scallop',
  'Laminaire sucrée': 'Sugar Kelp',
  'Algue brune': 'Brown Algae',
  'Homard américain': 'American Lobster',
  'Pétoncle giant': 'Giant Scallop'
};

// Activity type translations
const ACTIVITY_TRANSLATIONS = {
  'Élevage': 'Farming',
  'Culture': 'Culture',
  'Captage de naissain': 'Seed Collection',
  'Captage': 'Collection',
  'Désablage': 'Sanding',
  'Récolte': 'Harvest',
  'Activités de recherche et d\'expérimentation': 'Research and Experimentation Activities'
};

// Yes/No translations
const YES_NO_TRANSLATIONS = {
  'Oui': 'Yes',
  'Non': 'No'
};

/**
 * Parse a CSV line handling quoted values
 */
function parseCSVLine(line) {
  const values = [];
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

/**
 * Translate a single value
 */
function translateValue(value) {
  if (!value || value === '') return value;
  
  // Check direct translations
  if (YES_NO_TRANSLATIONS[value]) return YES_NO_TRANSLATIONS[value];
  if (ACTIVITY_TRANSLATIONS[value]) return ACTIVITY_TRANSLATIONS[value];
  
  // Check species (partial match)
  for (const [fr, en] of Object.entries(SPECIES_TRANSLATIONS)) {
    if (value.includes(fr)) {
      return value.replace(fr, en);
    }
  }
  
  // Check regions (partial match)
  for (const [fr, en] of Object.entries(REGION_TRANSLATIONS)) {
    if (value.includes(fr)) {
      return value.replace(fr, en);
    }
  }
  
  return value;
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Translating Quebec Marine Aquaculture CSV...\n');
  console.log(`📄 Input: ${INPUT_FILE}`);
  console.log(`📄 Output: ${OUTPUT_FILE}\n`);

  try {
    // Read input file
    const content = fs.readFileSync(INPUT_FILE, 'utf8');
    const lines = content.split('\n');
    
    let headers = [];
    let translatedHeaders = [];
    const translatedLines = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (!line) continue;

      if (headers.length === 0) {
        // First line is headers
        headers = parseCSVLine(line);
        
        // Translate headers
        translatedHeaders = headers.map(h => {
          if (HEADER_TRANSLATIONS[h]) {
            return HEADER_TRANSLATIONS[h];
          }
          // Handle remaining by capitalizing first letter
          return h.charAt(0).toUpperCase() + h.slice(1).toLowerCase();
        });
        
        console.log(`📋 Found ${headers.length} columns`);
        console.log('   Translating headers...');
        headers.forEach((h, idx) => {
          console.log(`   ${h} -> ${translatedHeaders[idx]}`);
        });
        console.log('');
      } else {
        // Data line - translate values
        const values = parseCSVLine(line);
        const translatedValues = values.map(v => {
          const translated = translateValue(v);
          // Escape quotes for CSV
          return `"${translated.replace(/"/g, '""')}"`;
        });
        translatedLines.push(translatedValues.join(','));
      }
    }

    // Write output file
    const outputContent = [translatedHeaders.join(','), ...translatedLines].join('\n');
    fs.writeFileSync(OUTPUT_FILE, outputContent, 'utf8');

    console.log(`✅ Translated ${translatedLines.length} data rows`);
    console.log(`💾 Saved to: ${OUTPUT_FILE}`);

    // Print sample of translated data
    console.log('\n📊 Sample translated data (first 3 rows):');
    translatedLines.slice(0, 3).forEach((line, idx) => {
      console.log(`   Row ${idx + 1}: ${line.substring(0, 100)}...`);
    });

    console.log('\n✨ Done!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the script
main();

