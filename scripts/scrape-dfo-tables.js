/**
 * DFO Aquaculture Tables Scraper
 * Scrapes all tables from https://www.dfo-mpo.gc.ca/aquaculture/bc-cb/maps-cartes-eng.html
 * 
 * Usage: node scripts/scrape-dfo-tables.js
 */

const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const https = require('https');

const TARGET_URL = 'https://www.dfo-mpo.gc.ca/aquaculture/bc-cb/maps-cartes-eng.html';
const OUTPUT_DIR = path.join(__dirname, '../public/dfo-data');

// Create output directory if it doesn't exist
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * Fetch HTML content from URL
 */
function fetchHtml(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve(data);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * Extract tables from HTML using Cheerio
 */
function extractTables(html) {
  const $ = cheerio.load(html);
  const tables = [];

  // Find all tables on the page
  $('table').each((index, table) => {
    const tableData = {
      index: index + 1,
      headers: [],
      rows: []
    };

    // Extract headers from thead section only
    const thead = $(table).find('thead');
    let headerRowIndex = -1; // Track which row contains headers
    
    if (thead.length > 0) {
      // Headers in thead
      $(thead).find('th').each((i, cell) => {
        const headerText = $(cell).text().trim();
        if (headerText) {
          tableData.headers.push(headerText);
        }
      });
      // Header row is in thead, exclude it from data rows
      headerRowIndex = $(table).find('thead').parent().find('tr').index($(thead).find('tr'));
    } else {
      // Check if first row has TH elements (indicating header)
      const firstRow = $(table).find('tr').first();
      const hasHeaderCells = firstRow.find('th').length > 0;
      
      if (hasHeaderCells) {
        firstRow.find('th').each((i, cell) => {
          const headerText = $(cell).text().trim();
          if (headerText) {
            tableData.headers.push(headerText);
          }
        });
        headerRowIndex = 0;
      }
    }

    // Extract all rows from tbody or directly from table
    const allRows = $(table).find('tbody tr, tr');
    
    allRows.each((rowIndex, row) => {
      // Skip the header row if it was in tbody/tr (not thead)
      if (headerRowIndex >= 0 && rowIndex === headerRowIndex) {
        return;
      }
      
      const rowData = [];
      $(row).find('td, th').each((cellIndex, cell) => {
        const cellText = $(cell).text().trim();
        rowData.push(cellText);
      });
      
      // Only add non-empty rows
      if (rowData.some(cell => cell !== '')) {
        tableData.rows.push(rowData);
      }
    });

    // Get table caption or surrounding context for identification
    const caption = $(table).find('caption').text().trim();
    const precedingHeading = $(table).prevAll('h2, h3, h4, h5, h6').first().text().trim();
    
    tableData.caption = caption;
    tableData.section = precedingHeading;
    tableData.totalRows = tableData.rows.length;

    if (tableData.rows.length > 0 || tableData.headers.length > 0) {
      tables.push(tableData);
    }
  });

  return tables;
}

/**
 * Convert table to CSV format
 */
function tableToCsv(table) {
  const lines = [];

  // Add section and caption as comments
  if (table.section) {
    lines.push(`# Section: ${table.section}`);
  }
  if (table.caption) {
    lines.push(`# Caption: ${table.caption}`);
  }
  lines.push(`# Rows: ${table.totalRows}`);

  // Add headers
  if (table.headers.length > 0) {
    const headerLine = table.headers.map(h => `"${h.replace(/"/g, '""')}"`).join(',');
    lines.push(headerLine);
  }

  // Add rows
  table.rows.forEach(row => {
    const rowLine = row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',');
    lines.push(rowLine);
  });

  return lines.join('\n');
}

/**
 * Save table to CSV file
 */
function saveTableToCsv(table, outputDir) {
  const safeSection = (table.section || `table-${table.index}`).replace(/[^a-z0-9]/gi, '-').toLowerCase();
  const filename = `table-${table.index}-${safeSection}.csv`;
  const filepath = path.join(outputDir, filename);
  
  const csv = tableToCsv(table);
  fs.writeFileSync(filepath, csv, 'utf8');
  
  return filename;
}

/**
 * Save all tables summary to a JSON file
 */
function saveSummary(tables, outputDir) {
  const summary = {
    url: TARGET_URL,
    scrapedAt: new Date().toISOString(),
    totalTables: tables.length,
    tables: tables.map(t => ({
      index: t.index,
      section: t.section,
      caption: t.caption,
      headers: t.headers,
      totalRows: t.totalRows
    }))
  };

  fs.writeFileSync(
    path.join(outputDir, 'summary.json'),
    JSON.stringify(summary, null, 2),
    'utf8'
  );
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Starting DFO Aquaculture tables scraper...\n');
  console.log(`� URL: ${TARGET_URL}\n`);

  try {
    // Fetch HTML
    console.log('📥 Fetching HTML content...');
    const html = await fetchHtml(TARGET_URL);
    console.log(`✅ Fetched ${html.length} characters\n`);

    // Extract tables
    console.log('🔍 Extracting tables...');
    const tables = extractTables(html);
    console.log(`✅ Found ${tables.length} table(s)\n`);

    // Save each table to CSV
    console.log('💾 Saving tables to CSV...');
    tables.forEach(table => {
      const filename = saveTableToCsv(table, OUTPUT_DIR);
      console.log(`   - ${filename} (${table.totalRows} rows, ${table.headers.length} columns)`);
    });

    // Save summary
    saveSummary(tables, OUTPUT_DIR);
    console.log('\n✅ Saved summary.json\n');

    // Print summary
    console.log('📊 Summary:');
    tables.forEach(table => {
      console.log(`\nTable ${table.index}:`);
      console.log(`  Section: ${table.section || 'N/A'}`);
      console.log(`  Caption: ${table.caption || 'N/A'}`);
      console.log(`  Headers: ${table.headers.join(', ')}`);
      console.log(`  Rows: ${table.totalRows}`);
    });

    console.log(`\n✨ All data saved to: ${OUTPUT_DIR}`);
    console.log('\nDone!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the scraper
main();

