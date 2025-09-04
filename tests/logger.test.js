import { getLogFilePath, appendToLogFile } from '../src/mllp-node/logger.js';
import fs from 'fs';

describe('logger', () => {
  it('should write a log message to the log file', () => {
    const testMessage = 'Test log message';
    appendToLogFile({ hl7: testMessage });
    const logFile = getLogFilePath();
    const logContent = fs.readFileSync(logFile, 'utf8');
    expect(logContent).toMatch(testMessage);
    expect(logContent).toMatch(/MLLP LOGGER/);
  });
});
