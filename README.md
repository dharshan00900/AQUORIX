# AQUORIX — Smart Water Purification & Quality Monitoring IoT System
**Smart India Hackathon (SIH 2024)**  
**Problem Statement ID:** 26040 | **Category:** Hardware | **Theme:** Clean & Green Technology  
**Organization:** Government of Jharkhand (Department of Higher & Technical Education)

---

## Project Structure
- rontend/: React 19 + TypeScript + Vite IoT web control center
- ackend/: Express + SSE IoT Gateway API server (server.js)
- ackend/firmware/: ESP32 Arduino C++ firmware (quorix_esp32_firmware.ino)
- SIH_26040_AQUORIX_PROJECT_REPORT.md: Full technical dossier & judge presentation manual

## Quick Start

### 1. Run Frontend Web Dashboard
`ash
cd frontend
npm run dev
`
Open http://localhost:5173/

### 2. Run IoT Gateway Server (Optional)
`ash
cd backend
npm start
`
Runs at http://localhost:5001/

### 3. ESP32 Hardware Firmware
Open ackend/firmware/aquorix_esp32_firmware.ino in Arduino IDE or PlatformIO.
Set your 4G/Wi-Fi credentials and flash to ESP32.
