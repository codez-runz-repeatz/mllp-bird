const fs = require('fs');
const path = require('path');
const configuration = require('../configuration.js');

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

const mllpConfig = loadConfig('mllp-bird.json');
const configInstance = new configuration(mllpConfig);

function isPractitioner(){
    return configInstance.practitioners();
}

function shouldFetch() {
  return configInstance.notes();
}

function getApiKey() {
  return envKey = configInstance.apiKey();
}



function appointmentURL() {
  return configInstance.apiBaseUrl() + "/" + configInstance.appointmentsRoute();
}

function practitionerURL() {
  return configInstance.apiBaseUrl() + "/" + configInstance.practitionersRoute();
}

function notesURL() {
  return configInstance.apiBaseUrl() + configInstance.notesRoute();
}

function snifferPort() {
  return configInstance.hl7Port();
}

function mappingAppointments() {
  return loadConfig(configInstance.appointmentsMapping());
}

function mappingPractitioner() {
  return loadConfig(configInstance.practitionersMapping());
}
module.exports = { loadConfig, getApiKey, isPractitioner, shouldFetch, appointmentURL, practitionerURL, notesURL, snifferPort, mappingAppointments, mappingPractitioner };
