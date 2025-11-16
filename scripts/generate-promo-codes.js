// Script to generate all Baby Volraiden promo codes (1-10000)
// Run with: node scripts/generate-promo-codes.js

const fs = require('fs');
const path = require('path');

// Special code that shows all available codes
const SPECIAL_CODE = 'QmFieSBWb2xyYWlkZW4gSXMgQSBDdXRpZSBXdXRpZQ==';
const SPECIAL_CODE_TEXT = 'Baby Volraiden Is A Cutie Wutie';

// Generate codes from 1 to 10000
const codes = [];

// Add special code first
codes.push({
  code: SPECIAL_CODE,
  code_text: SPECIAL_CODE_TEXT,
  is_special: true
});

// Generate codes for Baby Volraiden 1-10000
for (let i = 1; i <= 10000; i++) {
  const text = `Baby Volraiden ${i}`;
  const code = Buffer.from(text).toString('base64');
  
  codes.push({
    code: code,
    code_text: text,
    is_special: false
  });
}

// Generate SQL insert statements
const sqlStatements = codes.map((item, index) => {
  if (index === 0) {
    // Special code
    return `INSERT INTO public.promo_codes (code, code_text, is_used) VALUES ('${item.code}', '${item.code_text}', FALSE) ON CONFLICT (code) DO NOTHING;`;
  } else {
    return `INSERT INTO public.promo_codes (code, code_text, is_used) VALUES ('${item.code}', '${item.code_text}', FALSE) ON CONFLICT (code) DO NOTHING;`;
  }
});

// Write to SQL file
const sqlContent = `-- Generated promo codes for Baby Volraiden 1-10000
-- Special code: ${SPECIAL_CODE_TEXT} (${SPECIAL_CODE})
-- Total codes: ${codes.length}

-- Create table first (run CREATE_PROMO_CODES_TABLE.sql if not exists)
-- Then run this file to insert all codes

${sqlStatements.join('\n')}

-- Verify count
SELECT COUNT(*) as total_codes, COUNT(*) FILTER (WHERE is_used = FALSE) as available_codes FROM public.promo_codes;
`;

const outputPath = path.join(__dirname, '..', 'INSERT_PROMO_CODES.sql');
fs.writeFileSync(outputPath, sqlContent, 'utf8');

console.log(`✅ Generated ${codes.length} promo codes`);
console.log(`📝 SQL file written to: ${outputPath}`);
console.log(`\nSpecial code: ${SPECIAL_CODE_TEXT}`);
console.log(`Base64: ${SPECIAL_CODE}`);
console.log(`\nFirst 5 codes:`);
codes.slice(0, 6).forEach((item, i) => {
  console.log(`  ${i === 0 ? 'SPECIAL' : i}: ${item.code_text} -> ${item.code}`);
});

