import https from 'node:https';
const DEFAULT_API_URL = 'https://app.lyrebirdhealth.com/partnerapi/v1/appointments/';
export async function restApiForward(jsonData, apiKey, apiUrl = DEFAULT_API_URL) {
  // Use fetch if available (for testability)
  const fetch = (await import('node-fetch')).default;
  const res = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': apiKey ? `Bearer ${apiKey}` : undefined
    },
    body: JSON.stringify(jsonData)
  });
  return await res.json();
}
