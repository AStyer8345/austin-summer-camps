const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const filePath = path.join('C:', 'Users', 'styer', 'Downloads', 'Austin_Summer_Camps_2026.xlsx');
console.log('Reading:', filePath);

const wb = XLSX.readFile(filePath);
console.log('Sheet names:', wb.SheetNames);

wb.SheetNames.forEach(name => {
  const sheet = wb.Sheets[name];
  const data = XLSX.utils.sheet_to_json(sheet);
  console.log(`\n=== Sheet: "${name}" === (${data.length} rows)`);
  if (data.length > 0) {
    console.log('Columns:', Object.keys(data[0]));
    console.log('\nFirst 5 rows:');
    data.slice(0, 5).forEach((row, i) => {
      console.log(`\nRow ${i + 1}:`, JSON.stringify(row, null, 2));
    });
  }
});

// Also dump all data as JSON for processing
const allData = {};
wb.SheetNames.forEach(name => {
  allData[name] = XLSX.utils.sheet_to_json(wb.Sheets[name]);
});
fs.writeFileSync(
  path.join('C:', 'Users', 'styer', 'projects', 'austin-summer-camps', 'supabase', 'seed', 'raw-camp-data.json'),
  JSON.stringify(allData, null, 2)
);
console.log('\nFull data exported to supabase/seed/raw-camp-data.json');
