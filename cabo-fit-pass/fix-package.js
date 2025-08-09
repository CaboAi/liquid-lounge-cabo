const fs = require('fs');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
packageJson.scripts.dev = 'next dev';  // Remove --turbopack
fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
console.log('Updated package.json - removed turbopack flag');
