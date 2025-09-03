# Node.js MLLP Listener & HL7-to-JSON Mapper

This project is a Node.js application that listens for HL7 messages over MLLP (Minimal Lower Layer Protocol), prints the original message and a mapped JSON version to the console, and sends the mapped data to the Lyrebird Health API. It also sends HL7 ACK responses back to the sender.

## Features
- Listens for HL7 messages on a TCP port using the MLLP protocol
- Prints the original HL7 message and the mapped JSON to the console
- Uses a configurable mapping file (`hl7-mapping.json`) to transform HL7 fields to JSON keys
- Sends the mapped JSON to the Lyrebird Health API (`/partnerapi/v1/appointments/`) with an API key
- Sends HL7 ACK responses to the sender

## Prerequisites
- Node.js (v18 or newer recommended)
- Internet access (to reach the Lyrebird Health API)

## Installation
1. Clone or download this repository to your machine.
2. Open a terminal in the project directory.
3. Install dependencies:
   ```sh
   npm install
   ```

## Configuration
- Edit `hl7-mapping.json` to define how HL7 fields map to JSON keys. Example:
  ```json
  {
    "PID.5.1": "patientLastName",
    "PID.5.2": "patientFirstName",
    "PID.7": "dateOfBirth",
    "PID.8": "sex",
    "SCH.1": "appointmentId",
    "SCH.11.4": "appointmentDateTime",
    "PID.5": "patientName"
  }
  ```
- Set your Lyrebird Health API key as an environment variable:
  - On macOS/Linux:
    ```sh
    export LYREBIRD_API_KEY=your_api_key_here
    ```
  - On Windows (cmd):
    ```cmd
    set LYREBIRD_API_KEY=your_api_key_here
    ```
  - On Windows (PowerShell):
    ```powershell
    $env:LYREBIRD_API_KEY="your_api_key_here"
    ```

## Usage
1. Start the server:
   ```sh
   node mllp-server.js
   ```
2. The server will listen on port 2575 for incoming HL7 messages.
3. When a message is received:
   - The original HL7 message is printed.
   - The mapped JSON is printed.
   - The JSON is sent to the Lyrebird Health API.
   - An HL7 ACK is sent back to the sender.

## Customization
- Change the listening port or host by editing the `PORT` and `HOST` constants in `mllp-server.js`.
- Update the mapping in `hl7-mapping.json` to match your HL7 message structure and desired JSON output.

## Troubleshooting
- Ensure your API key is set and valid.
- Check your firewall settings if you cannot connect to the server.
- Review console output for errors or API responses.

## License
MIT
