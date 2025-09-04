import { extractFields } from '../src/mllp-node/simpleHL7FieldExtraction.js';

describe('extractFields edge cases', () => {
  it('returns empty object for missing message', () => {
    expect(extractFields('', { fields: [] })).toEqual({});
    expect(extractFields(null, { fields: [] })).toEqual({});
  });
  it('returns empty object for missing config', () => {
    expect(extractFields('MSH|^~\\&|A|B', null)).toEqual({});
    expect(extractFields('MSH|^~\\&|A|B', {})).toEqual({});
  });
  it('returns empty string for missing field', () => {
    const msg = 'MSH|^~\\&|A|B';
    const config = { fields: [{ segment: 'MSH', field: 10, name: 'Missing' }] };
    expect(extractFields(msg, config)).toEqual({ Missing: '' });
  });
  it('returns empty string for missing segment', () => {
    const msg = 'MSH|^~\\&|A|B';
    const config = { fields: [{ segment: 'PID', field: 2, name: 'NoPID' }] };
    expect(extractFields(msg, config)).toEqual({ NoPID: '' });
  });
});
