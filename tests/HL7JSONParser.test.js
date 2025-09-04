import { parseHL7toJSON } from '../src/mllp-node/HL7JSONParser.js';

describe('parseHL7ToJSON', () => {
  it('should parse HL7 message to JSON', () => {
    const hl7Message = 'MSH|^~\\&|App|Fac|App|Fac|202201011200||ADT^A01|123456|P|2.3\rPID|1||12345^^^Hospital^MR||Doe^John';
    const mapping = {
      MSH: { 3: 'SendingApp' },
      PID: { 5: 'PatientName' }
    };
    const result = parseHL7toJSON(hl7Message, mapping);
    expect(result).toEqual({
      SendingApp: 'App',
      PatientName: ''
    });
  });
});
