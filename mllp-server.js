// mllp-server.js
import net from 'node:net';
import fs from 'node:fs';
import https from 'node:https';
import { parseHL7toJSON } from './HL7JSONParser.js';
import path from 'node:path';
import { getLogFilePath, appendToLogFile, printLogo } from './src/mllp-node/logger.js';
import { restApiForward } from './restApiForward.js';

const SB = String.fromCharCode(0x0b); // <VT> vertical tab
const EB = String.fromCharCode(0x1c); // <FS> file separator
const CR = '\r';

// Helper to load config, preferring local file if present
function loadConfig(filename, fallbackAsset) {
  const fsPath = `./${filename}`;
  if (fs.existsSync(fsPath)) {
    return JSON.parse(fs.readFileSync(fsPath, 'utf8'));
  }
  // If running in pkg binary, __dirname points to snapshot, so use fs.readFileSync with fallbackAsset
  try {
    return JSON.parse(fs.readFileSync(require('path').join(__dirname, fallbackAsset), 'utf8'));
  } catch (e) {
    throw new Error(`Could not load config: ${filename}`);
  }
}

// Load HL7 mapping config (prefer local override)
const mapping = loadConfig('hl7-mapping.json', 'hl7-mapping.json');

// Load HL7 parser config (prefer local override)
const parserConfig = loadConfig('hl7-parser-config.json', 'hl7-parser-config.json');

const API_URL = 'https://app.lyrebirdhealth.com/partnerapi/v1/appointments/';

// Get API key from env or command-line argument
function getApiKey() {
  const envKey = process.env.LYREBIRD_API_KEY;
  const argKey = process.argv.find(arg => arg.startsWith('--apikey='));
  if (argKey) {
    return argKey.split('=')[1];
  }
  return envKey || '<YOUR_API_KEY_HERE>';
}

const API_KEY = getApiKey();

// Get port from env or command-line argument
function getPort() {
  const envPort = process.env.PORT;
  const argPort = process.argv.find(arg => arg.startsWith('--port='));
  if (argPort) {
    return parseInt(argPort.split('=')[1], 10);
  }
  return envPort ? parseInt(envPort, 10) : 2575;
}

const PORT = getPort();

// Get host (IP address) from env or command-line argument
function getHost() {
  const envHost = process.env.HOST;
  const argHost = process.argv.find(arg => arg.startsWith('--host='));
  if (argHost) {
    return argHost.split('=')[1];
  }
  return envHost || '0.0.0.0';
}

const HOST = getHost();

// Get pleaselog param from command-line or env
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

// Accept --debug or --logplease as well as DEBUG env
const DEBUG = process.env.DEBUG === 'true' || process.argv.includes('--debug') || process.argv.includes('--logplease');

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
      // Map HL7 to JSON
      const mapped = parseHL7toJSON(hl7, mapping, parserConfig);
      // Log to file (and console if debug)
      appendToLogFile({ hl7 }, parsedSegments, mapped);
      // Only send to API if API_KEY is set and not a placeholder
      if (API_KEY && API_KEY !== '<YOUR_API_KEY_HERE>') {
        try {
          restApiForward(mapped, API_KEY, API_URL);
        } catch (err) {
          console.error('Error in restApiForward:', err);
        }
      } else if (DEBUG) {
        console.log('No API key provided, skipping API call.');
        console.log();
      }
      // Send HL7 ACK
      const ack = `${SB}MSH|^~\\&|ACK|RECV|SEND|FAC|20250101000000||ACK^A01|1|P|2.3${CR}MSA|AA|1${CR}${EB}${CR}`;
      socket.write(ack);
      buffer = buffer.slice(end + 2);
    }
  });
  socket.on('error', (err) => {
    console.error('Socket error:', err);
  });
});

server.listen(PORT, HOST, () => {
  printLogo();
  console.log(`MLLP server listening on ${HOST}:${PORT}`);
});
