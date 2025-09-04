import { getLogFilePath, appendToLogFile } from '../src/mllp-node/logger.js';
import fs from 'fs';

describe('logger edge cases', () => {
  it('getLogFilePath returns a string', () => {
    expect(typeof getLogFilePath()).toBe('string');
  });
  it('appendToLogFile appends multiple lines', () => {
    const logFile = getLogFilePath();
    appendToLogFile({ hl7: 'line1' });
    appendToLogFile({ hl7: 'line2' });
    const logContent = fs.readFileSync(logFile, 'utf8');
    expect(logContent).toMatch(/line1/);
    expect(logContent).toMatch(/line2/);
    expect(logContent).toMatch(/MLLP LOGGER/);
  });
});
