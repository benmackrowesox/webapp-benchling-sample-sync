/**
 * Combine New Brunswick Aquaculture Tables
 * Merges Shellfish and Finfish CSV files into a single combined CSV
 * 
 * Usage: node scripts/combine-new-brunswick.js
 */

const fs = require('fs');
const path = require('path');

const INPUT_DIR = path.join(__dirname, '../canadian_aquaculture_sites_070126/new_brunswick_sites_070126');
const OUTPUT_FILE = path.join(INPUT_DIR, 'combined_new_brunswick_all.csv');

// All possible columns (union of both files)
const ALL_COLUMNS = [
  'OBJECTID',
  'Site Number',
  'AUTHORIZATION_TYPE',
  'Name of Lease Holder/Permit Holder/Licence Holder',
  'Expiry Date of Lease/Permit/Licence',
  'Cultivation Method',
  'Site Size (HA)',
  'Species and Strain',
  'Species Category'
];

/**
 * Parse CSV file and return rows as objects
 */
function parseCsv(filepath) {
  const content = fs.readFileSync(filepath, 'utf8');
  const lines = content.split('\n');
  const rows = [];
  let headers = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (!line) continue;

    if (headers.length === 0) {
      // First line is headers - trim whitespace from each header
      headers = parseCSVLine(line).map(h => h.trim());
    } else {
      const values = parseCSVLine(line);
      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
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
  console.log('🚀 Combining New Brunswick Aquaculture tables...\n');

  try {
    const tableFiles = [
      {
        file: 'Canada_Aquaculture_NewBrunswcik_Shellfish.csv',
        type: 'Shellfish'
      },
      {
        file: 'Canada_Aquaculture_NewBrunswick_Finfish.csv',
        type: 'Finfish'
      }
    ];

    const allRows = [];

    // Process each table
    for (const table of tableFiles) {
      const filepath = path.join(INPUT_DIR, table.file);
      
      if (!fs.existsSync(filepath)) {
        console.log(`⚠️  File not found: ${table.file}`);
        continue;
      }
      
      console.log(`📄 Processing: ${table.file}`);
      
      const rows = parseCsv(filepath);
      console.log(`   Found ${rows.length} rows`);
      
      // Add species category to each row
      rows.forEach(row => {
        row['Species Category'] = table.type;
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

    console.log(`\n✅ Combined ${allRows.length} total rows from 2 tables`);
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

