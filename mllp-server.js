// mllp-server.js
import net from 'node:net';
import fs from 'node:fs';
import https from 'node:https';

const PORT = 2575;
const HOST = '0.0.0.0';

const SB = String.fromCharCode(0x0b); // <VT> vertical tab
const EB = String.fromCharCode(0x1c); // <FS> file separator
const CR = '\r';

// Load HL7 mapping config
const mapping = JSON.parse(fs.readFileSync('./hl7-mapping.json', 'utf8'));

function parseHL7toJSON(hl7, mapping) {
  const segments = hl7.split('\r');
  const result = {};
  for (const seg of segments) {
    const fields = seg.split('|');
    const segName = fields[0];
    for (const mapKey in mapping) {
      const [mapSeg, ...rest] = mapKey.split('.');
      if (mapSeg === segName) {
        let value = fields;
        for (const idx of rest) {
          // HL7 is 1-based, so subtract 1
          if (Array.isArray(value)) {
            value = value[parseInt(idx) - 1] || '';
          }
        }
        result[mapping[mapKey]] = value;
      }
    }
  }
  return result;
}

const API_URL = 'https://app.lyrebirdhealth.com/partnerapi/v1/appointments/';
const API_KEY = process.env.LYREBIRD_API_KEY || '<YOUR_API_KEY_HERE>';

function sendToLyrebirdAPI(jsonData) {
  const data = JSON.stringify(jsonData);
  const url = new URL(API_URL);
  const options = {
    hostname: url.hostname,
    path: url.pathname,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      'Content-Length': Buffer.byteLength(data)
    }
  };
  const req = https.request(options, (res) => {
    let body = '';
    res.on('data', (chunk) => { body += chunk; });
    res.on('end', () => {
      console.log('Lyrebird API response:', res.statusCode, body);
    });
  });
  req.on('error', (e) => {
    console.error('Error sending to Lyrebird API:', e);
  });
  req.write(data);
  req.end();
}

const DEBUG = process.env.DEBUG === 'true';

const server = net.createServer((socket) => {
  let buffer = '';
  socket.on('data', (data) => {
    buffer += data.toString();
    let start, end;
    while ((start = buffer.indexOf(SB)) !== -1 && (end = buffer.indexOf(EB + CR)) !== -1) {
      const hl7 = buffer.substring(start + 1, end);
      if (DEBUG) {
        console.log('Received HL7 message:');
        console.log(hl7);
      }
      // Map HL7 to JSON
      const mapped = parseHL7toJSON(hl7, mapping);
      if (DEBUG) {
        console.log('Transformed JSON:');
        console.log(JSON.stringify(mapped, null, 2));
      }
      sendToLyrebirdAPI(mapped);
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
  console.log(`MLLP server listening on ${HOST}:${PORT}`);
});
