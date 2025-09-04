import { extractFields } from './src/mllp-node/complexHL7FieldExtraction.js';

export function parseHL7toJSON(hl7, mapping, parserConfig) {
  const segments = hl7.split(/\r/g)
    .map(seg => seg.trim().split(parserConfig.fieldSeparator));
  if (process.env.DEBUG === 'true') {
    console.log('--- Parsed HL7 Segments ---');
    segments.forEach((seg, i) => {
      console.log(`Segment ${i}:`, seg);
    });
    console.log('--------------------------');
  }
  return extractFields(segments, mapping, hl7, parserConfig);
}
