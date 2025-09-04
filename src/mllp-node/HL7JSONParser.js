import { extractFields } from './complexHL7FieldExtraction.js';
/**
 * Parses an HL7 message to JSON using a mapping object and advanced extraction logic.
 * @param {string} hl7Message - The HL7 message as a string.
 * @param {object} mapping - The mapping object, e.g. { MSH: { 3: 'SendingApp' } }
 * @param {object} [parserConfig] - Optional parser config (segmentOffsets, separators, etc.)
 * @returns {object} - Parsed fields as key-value pairs.
 */
export function parseHL7toJSON(hl7Message, mapping, parserConfig = {}) {
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
  // Use advanced extraction and preserve nested structure
  const flatResult = extractFields(segments, mapping, hl7Message, config);
  // Always include practitioner structure
  flatResult.practitioner = {
    id: flatResult['practitioner.id'] || '',
    name: {
      family: flatResult['practitioner.name.family'] || '',
      given: flatResult['practitioner.name.given'] || '',
      title: flatResult['practitioner.name.title'] || ''
    },
    role: flatResult['practitioner.role'] || ''
  };
  delete flatResult['practitioner.id'];
  delete flatResult['practitioner.name.family'];
  delete flatResult['practitioner.name.given'];
  delete flatResult['practitioner.name.title'];
  delete flatResult['practitioner.role'];
  return flatResult;
}
