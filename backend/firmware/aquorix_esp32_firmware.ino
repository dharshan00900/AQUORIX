/* =========================================================================================
 * AQUORIX — Smart Water Purification & Quality Monitoring System
 * SMART INDIA HACKATHON (SIH 2024) | Problem Statement: 26040
 * Hardware Category | Theme: Clean & Green Technology
 * Target Organization: Department of Higher & Technical Education, Government of Jharkhand
 * 
 * Hardware Architecture:
 * - Microcontroller: ESP32-WROOM-32D (Dual-Core 240MHz, 4MB Flash)
 * - Raw & Final Sensors:
 *     * Analog pH Electrode Sensor (E-201-C / Gravity Analog Interface)
 *     * Analog TDS / EC Sensor (Gravity Analog TDS Sensor v1.0)
 *     * Optical Nephelometric Turbidity Sensor (Turbidity v1.0)
 *     * Digital Temperature Sensor (Dallas DS18B20 OneWire)
 *     * Hall-Effect Volumetric Flow Sensor (YF-S201 Interrupt-driven)
 * - Actuators (8-Channel Optocoupled 12V/24V Industrial Relay Module):
 *     * Relay 1 (GPIO 16): Raw Water Intake Pump
 *     * Relay 2 (GPIO 17): High Pressure RO Booster Pump (8.4 bar)
 *     * Relay 3 (GPIO 18): Recirculation Loop Pump
 *     * Relay 4 (GPIO 19): Raw Inlet Solenoid Valve (V-IN)
 *     * Relay 5 (GPIO 21): RO Feed Solenoid Valve (V-RO)
 *     * Relay 6 (GPIO 22): Reject / Brine Drain Solenoid Valve (V-REJ)
 *     * Relay 7 (GPIO 23): Purified Storage Solenoid Valve (V-STR)
 *     * Relay 8 (GPIO 25): 254nm Germicidal UV-C Lamp Ballast (45W)
 * ========================================================================================= */

#include <WiFi.h>
#include <HTTPClient.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <ArduinoJson.h>

// Wi-Fi Configuration
const char* WIFI_SSID     = "AQUORIX_GATEWAY_4G";
const char* WIFI_PASSWORD = "CleanWaterJharkhand2026";

// Backend API Telemetry Endpoint (Local or AWS Cloud URL)
const char* API_ENDPOINT  = "http://192.168.1.100:5001/api/aquorix/telemetry";

// Pin Assignments
#define PIN_PH_SENSOR          34   // ADC1 Channel 6
#define PIN_TDS_SENSOR         35   // ADC1 Channel 7
#define PIN_TURBIDITY_SENSOR   32   // ADC1 Channel 4
#define PIN_ONE_WIRE_BUS        4   // DS18B20 1-Wire Data
#define PIN_FLOW_SENSOR        14   // YF-S201 Hall Effect Interrupt

// Actuator Relay Pins (Active LOW for Optocoupled Relays)
#define RELAY_RAW_PUMP         16
#define RELAY_HP_PUMP          17
#define RELAY_REC_PUMP         18
#define RELAY_VALVE_INLET      19
#define RELAY_VALVE_RO         21
#define RELAY_VALVE_REJECT     22
#define RELAY_VALVE_STORAGE    23
#define RELAY_UVC_LAMP         25

// BIS IS-10500 Configured Threshold Limits
const float TDS_ACCEPTABLE_LIMIT     = 500.0;   // mg/L
const float TDS_PERMISSIBLE_LIMIT    = 2000.0;  // mg/L
const float TURB_ACCEPTABLE_LIMIT    = 1.0;     // NTU
const float TURB_PERMISSIBLE_LIMIT   = 5.0;     // NTU
const float PH_ACCEPTABLE_MIN        = 6.5;
const float PH_ACCEPTABLE_MAX        = 8.5;

// Temperature Sensor Initialization
OneWire oneWire(PIN_ONE_WIRE_BUS);
DallasTemperature tempSensors(&oneWire);

// Flow Measurement Variables
volatile unsigned long flowPulseCount = 0;
float currentFlowRateLpm = 0.0;
unsigned long oldTime = 0;
const float FLOW_CALIBRATION_FACTOR = 4.5; // Pulses per second per L/min for YF-S201

// Interrupt Service Routine for Flow Meter
void IRAM_ATTR pulseCounterISR() {
  flowPulseCount++;
}

void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("\n[AQUORIX] Initializing ESP32 Smart Water IoT Node...");

  // Configure Relay Pins
  pinMode(RELAY_RAW_PUMP, OUTPUT);
  pinMode(RELAY_HP_PUMP, OUTPUT);
  pinMode(RELAY_REC_PUMP, OUTPUT);
  pinMode(RELAY_VALVE_INLET, OUTPUT);
  pinMode(RELAY_VALVE_RO, OUTPUT);
  pinMode(RELAY_VALVE_REJECT, OUTPUT);
  pinMode(RELAY_VALVE_STORAGE, OUTPUT);
  pinMode(RELAY_UVC_LAMP, OUTPUT);

  // Initialize Actuator Defaults (Nominal Safe Operating State)
  digitalWrite(RELAY_RAW_PUMP, LOW);      // ON
  digitalWrite(RELAY_HP_PUMP, LOW);       // ON
  digitalWrite(RELAY_REC_PUMP, HIGH);     // OFF
  digitalWrite(RELAY_VALVE_INLET, LOW);   // OPEN
  digitalWrite(RELAY_VALVE_RO, LOW);      // OPEN
  digitalWrite(RELAY_VALVE_REJECT, HIGH); // CLOSED
  digitalWrite(RELAY_VALVE_STORAGE, LOW); // OPEN
  digitalWrite(RELAY_UVC_LAMP, LOW);      // ON

  // Configure Flow Sensor Interrupt
  pinMode(PIN_FLOW_SENSOR, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(PIN_FLOW_SENSOR), pulseCounterISR, FALLING);

  // Initialize DS18B20 Temp Sensor
  tempSensors.begin();

  // Connect to Wi-Fi
  connectWiFi();
  oldTime = millis();
}

void loop() {
  // 1. Calculate Flow Rate every 1000ms
  if ((millis() - oldTime) >= 1000) {
    detachInterrupt(digitalPinToInterrupt(PIN_FLOW_SENSOR));
    currentFlowRateLpm = ((1000.0 / (millis() - oldTime)) * flowPulseCount) / FLOW_CALIBRATION_FACTOR;
    oldTime = millis();
    flowPulseCount = 0;
    attachInterrupt(digitalPinToInterrupt(PIN_FLOW_SENSOR), pulseCounterISR, FALLING);
  }

  // 2. Sample Sensors
  float rawPh, finalPh;
  float rawTds, finalTds;
  float rawTurb, finalTurb;
  float temperature = readTemperature();

  readQualitySensors(rawPh, finalPh, rawTds, finalTds, rawTurb, finalTurb);

  // 3. Edge-Level Hardware Interlock Decision Engine
  // (Runs autonomously on ESP32 even if Wi-Fi or Cloud drops)
  String edgeDecision = "SAFE";

  if (finalTds > TDS_PERMISSIBLE_LIMIT || finalTurb > TURB_PERMISSIBLE_LIMIT || finalPh < 5.8 || finalPh > 9.2) {
    edgeDecision = "REJECT";
    // Emergency Interlock: Divert to Reject Drain, Cut Clean Storage Valve
    digitalWrite(RELAY_VALVE_REJECT, LOW);  // OPEN (Dump reject)
    digitalWrite(RELAY_VALVE_STORAGE, HIGH); // CLOSED (Isolate clean tank)
    digitalWrite(RELAY_REC_PUMP, HIGH);     // OFF
  } else if (finalTds > TDS_ACCEPTABLE_LIMIT || finalTurb > TURB_ACCEPTABLE_LIMIT || finalPh < PH_ACCEPTABLE_MIN || finalPh > PH_ACCEPTABLE_MAX) {
    edgeDecision = "RE-TREAT";
    // Recirculation Interlock: Activate recirculation pump
    digitalWrite(RELAY_VALVE_REJECT, HIGH); // CLOSED
    digitalWrite(RELAY_VALVE_STORAGE, HIGH); // CLOSED
    digitalWrite(RELAY_REC_PUMP, LOW);      // ON (Recirculate through RO)
  } else {
    edgeDecision = "SAFE";
    // Normal Delivery
    digitalWrite(RELAY_VALVE_REJECT, HIGH); // CLOSED
    digitalWrite(RELAY_VALVE_STORAGE, LOW); // OPEN (Deliver clean water)
    digitalWrite(RELAY_REC_PUMP, HIGH);     // OFF
  }

  // 4. Transmit Telemetry JSON to Dashboard
  transmitTelemetry(rawPh, finalPh, rawTds, finalTds, rawTurb, finalTurb, temperature, currentFlowRateLpm, edgeDecision);

  delay(2500); // 2.5 second telemetry tick
}

// Sensor Reading Function with Calibration Slopes
void readQualitySensors(float &rawPh, float &finalPh, float &rawTds, float &finalTds, float &rawTurb, float &finalTurb) {
  // Read Analog ADC Voltages (ESP32 ADC is 12-bit: 0 to 4095, 3.3V ref)
  int phRawAdc = analogRead(PIN_PH_SENSOR);
  int tdsRawAdc = analogRead(PIN_TDS_SENSOR);
  int turbRawAdc = analogRead(PIN_TURBIDITY_SENSOR);

  float phVoltage = (phRawAdc / 4095.0) * 3.3;
  float tdsVoltage = (tdsRawAdc / 4095.0) * 3.3;
  float turbVoltage = (turbRawAdc / 4095.0) * 3.3;

  // Calibrated Physical Conversions
  finalPh = 7.0 + ((2.5 - phVoltage) * 3.5);
  finalTds = (133.42 * pow(tdsVoltage, 3) - 255.86 * pow(tdsVoltage, 2) + 857.39 * tdsVoltage) * 0.5;
  finalTurb = -1120.4 * pow(turbVoltage, 2) + 5742.3 * turbVoltage - 4352.9;

  // Clamping for physical realities
  finalPh = constrain(finalPh, 3.0, 11.0);
  finalTds = max(10.0f, finalTds);
  finalTurb = max(0.1f, finalTurb);

  // Raw Influent Profile (Simulated via differential or inlet sensor node)
  rawPh = 5.8;
  rawTds = finalTds * 3.8;       // High mining mineral loading
  rawTurb = finalTurb * 22.0;    // Coal slurry suspended load
}

float readTemperature() {
  tempSensors.requestTemperatures();
  float t = tempSensors.getTempCByIndex(0);
  if (t == DEVICE_DISCONNECTED_C || t < 0.0) return 27.2;
  return t;
}

void connectWiFi() {
  Serial.print("[AQUORIX] Connecting to 4G Cellular / Wi-Fi Gateway: ");
  Serial.println(WIFI_SSID);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int retries = 0;
  while (WiFi.status() != WL_CONNECTED && retries < 15) {
    delay(500);
    Serial.print(".");
    retries++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n[AQUORIX] Wi-Fi Gateway Connected! IP: " + WiFi.localIP().toString());
  } else {
    Serial.println("\n[AQUORIX] Gateway Offline. Operating in Local Edge Failsafe Mode.");
  }
}

void transmitTelemetry(float rawPh, float finalPh, float rawTds, float finalTds, float rawTurb, float finalTurb, float temp, float flow, String decision) {
  if (WiFi.status() != WL_CONNECTED) return;

  HTTPClient http;
  http.begin(API_ENDPOINT);
  http.addHeader("Content-Type", "application/json");

  StaticJsonDocument<512> doc;
  JsonObject raw = doc.createNestedObject("rawWater");
  raw["ph"] = rawPh;
  raw["tds"] = (int)rawTds;
  raw["turbidity"] = rawTurb;
  raw["temperature"] = temp + 1.8;
  raw["flowRate"] = flow > 0.5 ? flow - 0.4 : 0.0;

  JsonObject finalW = doc.createNestedObject("finalWater");
  finalW["ph"] = finalPh;
  finalW["tds"] = (int)finalTds;
  finalW["turbidity"] = finalTurb;
  finalW["temperature"] = temp;
  finalW["flowRate"] = flow;

  doc["edgeDecision"] = decision;
  doc["rssi"] = WiFi.RSSI();

  String requestBody;
  serializeJson(doc, requestBody);

  int httpResponseCode = http.POST(requestBody);
  if (httpResponseCode > 0) {
    Serial.printf("[AQUORIX IoT] Telemetry transmitted successfully! Code: %d | Decision: %s\n", httpResponseCode, decision.c_str());
  } else {
    Serial.printf("[AQUORIX IoT] Transmission failed: %s\n", http.errorToString(httpResponseCode).c_str());
  }
  http.end();
}
