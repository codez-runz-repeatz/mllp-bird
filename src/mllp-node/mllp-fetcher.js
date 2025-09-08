const { getNotes } = require('./httpsClient');
const net = require('net');
const { shouldFetch } = require('./helpers/params.js');

function sendHL7ToEMR(hl7Message, emrHost, emrPort) {
  return new Promise((resolve, reject) => {
    const START_BLOCK = String.fromCharCode(0x0b);
    const END_BLOCK = String.fromCharCode(0x1c);
    const CARRIAGE_RETURN = String.fromCharCode(0x0d);
    const framedMessage = START_BLOCK + hl7Message + END_BLOCK + CARRIAGE_RETURN;
    const client = new net.Socket();

    client.connect(emrPort, emrHost, () => {
      client.write(framedMessage);
    });
    client.on('data', (data) => {
      client.destroy();
      resolve(data.toString());
    });
    client.on('error', (err) => {
      client.destroy();
      reject(err);
    });
    client.on('close', () => {});
  });
}

function fetch() {
  if(shouldFetch()){
    
    async function fetchNote() {
    try {
      const note = await getNotes();
      console.log('Fetched note:', note);
      
      if (note && note.hl7notes) {
        try {
          const ack = await sendHL7ToEMR(note.hl7notes, emrHost, emrPort);
          console.log('HL7 message sent to EMR. ACK:', ack);
        } catch (err) {
          console.error('Error sending HL7 to EMR:', err);
        }
      } else {
        console.warn('No hl7notes field found in response.');
      }
    } catch (err) {
      console.error('Error fetching note:', err);
    }
  }

  fetchNote();
  //setInterval(fetchNote, 5 * 60 * 1000);
  setInterval(fetchNote, 5 * 1000);
}
}

module.exports = { fetch };