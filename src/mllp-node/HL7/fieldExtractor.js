const fs = require('fs');
const HL7ParserHelpers = require('../helpers/HL7ParserHelpers');
const LOG_PATH = 'extraction.log';
const DEBUG_EXTRACTION = process.env.DEBUG_EXTRACTION === '1' || process.env.DEBUG_EXTRACTION === 'true' || process.argv.includes('--debug');
function logExtraction(msg) {
  if (DEBUG_EXTRACTION) {
    fs.appendFileSync(LOG_PATH, msg + '\n');
  }
}

// Advanced HL7 field extraction supporting nested mapping, offsets, subcomponents, repetitions, and raw HL7
function extractFields(segments, mapping, rawHL7, parserConfig) {
  const result = {};
  for (const key in mapping) {
    let logSteps = [];
    if (typeof mapping[key] === 'object' && mapping[key] !== null && !Array.isArray(mapping[key])) {
      // Nested mapping: recursively extract
      result[key] = extractFields(segments, mapping[key], rawHL7, parserConfig);
    } else if (mapping[key] === '__RAW_HL7__') {
      result[key] = rawHL7;
    } else if (key === '__RAW_HL7__') {
      result[mapping[key]] = rawHL7;
    } else if (key.includes('.')) {
      const [segName, ...rest] = key.split('.');
      const seg = segments.find(s => s[0] === segName);
      let value = null;
      logSteps.push(`Extracting ${key} for mapping to ${mapping[key]}`);
      if (seg) {
        value = seg;
        logSteps.push(`  Found segment: ${JSON.stringify(seg)}`);
        const offset = HL7ParserHelpers.getOffset(parserConfig, segName);
        let currentValue = value;
        for (let i = 0; i < rest.length; i++) {
          const idx = parseInt(rest[i], 10);
          if (i === 0) {
            currentValue = currentValue[idx + offset];
            logSteps.push(`    Field index ${idx} + offset ${offset}: ${JSON.stringify(currentValue)}`);
          } else if (i === 1) {
            if (parserConfig && parserConfig.repetitionSeparator && typeof currentValue === 'string' && currentValue.includes(parserConfig.repetitionSeparator)) {
              const reps = currentValue.split(parserConfig.repetitionSeparator);
              currentValue = reps[idx - 1] || '';
              logSteps.push(`    Repetition index ${idx}: ${JSON.stringify(currentValue)}`);
            } else if (parserConfig && parserConfig.componentSeparator && typeof currentValue === 'string') {
              const comps = currentValue.split(parserConfig.componentSeparator);
              currentValue = comps[idx - 1] || '';
              logSteps.push(`    Component index ${idx}: ${JSON.stringify(currentValue)}`);
            }
          } else if (i >= 2 && parserConfig && parserConfig.componentSeparator && typeof currentValue === 'string') {
            const comps = currentValue.split(parserConfig.componentSeparator);
            currentValue = comps[idx - 1] || '';
            logSteps.push(`    Subcomponent index ${idx}: ${JSON.stringify(currentValue)}`);
          }
        }
        value = currentValue;
      } else {
        logSteps.push(`  Segment ${segName} not found.`);
      }
      result[mapping[key]] = value === null ? '' : value;
      logSteps.push(`  Final value: ${JSON.stringify(result[mapping[key]])}`);
      logExtraction(logSteps.join('\n'));
    } else if (!isNaN(Number(key))) {
      const seg = segments.find(s => s[0] === key);
      const offset = HL7ParserHelpers.getOffset(parserConfig, key);
      if (seg) {
        const idx = parseInt(key, 10);
        result[mapping[key]] = seg[idx - 1 + offset] || '';
      } else {
        result[mapping[key]] = '';
      }
    } else {
      result[mapping[key]] = '';
    }
  }
  return result;
}

module.exports = { extractFields };
