// mllp-server.js
const { fetch } = require('./mllp-fetcher.js');
const { pusher } = require('./mllp-pusher.js');

console.log(`
 ,_   ,_   ,_   ,_  
(o,o)(o,o)(o,o)(o,o)
{ " }{ " }{ " }{ " }
-"-"--"-"--"-"--"-"-
** MLLP-BIRD(HL7) **
`);

// Start fetching notes and pushing HL7 messages
fetch();
// Start processing incoming HL7 messages
pusher();
