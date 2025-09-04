// logger.js
import fs from 'node:fs';
import path from 'node:path';

let messageCount = 0;

export function getLogFilePath(tail = false) {
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return path.join(process.cwd(), `logs-${y}${m}${d}${tail ? '-tail' : ''}.txt`);
}

export function appendToLogFile(entry) {
  const logFileTail = getLogFilePath(true);
  const logFileFinal = getLogFilePath(false);
  const formatted = `Timestamp: ${entry.timestamp}\nHL7:\n${entry.hl7}\n\nMapped JSON:\n${JSON.stringify(entry.mapped, null, 2)}\n\n---\n`;
  fs.appendFileSync(logFileTail, formatted, 'utf8');
  messageCount++;
  if (messageCount >= 10) {
    if (fs.existsSync(logFileFinal)) {
      fs.unlinkSync(logFileFinal);
    }
    fs.renameSync(logFileTail, logFileFinal);
    messageCount = 0;
  }
}
