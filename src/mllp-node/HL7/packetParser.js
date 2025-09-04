const { extractFields } = require('./fieldExtractor.js');

function isComputedField(val) {
  return typeof val === 'string' && val.startsWith('__COMPUTED_EMAIL__');
}

function computeField(val, segments, rawHL7, config) {
  // Example: __COMPUTED_EMAIL__(PID.5.2,PID.5.1)@alderhey.com
  const match = val.match(/^__COMPUTED_EMAIL__\(([^)]+)\)@(.+)$/);
  if (!match) return '';
  const args = match[1].split(',').map(s => s.trim());
  const domain = match[2];
  // Extract each argument using extractFields
  const extracted = args.map(arg => {
    const res = extractFields(segments, { [arg]: arg }, rawHL7, config);
    if (process.env.DEBUG || process.argv.includes('--debug')) {
      console.log(`[COMPUTED_EMAIL] Extracted for ${arg}:`, res[arg]);
    }
    return res[arg] || '';
  });
  // Join as: first.last@domain (lowercase, dots replaced with underscores)
  const local = extracted.map(x => x.toLowerCase().replace(/\s+/g, '.').replace(/[^a-z0-9.]/g, '')).join('.');
  if (process.env.DEBUG || process.argv.includes('--debug')) {
    console.log(`[COMPUTED_EMAIL] Local part:`, local, 'Domain:', domain);
  }
  return `${local}@${domain}`;
}

/**
 * Parses an HL7 message to JSON using a mapping object and advanced extraction logic.
 * @param {string} hl7Message - The HL7 message as a string.
 * @param {object} mapping - The mapping object, e.g. { MSH: { 3: 'SendingApp' } }
 * @param {object} [parserConfig] - Optional parser config (segmentOffsets, separators, etc.)
 * @returns {object} - Parsed fields as key-value pairs.
 */
function parseHL7toJSON(hl7Message, mapping, parserConfig = {}) {
  if (!hl7Message || !mapping) return {};
  // Default HL7 separators if not provided
  const fieldSeparator = parserConfig.fieldSeparator || '|';
  const segmentSeparator = parserConfig.segmentSeparator || /\r|\n/;
  const componentSeparator = parserConfig.componentSeparator || '^';
  // Split message into segments and fields
  const segments = hl7Message.split(segmentSeparator).map(seg => seg.trim().split(fieldSeparator));
  // Provide parserConfig with defaults for extractFields
  const config = {
    ...parserConfig,
    fieldSeparator,
    segmentSeparator,
    componentSeparator
  };
  // Recursively extract fields to match mapping structure
  function buildJson(mappingNode) {
    if (Array.isArray(mappingNode)) {
      return mappingNode.map(buildJson);
    }
    if (typeof mappingNode !== 'object' || mappingNode === null) return mappingNode;
    const result = {};
    for (const key in mappingNode) {
      if (typeof mappingNode[key] === 'object' && mappingNode[key] !== null) {
        result[key] = buildJson(mappingNode[key]);
      } else if (isComputedField(key)) {
        result[mappingNode[key]] = computeField(key, segments, hl7Message, config);
      } else {
        // Use extractFields to get the value for this key
        const flat = extractFields(segments, { [key]: mappingNode[key] }, hl7Message, config);
        result[mappingNode[key]] = flat[mappingNode[key]];
      }
    }
    return result;
  }
  const jsonResult = buildJson(mapping);
  return jsonResult;
}

module.exports = { parseHL7toJSON };
