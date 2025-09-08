// mllp-server.js
const net = require('net');
const { appendToLogFile } = require('./logger.js');
const { postPractitioner, postAppointments } = require('./httpsClient.js');
const { snifferPort } = require('./helpers/params.js');

const SB = String.fromCharCode(0x0b); // <VT> vertical tab
const EB = String.fromCharCode(0x1c); // <FS> file separator
const CR = '\r';

const HL7Mapper = require('./helpers/hl7mappers.js');

const server = net.createServer((socket) => {
  let buffer = '';
  socket.on('data', (data) => {
    buffer += data.toString();
    let start, end;
    while ((start = buffer.indexOf(SB)) !== -1 && (end = buffer.indexOf(EB + CR)) !== -1) {
      const hl7 = buffer.substring(start + 1, end);

      const hl7Mapper = new HL7Mapper(hl7);
      
      const mappedAppointments = hl7Mapper.appointments();
      const mappedPractitioner = hl7Mapper.practitioner();
      
      appendToLogFile({hl7, timestamp: new Date().toISOString(), mappedAppointments, mappedPractitioner});
      
      postPractitioner(mappedPractitioner);
      postAppointments(mappedAppointments);

      const acknowledgment = hl7Mapper.acknowledgment();
      socket.write(acknowledgment);
      buffer = buffer.slice(end + 2);
    }
  });
  socket.on('end', () => {
    console.log('Client disconnected');
  });
  socket.on('error', (err) => {
    console.error('Socket error:', err);
  });
});

async function pusher(){
  server.listen(snifferPort(), () => {
    console.log(`MLLP server listening on port ${snifferPort()}`);
  });
}

module.exports = { pusher };
