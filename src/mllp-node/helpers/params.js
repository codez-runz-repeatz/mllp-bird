const fs = require('fs');
const path = require('path');

function loadConfig(Asset) {
  const fallbackAsset = path.join(__dirname, '../../../', Asset);
  const overrideAsset = path.join(process.cwd(), Asset);
  
  if (fs.existsSync(overrideAsset)) {
    return JSON.parse(fs.readFileSync(overrideAsset, 'utf8'));
  }
  try {
    return JSON.parse(fs.readFileSync(fallbackAsset, 'utf8'));
  } catch (e) {
    throw new Error(`Could not load config: ${Asset}`);
  }
}

function isPractitioner(){
    if (process.argv.includes('--practitioner')){
        return true;
    }
    return false;
}

function getApiKey() {
  const envKey = process.env.LYREBIRD_API_KEY;
  const argKey = process.argv.find(arg => arg.startsWith('--apikey='));
  if (argKey) {
    return argKey.split('=')[1];
  }
  return envKey || '<YOUR_API_KEY_HERE>';
}

module.exports = { loadConfig, getApiKey, isPractitioner };
