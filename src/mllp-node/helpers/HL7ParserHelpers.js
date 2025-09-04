class HL7ParserHelpers {
  
static getOffset(parserConfig, segName) {
    return parserConfig?.segmentOffsets?.[segName] || 0;
}
}

module.exports = HL7ParserHelpers;
