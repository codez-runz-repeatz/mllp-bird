// simpleHL7FieldExtraction.js
/**
 * Extracts fields from an HL7 message based on a config object.
 * @param {string} hl7Message - The HL7 message as a string.
 * @param {object} config - The config object with a 'fields' array.
 * @returns {object} - Extracted fields as key-value pairs.
 */
function extractFields(hl7Message, config) {
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

function extractSimpleField(segments, fieldPath) {
  // Example: fieldPath = 'PID.5.1' (segment.field.component)
  const [segmentName, fieldNum, componentNum] = fieldPath.split('.');
  const segment = segments.find(seg => seg[0] === segmentName);
  if (!segment) return undefined;
  const field = segment[parseInt(fieldNum, 10)];
  if (!field) return undefined;
  if (componentNum) {
    const components = field.split('^');
    return components[parseInt(componentNum, 10) - 1];
  }
  return field;
}

module.exports = { extractFields, extractSimpleField };
