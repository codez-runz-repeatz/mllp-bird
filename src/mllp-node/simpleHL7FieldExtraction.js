// simpleHL7FieldExtraction.js
/**
 * Extracts fields from an HL7 message based on a config object.
 * @param {string} hl7Message - The HL7 message as a string.
 * @param {object} config - The config object with a 'fields' array.
 * @returns {object} - Extracted fields as key-value pairs.
 */
export function extractFields(hl7Message, config) {
  const result = {};
  if (!hl7Message || !config || !Array.isArray(config.fields)) return result;
  // Split message into segments
  const segments = hl7Message.split(/\r|\n/);
  for (const fieldConfig of config.fields) {
    const { segment, field, name } = fieldConfig;
    const seg = segments.find(s => s.startsWith(segment + '|'));
    if (seg) {
      const fields = seg.split('|');
      result[name] = fields[field] || '';
    } else {
      result[name] = '';
    }
  }
  return result;
}
