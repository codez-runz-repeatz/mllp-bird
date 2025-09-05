import { jest } from '@jest/globals';
import { restApiForward } from '../src/mllp-node/httpsClient.js';

jest.unstable_mockModule('node-fetch', () => ({
  default: jest.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => ({ success: true })
  })
}));

const fetch = (await import('node-fetch')).default;

describe('restApiForward', () => {
  it('should POST data to the API endpoint', async () => {
    const data = { test: 'value' };
    const endpoint = 'https://example.com/api';
    const apiKey = 'dummy';
    const result = await restApiForward(data, apiKey, endpoint);
    expect(fetch).toHaveBeenCalledWith(endpoint, expect.objectContaining({
      method: 'POST',
      body: JSON.stringify(data),
      headers: expect.any(Object)
    }));
    expect(result).toEqual({ success: true });
  });
});
