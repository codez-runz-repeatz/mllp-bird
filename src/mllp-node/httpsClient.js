const fetch = require('node-fetch');
const { getApiKey, isPractitioner } = require('./helpers/params.js');

const API_KEY = getApiKey();
const API_URL_APPOINTMENTS = 'https://stg.lyrebirdhealth.com/partnerapi/v1/appointments';
const API_URL_PRACTITIONER = 'https://stg.lyrebirdhealth.com/partnerapi/v1/practitioners';

function logAPICommand(jsonData, key, url){
    if (API_KEY && API_KEY !== '<YOUR_API_KEY_HERE>') {
            // Defensive logging for debugging null/undefined issues
            console.log('[DEBUG] API_KEY:', key);
            console.log('[DEBUG] API_URL_APPOINTMENTS:', url);
            console.log('[DEBUG] mappedAppointments:', jsonData);

            // Print curl command for manual testing
            const curlCmd1 = `curl -X POST '${url}' -H 'Content-Type: application/json' -d '${JSON.stringify(jsonData)}'`;
            console.log('To manually post this payload (appointments), run:');
            console.log(curlCmd1);
          }
    return      
};

async function postAppointments(jsonData){
    postToApi(jsonData, API_KEY, API_URL_APPOINTMENTS);
}
async function postPractitioner(jsonData){
  if (isPractitioner()) {
    postToApi(jsonData, API_KEY, API_URL_PRACTITIONER);
  }
}

async function postToApi(jsonData, apiKey, apiUrl) {
  logAPICommand(jsonData,apiKey,apiUrl);
  if (apiKey == '<YOUR_API_KEY_HERE>') {
    return;
  }
  
  // Send the mapped object directly as JSON (no message wrapper)
  const data = typeof jsonData === 'string' ? jsonData : JSON.stringify(jsonData);
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`
  };
  
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: data
    });
    const responseText = await response.text();
    let responseBody;
    try {
      responseBody = JSON.parse(responseText);
      console.log('[Lyrebird API response]', response.status, JSON.stringify(responseBody, null, 2));
    } catch (e) {
      responseBody = responseText;
      console.log('[Lyrebird API response]', response.status, responseBody);
    }
    return { statusCode: response.status, headers: response.headers.raw(), body: responseBody };
  } catch (e) {
    console.error('Lyrebird API fetch error:', e);
    throw e;
  }
}

module.exports = { postAppointments, postPractitioner };
