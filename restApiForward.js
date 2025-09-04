// restApiForward.js
import https from 'node:https';

export function restApiForward(jsonData, apiKey, apiUrl) {
  const data = JSON.stringify(jsonData);
  const url = new URL(apiUrl);
  const options = {
    hostname: url.hostname,
    path: url.pathname,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
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
