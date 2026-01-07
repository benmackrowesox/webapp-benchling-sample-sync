/**
 * Combine DFO Tables Script
 * Merges all 4 DFO aquaculture tables into a single combined CSV
 * 
 * Usage: node scripts/combine-dfo-tables.js
 */

const fs = require('fs');
const path = require('path');

const INPUT_DIR = path.join(__dirname, '../public/dfo-data');
const OUTPUT_FILE = path.join(INPUT_DIR, 'combined-all-tables.csv');

// Column mappings to normalize across tables
const COLUMN_MAPPINGS = {
  'Facility common names': 'Facility common name',
  'Facility common name': 'Facility common name'
};

// All possible columns from all tables (in order)
const ALL_COLUMNS = [
  'Table Type',
  'Facility reference number',
  'Licence type',
  'Licence holder',
  'Operating group',
  'Facility common name',
  'Licensed species',
  'Latitude',
  'Longitude',
  'Aquaculture management unit'
];

/**
 * Parse CSV file and return rows as objects
 */
function parseCsv(filepath) {
  const content = fs.readFileSync(filepath, 'utf8');
  const lines = content.split('\n');
  const rows = [];
  let headers = [];
  let inData = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip comment lines (metadata)
    if (line.startsWith('#')) {
      continue;
    }

    if (line && !inData) {
      // First non-comment line is headers
      headers = parseCSVLine(line);
      inData = true;
    } else if (line && inData) {
      const values = parseCSVLine(line);
      const row = {};
      headers.forEach((header, index) => {
        // Normalize header name
        const normalizedHeader = COLUMN_MAPPINGS[header] || header;
        row[normalizedHeader] = values[index] || '';
      });
      rows.push(row);
    }
  }

  return rows;
}

/**
 * Parse a single CSV line handling quoted values
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
 * Main function
 */
async function main() {
  console.log('🚀 Combining DFO Aquaculture tables...\n');

  try {
    // Define the input files with their table types
    const tableFiles = [
      {
        file: 'table-1-map-of-marine-finfish-aquaculture-facilities-in-british-columbia.csv',
        type: 'Marine Finfish'
      },
      {
        file: 'table-2-map-of-shellfish-aquaculture-in-british-columbia.csv',
        type: 'Shellfish'
      },
      {
        file: 'table-3-map-of-landbased-aquaculture-in-british-columbia.csv',
        type: 'Landbased'
      },
      {
        file: 'table-4-map-of-enhancement-aquaculture-in-british-columbia.csv',
        type: 'Enhancement'
      }
    ];

    const allRows = [];

    // Process each table
    for (const table of tableFiles) {
      const filepath = path.join(INPUT_DIR, table.file);
      console.log(`📄 Processing: ${table.file}`);
      
      const rows = parseCsv(filepath);
      console.log(`   Found ${rows.length} rows`);
      
      // Add table type to each row
      rows.forEach(row => {
        row['Table Type'] = table.type;
        allRows.push(row);
      });
    }

    // Write combined CSV
    const headerLine = ALL_COLUMNS.map(h => `"${h}"`).join(',');
    const dataLines = allRows.map(row => {
      return ALL_COLUMNS.map(col => {
        const value = row[col] || '';
        return `"${value.replace(/"/g, '""')}"`;
      }).join(',');
    }).join('\n');

    const combinedContent = `${headerLine}\n${dataLines}`;
    fs.writeFileSync(OUTPUT_FILE, combinedContent, 'utf8');

    console.log(`\n✅ Combined ${allRows.length} total rows from 4 tables`);
    console.log(`💾 Saved to: ${OUTPUT_FILE}`);
    console.log(`📊 Columns: ${ALL_COLUMNS.length}`);

    // Print column summary
    console.log('\n📋 Columns in combined file:');
    ALL_COLUMNS.forEach((col, i) => {
      console.log(`   ${i + 1}. ${col}`);
    });

    // Print row count by table type
    console.log('\n📊 Rows by table type:');
    const typeCounts = {};
    allRows.forEach(row => {
      typeCounts[row['Table Type']] = (typeCounts[row['Table Type']] || 0) + 1;
    });
    Object.entries(typeCounts).forEach(([type, count]) => {
      console.log(`   - ${type}: ${count}`);
    });

    console.log('\n✨ Done!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the script
main();

