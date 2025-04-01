// generate-version-json.js
// This script creates a version.json file in the public directory
// containing the version information from package.json

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory of the current module
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Read package.json
const packageJson = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../package.json'), 'utf8')
);

// Create version.json content
const versionJson = {
  version: packageJson.version,
  name: packageJson.name,
  buildTime: new Date().toISOString()
};

// Ensure dist directory exists
const distDir = path.resolve(__dirname, '../dist');
if (!fs.existsSync(distDir)) {
  console.error('Error: dist directory does not exist. Make sure to run this after the build.');
  process.exit(1);
}

// Write the version.json file
fs.writeFileSync(
  path.resolve(distDir, 'version.json'),
  JSON.stringify(versionJson, null, 2),
  'utf8'
);

console.log(`Generated version.json with version ${versionJson.version}`);