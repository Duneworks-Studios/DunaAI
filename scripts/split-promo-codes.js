const fs = require('fs');
const path = require('path');

// Read the full INSERT file
const fullFile = fs.readFileSync(path.join(__dirname, '../INSERT_PROMO_CODES.sql'), 'utf8');
const lines = fullFile.split('\n');

// Filter out empty lines and comments
const insertLines = lines.filter(line => 
  line.trim() && 
  !line.trim().startsWith('--') && 
  line.trim().startsWith('INSERT')
);

// Split into batches of 500 codes each
const batchSize = 500;
const batches = [];

for (let i = 0; i < insertLines.length; i += batchSize) {
  const batch = insertLines.slice(i, i + batchSize);
  batches.push(batch);
}

// Create output directory if it doesn't exist
const outputDir = path.join(__dirname, '../INSERT_PROMO_CODES_BATCHES');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Write each batch to a separate file
batches.forEach((batch, index) => {
  const batchNumber = index + 1;
  const header = `-- Batch ${batchNumber} of ${batches.length}\n-- Codes ${index * batchSize + 1} to ${Math.min((index + 1) * batchSize, insertLines.length)}\n\n`;
  const content = header + batch.join('\n') + '\n';
  
  const filename = path.join(outputDir, `INSERT_PROMO_CODES_BATCH_${batchNumber.toString().padStart(3, '0')}.sql`);
  fs.writeFileSync(filename, content);
  console.log(`Created: ${filename} (${batch.length} codes)`);
});

console.log(`\n✅ Split into ${batches.length} batches of ~${batchSize} codes each`);
console.log(`📁 Files saved in: ${outputDir}`);
console.log(`\n📝 Instructions:`);
console.log(`1. Run CREATE_PROMO_CODES_TABLE.sql first (if not already done)`);
console.log(`2. Run each batch file in order (BATCH_001, BATCH_002, etc.)`);
console.log(`3. Each batch can be run separately in Supabase SQL Editor`);

