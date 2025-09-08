const { appointment, practitioner } = require('../HL7/packetParser.js');
const { loadConfig, mappingAppointments, mappingPractitioner } = require('./params.js');

const mappAppointments = mappingAppointments();
const mappPractitioner = loadConfig('hl7-mapping-practitioner.json');
const parserConfig = loadConfig('hl7-parser-config.json');

const SB = String.fromCharCode(0x0b); // <VT> vertical tab
const EB = String.fromCharCode(0x1c); // <FS> file separator
const CR = '\r';

class HL7Mapper {
  constructor(hl7) {
    this.hl7 = hl7;
  }

  appointments() {

    return appointment(this.hl7, mappAppointments, parserConfig);
  }

  practitioner() {
    return practitioner(this.hl7, mappPractitioner, parserConfig);
  }

  acknowledgment() {

    // Parse MSH fields for ACK // we should add configurable ACK generation later
      const mshFields = this.hl7.split('\r')[0].split(parserConfig.fieldSeparator);
      const sendingApp = mshFields[2] || '';
      const sendingFacility = mshFields[3] || '';
      const receivingApp = mshFields[4] || '';
      const receivingFacility = mshFields[5] || '';
      const messageControlId = mshFields[9] || '1';
      const messageType = mshFields[8] || 'ACK';
      // Build HL7 ACK with correct fields
      const ack = `${SB}MSH|^~\\&|${receivingApp}|${receivingFacility}|${sendingApp}|${sendingFacility}|${new Date().toISOString().replace(/[-:T]/g, '').slice(0,14)}||ACK^${messageControlId}|${messageControlId}|P|2.3${CR}MSA|AA|${messageControlId}${CR}${EB}${CR}`;
      return ack;
  }
}

module.exports = HL7Mapper;