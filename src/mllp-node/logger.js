import fs from 'node:fs';
import path from 'node:path';
let logFilePath = path.join(process.cwd(), 'app.log');
export function getLogFilePath() {
  return logFilePath;
}
const MLLP_LOGO = `MLLP LOGGER`;
export function printLogo() {
  console.log(MLLP_LOGO);
}
export function appendToLogFile(entry, parsedSegments, mapped) {
  // Compose a clean, structured log
  let log = '';
  log += MLLP_LOGO + '\n';
  log += '================ MLLP Packet Received ================\n';
  if (entry.hl7) {
    log += entry.hl7 + '\n';
  }
  log += '------------------------------------------------------\n';
  log += '================= Transformed JSON ===================\n';
  if (mapped) {
    log += JSON.stringify(mapped, null, 2) + '\n';
  } else if (entry.mapped) {
    log += JSON.stringify(entry.mapped, null, 2) + '\n';
  }
  log += '------------------------------------------------------\n';
  log += '================== Parsed HL7 ========================\n';
  if (parsedSegments) {
    // Add a blank line between each segment for readability
    log += parsedSegments.split('\n').join('\n\n') + '\n';
  }
  log += '======================================================\n';
  fs.appendFileSync(logFilePath, log + '\n', 'utf8');
  // Only print to console if debug flag is set
  const DEBUG = process.env.DEBUG === 'true' || process.argv.includes('--debug') || process.argv.includes('--logplease');
  if (DEBUG) {
    console.log(log);
  }
}
