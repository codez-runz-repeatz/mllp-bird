import { extractFields } from '../src/mllp-node/simpleHL7FieldExtraction.js';

describe('extractHL7Fields', () => {
  it('should extract fields from HL7 message based on config', () => {
    const hl7Message = 'MSH|^~\\&|SendingApp|SendingFac|ReceivingApp|ReceivingFac|202201011200||ADT^A01|123456|P|2.3\rPID|1||12345^^^Hospital^MR||Doe^John';
    const config = {
      fields: [
        { segment: 'MSH', field: 3, name: 'SendingApp' },
        { segment: 'PID', field: 5, name: 'PatientName' }
      ]
    };
    const result = extractFields(hl7Message, config);
    expect(result).toEqual({
      SendingApp: 'SendingFac',
      PatientName: 'Doe^John'
    });
  });
});
