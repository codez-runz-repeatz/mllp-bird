// mllp-server.js
import net from 'node:net';
import fs from 'node:fs';
import https from 'node:https';
import { parseHL7toJSON } from './HL7JSONParser.js';
import path from 'node:path';
import { getLogFilePath, appendToLogFile } from './logger.js';
import { restApiForward } from './restApiForward.js';

const PORT = process.env.MLLP_PORT || 2575;

const server = net.createServer(socket => {
  console.log('Client connected');
  socket.on('data', data => {
    console.log('Received data:', data.toString());
    // You can add HL7 parsing/ACK logic here
  });
  socket.on('end', () => {
    console.log('Client disconnected');
  });
  socket.on('error', err => {
    console.error('Socket error:', err);
  });
});

server.listen(PORT, () => {
  console.log(`MLLP server listening on port ${PORT}`);
});

