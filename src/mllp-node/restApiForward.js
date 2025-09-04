const fetch = require('node-fetch');

async function forwardToRestApi(jsonData, apiKey, apiUrl) {
  // Send the mapped object directly as JSON (no message wrapper)
  const data = typeof jsonData === 'string' ? jsonData : JSON.stringify(jsonData);
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`
  };
  // Print the API call details
  console.log('[API CALL]', 'POST', apiUrl);
  console.log('[API HEADERS]', headers);
  console.log('[API BODY]', data);
  // Print curl command for manual testing
  const curlCmd = `curl -X POST '${apiUrl}' -H 'Content-Type: application/json' -H 'Authorization: Bearer ${apiKey}' -d '${data.replace(/'/g, "'\\''")}'`;
  console.log('[CURL]', curlCmd);
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

module.exports = { forwardToRestApi };
