// mllp-server.js
const net = require('net');
const fs = require('fs');
const https = require('https');
const path = require('path');
const { parseHL7toJSON } = require('./HL7/packetParser.js');
const { getLogFilePath, appendToLogFile, printLogo } = require('./logger.js');
const { forwardToRestApi } = require('./restApiForward.js');

//console.log('[MLLP SERVER] Entry point loaded:', __filename);
//console.log('[MLLP SERVER] Logger module:', require.resolve('./logger.js'));

const PORT = process.env.MLLP_PORT || 2575;

const SB = String.fromCharCode(0x0b); // <VT> vertical tab
const EB = String.fromCharCode(0x1c); // <FS> file separator
const CR = '\r';

// Helper to load config, preferring local file if present
function loadConfig(filename, fallbackAsset) {
  const fsPath = path.join(__dirname, '../../', filename);
  if (fs.existsSync(fsPath)) {
    return JSON.parse(fs.readFileSync(fsPath, 'utf8'));
  }
  // If running in pkg binary, __dirname points to snapshot, so use fs.readFileSync with fallbackAsset
  try {
    return JSON.parse(fs.readFileSync(path.join(__dirname, fallbackAsset), 'utf8'));
  } catch (e) {
    throw new Error(`Could not load config: ${filename}`);
  }
}


// Load HL7 mapping config (prefer local override)
const mappingAppointments = loadConfig('hl7-mapping.json', 'hl7-mapping.json');
const mappingPractitioner = loadConfig('hl7-mapping-practitioner.json', 'hl7-mapping-practitioner.json');
// Load HL7 parser config (prefer local override)
const parserConfig = loadConfig('hl7-parser-config.json', 'hl7-parser-config.json');

const API_URL_APPOINTMENTS = 'https://stg.lyrebirdhealth.com/partnerapi/v1/appointments';
const API_URL_PRACTITIONER = 'https://stg.lyrebirdhealth.com/partnerapi/v1/practitioners';

function getApiKey() {
  const envKey = process.env.LYREBIRD_API_KEY;
  const argKey = process.argv.find(arg => arg.startsWith('--apikey='));
  if (argKey) {
    return argKey.split('=')[1];
  }
  return envKey || '<YOUR_API_KEY_HERE>';
}
const API_KEY = getApiKey();

function getPleaseLogCount() {
  const arg = process.argv.find(arg => arg.startsWith('--pleaselog='));
  let val = arg ? arg.split('=')[1] : process.env.PLEASELOG;
  if (val !== undefined) {
    const n = parseInt(val, 10);
    if (!isNaN(n) && n > 0) return n;
  }
  return 0;
}
const PLEASELOG_COUNT = getPleaseLogCount();

const DEBUG = process.env.DEBUG === 'true' || process.argv.includes('--debug') || process.argv.includes('--logplease');
const ENABLE_PRACTITIONER = process.argv.includes('--practitioner');

//move the tools above outside this scope to avoid redefining them on each connection

const server = net.createServer((socket) => {
  let buffer = '';
  socket.on('data', (data) => {
    buffer += data.toString();
    let start, end;
    while ((start = buffer.indexOf(SB)) !== -1 && (end = buffer.indexOf(EB + CR)) !== -1) {
      const hl7 = buffer.substring(start + 1, end);
      // Always prepare parsedSegments for logging
      const parsedSegments = hl7.split(/\r/g)
        .map(seg => seg.trim().split(parserConfig.fieldSeparator))
        .map((seg, i) => `Segment ${i}: ${JSON.stringify(seg)}`)
        .join('\n');
      // Map HL7 to JSON for both flows
      const mappedAppointments = parseHL7toJSON(hl7, mappingAppointments, parserConfig);
      let mappedPractitioner = null;
      if (ENABLE_PRACTITIONER) {
        mappedPractitioner = parseHL7toJSON(hl7, mappingPractitioner, parserConfig);
      }
      if (DEBUG) {
        console.log('Mapped JSON (appointments):', mappedAppointments);
        if (ENABLE_PRACTITIONER) {
          console.log('Mapped JSON (practitioner):', mappedPractitioner);
        }
      }
      // Log to file (and console if debug)
      appendToLogFile({
        hl7,
        timestamp: new Date().toISOString(),
        mappedAppointments: mappedAppointments || {},
        mappedPractitioner: ENABLE_PRACTITIONER ? (mappedPractitioner || {}) : undefined
      });
      // Only send to API if API_KEY is set and not a placeholder
      if (API_KEY && API_KEY !== '<YOUR_API_KEY_HERE>') {
        // Defensive logging for debugging null/undefined issues
        if (DEBUG) {
          console.log('[DEBUG] API_KEY:', API_KEY);
          console.log('[DEBUG] API_URL_APPOINTMENTS:', API_URL_APPOINTMENTS);
          console.log('[DEBUG] API_URL_PRACTITIONER:', API_URL_PRACTITIONER);
          console.log('[DEBUG] mappedAppointments:', mappedAppointments);
          if (ENABLE_PRACTITIONER) {
            console.log('[DEBUG] mappedPractitioner:', mappedPractitioner);
          }
        }
        if (ENABLE_PRACTITIONER) {
          if (!mappedPractitioner || !API_URL_PRACTITIONER) {
            console.error('[ERROR] Practitioner mapping or API URL is null/undefined. Skipping API call.');
          } else {
            try {
              forwardToRestApi(mappedPractitioner, API_KEY, API_URL_PRACTITIONER);
            } catch (err) {
              console.error('Error in forwardToRestApi (practitioner):', err);
            }
          }
        }
        if (!mappedAppointments || !API_URL_APPOINTMENTS) {
          console.error('[ERROR] Appointments mapping or API URL is null/undefined. Skipping API call.');
        } else {
          try {
            forwardToRestApi(mappedAppointments, API_KEY, API_URL_APPOINTMENTS);
          } catch (err) {
            console.error('Error in forwardToRestApi (appointments):', err);
          }
        }
      } else {
        if (DEBUG) {
          console.log('No API key provided, skipping API call.');
        }
        // Print curl command for manual testing
        const curlCmd1 = `curl -X POST '${API_URL_APPOINTMENTS}' -H 'Content-Type: application/json' -d '${JSON.stringify(mappedAppointments)}'`;
        if (ENABLE_PRACTITIONER) {
          const curlCmd2 = `curl -X POST '${API_URL_PRACTITIONER}' -H 'Content-Type: application/json' -d '${JSON.stringify(mappedPractitioner)}'`;
          console.log('To manually post this payload (practitioner), run:');
          console.log(curlCmd2);
        }
        console.log('To manually post this payload (appointments), run:');
        console.log(curlCmd1);
      }
      // Parse MSH fields for ACK // we should add configurable ACK generation later
      const mshFields = hl7.split('\r')[0].split(parserConfig.fieldSeparator);
      const sendingApp = mshFields[2] || '';
      const sendingFacility = mshFields[3] || '';
      const receivingApp = mshFields[4] || '';
      const receivingFacility = mshFields[5] || '';
      const messageControlId = mshFields[9] || '1';
      const messageType = mshFields[8] || 'ACK';
      // Build HL7 ACK with correct fields
      const ack = `${SB}MSH|^~\\&|${receivingApp}|${receivingFacility}|${sendingApp}|${sendingFacility}|${new Date().toISOString().replace(/[-:T]/g, '').slice(0,14)}||ACK^${messageControlId}|${messageControlId}|P|2.3${CR}MSA|AA|${messageControlId}${CR}${EB}${CR}`;
      socket.write(ack);
      buffer = buffer.slice(end + 2);
    }
  });
  socket.on('end', () => {
    console.log('Client disconnected');
  });
  socket.on('error', (err) => {
    console.error('Socket error:', err);
  });
});

server.listen(PORT, () => {
  console.log(`MLLP server listening on port ${PORT}`);
});

