# Node.js MLLP Listener & HL7-to-JSON Mapper

This project is a Node.js application that listens for HL7 messages over MLLP (Minimal Lower Layer Protocol), prints the original message and a mapped JSON version to the console, and sends the mapped data to the Lyrebird Health API. It also sends HL7 ACK responses back to the sender.

## Features
- Listens for HL7 messages on a TCP port using the MLLP protocol
- Prints the original HL7 message and the mapped JSON to the console
- Uses a configurable mapping file (`hl7-mapping.json`) to transform HL7 fields to JSON keys
- Sends the mapped JSON to the Lyrebird Health API (`/partnerapi/v1/appointments/`) with an API key
- Sends HL7 ACK responses to the sender
- Fully cross-platform: build standalone binaries for macOS, Linux, and Windows

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

## Building Standalone Executables
To build binaries for macOS, Linux, and Windows, run:
```sh
sh build.sh
```
- The executables will be placed in the `dist` directory and versioned (e.g., `mllp-server-1.0.0`, `mllp-server-1.0.0.exe`).
- The build uses [pkg](https://github.com/vercel/pkg) (automatically installed if missing).

## Running the App
You can run the app using Node.js or any of the built binaries.

### With Node.js
```sh
node mllp-server.js --apikey=YOUR_API_KEY --port=2575
```

### With Standalone Executables
- **macOS/Linux:**
  ```sh
  ./dist/mllp-server-1.0.0 --apikey=YOUR_API_KEY --port=2575
  ```
- **Windows:**
  ```cmd
  dist\mllp-server-1.0.0.exe --apikey=YOUR_API_KEY --port=2575
  ```

## Command-Line Parameters
- `--apikey=YOUR_API_KEY` : (Required) The API key for Lyrebird Health API. Overrides the `LYREBIRD_API_KEY` environment variable.
- `--port=PORT` : (Optional) The TCP port to listen on. Overrides the `PORT` environment variable. Default is `2575`.

You can also set these as environment variables:
- `LYREBIRD_API_KEY` : The API key for Lyrebird Health API.
- `PORT` : The TCP port to listen on.

## Configuration
- Edit `hl7-mapping.json` to define how HL7 fields map to JSON keys. Example:
  ```json
  {
    "PID.5.1": "patientLastName",
    "PID.5.2": "patientFirstName",
    "PID.7": "dateOfBirth",
    "PID.8": "sex",
    "SCH.1": "appointmentId",
    "SCH.11.4": "appointmentDateTime"
  }
  ```
- Set your Lyrebird Health API key as an environment variable or pass it as a command-line parameter.

## Customization
- Change the listening port or host by passing `--port=PORT` or setting the `PORT` environment variable.
- Update the mapping in `hl7-mapping.json` to match your HL7 message structure and desired JSON output.
- Adjust parsing rules in `hl7-parser-config.json` if needed.

## Troubleshooting
- Ensure your API key is set and valid.
- Check your firewall settings if you cannot connect to the server.
- Review console output for errors or API responses.

## License
MIT
