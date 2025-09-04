import { extractFields } from '../src/mllp-node/complexHL7FieldExtraction.js';

const parserConfig = {
  segmentOffsets: { MSH: 1 },
  repetitionSeparator: '~',
  componentSeparator: '^',
};

describe('HL7 field extraction (real message)', () => {
  it('extracts patient and practitioner fields correctly', () => {
    const segments = [
      ["MSH","^~\\&","HIS","RLC","","","20250902","","ADT^A05","16","P","2.4","","","AL","NE","","","","","",""],
      ["EVN","A05","","","","","","",""],
      ["PID","1","","AH1234567^^^^MR^RLC~123 456 7891^^^NHS^NH^RLC~^^^^PI^RLC~","","Surname^First Name^^^^^L","","20250101","F","","","TigersHospital^^Auchtenlectalbert^^5AB 2JF^^P","","07777777777~","","","","","V00007605635","123 456 7891","","","","","","","","","","","","","","","","","","","","","",""],
      ["PD1","","","^^N82053^AINTREE PARK GROUPs PRACTICE","G8503501^HUBBERT CM^^",""],
      ["NK1","1","Test^Mum","M^","ALDER HEY^^LIVERPOOL^MERSEYSIDE^L14 5AB","07777777777","","",""],
      ["PV1","1","P","1.2 ENT","","F","","GKHONG^Khong^^Grace","","ENTFELLOW3","ENT","","","","","","","CLI","","","","ENTFELLOW3","","","","","","","","","","","","","","","","","","RLC","","PRE","","","","","","","","","","","","","","","","","",""],
    ];
    const mapping = {
      'PID.3.1.1': 'id',
      'PID.3.2.1': 'nhsNumber',
      'PID.5.1': 'name.family',
      'PID.5.2': 'name.given',
      'PID.7': 'dob',
      'PID.8': 'sex',
      'PID.11': 'address',
      'PID.13': 'phone',
      'PV1.7.1': 'practitioner.id',
      'PV1.7.2': 'practitioner.name.family',
      'PV1.7.3': 'practitioner.name.title',
      'PV1.7.4': 'practitioner.name.given',
      'PV1.10': 'practitioner.role',
      'PV1.3': 'location',
      'SCH.7': 'start',
      'SCH.8': 'duration',
    };
    const result = extractFields(segments, mapping, '', parserConfig);
    expect(result['patient.id']).toBe('AH1234567');
    expect(result['patient.name.family']).toBe('Surname');
    expect(result['patient.dob']).toBe('20250101');
    expect(result['patient.sex']).toBe('F');
    expect(result['practitioner.id']).toBe('GKHONG');
    expect(result['practitioner.name.family']).toBe('Khong');
    expect(result['practitioner.name.title']).toBe('');
    expect(result['practitioner.name.given']).toBe('Grace');
    expect(result['practitioner.role']).toBe('ENTFELLOW3');
  });
});
