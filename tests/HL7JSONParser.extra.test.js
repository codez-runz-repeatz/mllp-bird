import { parseHL7toJSON } from '../src/mllp-node/HL7JSONParser.js';

describe('parseHL7toJSON edge cases', () => {
  it('returns empty object for missing message', () => {
    expect(parseHL7toJSON('', { MSH: { 3: 'SendingApp' } })).toEqual({});
    expect(parseHL7toJSON(null, { MSH: { 3: 'SendingApp' } })).toEqual({});
  });
  it('returns empty object for missing mapping', () => {
    expect(parseHL7toJSON('MSH|^~\\&|A|B', null)).toEqual({});
    expect(parseHL7toJSON('MSH|^~\\&|A|B', {})).toEqual({});
  });
  it('returns empty string for missing field', () => {
    const msg = 'MSH|^~\\&|A|B';
    const mapping = { MSH: { 10: 'Missing' } };
    expect(parseHL7toJSON(msg, mapping)).toEqual({ Missing: '' });
  });
  it('returns empty string for missing segment', () => {
    const msg = 'MSH|^~\\&|A|B';
    const mapping = { PID: { 2: 'NoPID' } };
    expect(parseHL7toJSON(msg, mapping)).toEqual({ NoPID: '' });
  });
});
