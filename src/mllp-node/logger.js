const fs = require('fs');
const path = require('path');

let messageCount = 0;
// Always use current working directory for logs
const logDir = process.cwd();
function getLogFilePath(tail = false) {
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return path.join(logDir, `logs-${y}${m}${d}${tail ? '-tail' : ''}.txt`);
}
// Print intended log file path and the actual file loaded
console.log('[MLLP LOGGER] Intended log file path:', getLogFilePath(true));
console.log('[MLLP LOGGER] logger.js loaded from:', __filename);
function appendToLogFile(entry) {
  const logFileTail = getLogFilePath(true);
  const logFileFinal = getLogFilePath(false);
  let mappedSection = '';
  if (entry.mappedAppointments && entry.mappedPractitioner !== undefined) {
    mappedSection = `Mapped JSON (appointments):\n${JSON.stringify(entry.mappedAppointments, null, 2)}\n\nMapped JSON (practitioner):\n${JSON.stringify(entry.mappedPractitioner, null, 2)}\n`;
  } else if (entry.mappedAppointments) {
    mappedSection = `Mapped JSON (appointments):\n${JSON.stringify(entry.mappedAppointments, null, 2)}\n`;
  } else if (entry.mappedPractitioner) {
    mappedSection = `Mapped JSON (practitioner):\n${JSON.stringify(entry.mappedPractitioner, null, 2)}\n`;
  } else if (entry.mapped) {
    mappedSection = `Mapped JSON:\n${JSON.stringify(entry.mapped, null, 2)}\n`;
  } else {
    mappedSection = 'Mapped JSON: {}\n';
  }
  const formatted = `Timestamp: ${entry.timestamp}\nHL7:\n${entry.hl7}\n\n${mappedSection}\n---\n`;
  try {
    fs.appendFileSync(logFileTail, formatted, 'utf8');
  } catch (err1) {
    // Fallback: print error, but do not write to /tmp
    console.warn('[MLLP LOGGER] Failed to write log file:', err1.message);
  }
  messageCount++;
  if (messageCount >= 10) {
    try {
      if (fs.existsSync(logFileFinal)) {
        fs.unlinkSync(logFileFinal);
      }
      fs.renameSync(logFileTail, logFileFinal);
    } catch (err) {
      // Fallback: print error, but do not write to /tmp
      console.warn('[MLLP LOGGER] Failed to rotate log file:', err.message);
    }
    messageCount = 0;
  }
}

module.exports = { getLogFilePath, appendToLogFile };
