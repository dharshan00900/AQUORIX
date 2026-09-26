# AQUORIX — Project Technical Report & SIH 26040 Dossier

> **Smart Water Purification and Quality Monitoring System for Rural and Mining-Affected Areas**  
> **Smart India Hackathon (SIH 2024)**  
> **Problem Statement ID:** 26040 | **Category:** Hardware | **Theme:** Clean & Green Technology  
> **Organization:** Government of Jharkhand  
> **Department:** Department of Higher & Technical Education  

---

## 1. Executive Summary & Problem Context

In the mining and industrial heartlands of Jharkhand—including the Dhanbad, Jharia, Bokaro, and West Singhbhum coal and mineral belts—groundwater and surface water sources are heavily degraded by:
1. **Acid Mine Drainage (AMD):** Pyrite ($FeS_2$) oxidation produces sulfuric acid, dropping water pH as low as 4.2–5.8 and leaching heavy minerals.
2. **Coal Dust & Particulate Slurry:** Surface runoff from open-cast pits leads to severe turbidity (often exceeding 20–50 NTU).
3. **Elevated Mineral Salinity (High TDS):** Deep aquifer seepage often elevates Total Dissolved Solids to 1,200–2,600 mg/L, far above the Bureau of Indian Standards (BIS IS-10500) acceptable limit of 500 mg/L.
4. **Rural Inaccessibility & Monitoring Void:** Communities consume unmonitored contaminated well and pit water without real-time feedback or automated failsafes.

**AQUORIX** addresses this with an integrated, portable, multi-barrier purification and dual-stream IoT telemetry station. The system continuously profiles raw water intake, executes targeted stage-by-stage physical and chemical purification, evaluates permeate against statutory standards via an autonomous decision engine, and dynamically recirculates or rejects out-of-spec batches.

---

## 2. Multi-Barrier Purification Process Architecture

Based on the engineering schematic, AQUORIX uses a 13-stage continuous multi-barrier sequence:

```
[ Raw Water Tank ]
       │
       ▼
[ Inlet Sensor Node (pH, TDS, Turbidity, Temp) ]
       │
       ▼
[ PSF: 5µm Polypropylene Pre-Sediment Filter ] ──► Removes coarse sand, silt, coal dust
       │
       ▼
[ ACF: Granular Activated Carbon Filter ] ───────► Adsorbs organic matter, chlorine, odor
       │
       ▼
[ IRF: Birm / MnO2 Iron Removal Filter ] ────────► Catalytic oxidation of Fe2+ and Mn
       │
       ▼
[ MF: 1µm Spun Micro-Guard Filter ] ─────────────► Traps carbon fines & micron particulates
       │
       ▼
[ Anti-Scalant Metering Dosing Pump ] ───────────► Prevents CaCO3 & silica scale on RO
       │
       ▼
[ High Pressure Multistage Booster Pump (8.4 bar) ]
       │
       ▼
[ Thin-Film Composite RO / Nanofiltration Membrane ] ──► Cross-flow mineral ion rejection (94%+)
       │                                                      │
       │ (Permeate Stream)                                    │ (Reject / Brine Stream)
       ▼                                                      ▼
[ Calcite & Dolomite pH Remineralization Bed ]          [ Solenoid Valve V-REJ ] ──► Drain
       │ (Buffers pH to 6.5–8.5, restores Ca2+/Mg2+)
       ▼
[ 254nm Germicidal UV-C Disinfection Chamber ] ──► Destroys microbial DNA (99.99% kill)
       │
       ▼
[ Final Sensor Node (pH, TDS, Turbidity, Temp, Flow) ]
       │
       ▼
[ Decision Engine Arbitration Node ]
       │
       ├─────────────────────────────────┬─────────────────────────────────┐
       ▼                                 ▼                                 ▼
   🟢 SAFE                           🟠 RE-TREAT                       🔴 REJECT
[ Valve V-STR OPEN ]              [ Pump P-REC ON ]               [ Valve V-REJ OPEN ]
Clean Community Tank              Recirculate through RO/NF       Divert to Reject Drain
```

---

## 3. Statutory Water Quality Standards (BIS IS-10500:2012)

The AQUORIX Decision Engine evaluates final water against the following configured limits:

| Parameter | Unit | BIS Acceptable Limit | BIS Permissible Limit | Operational Classification |
|---|---|---|---|---|
| **pH** | — | 6.5 – 8.5 | No relaxation below 6.5 or above 8.5 | Chemical Potability Standard |
| **Total Dissolved Solids (TDS)** | mg/L | $\le 500$ | $\le 2000$ | Mineralization Potability Standard |
| **Turbidity** | NTU | $\le 1.0$ | $\le 5.0$ | Optical Clarity Standard |
| **Temperature** | °C | 15.0 – 35.0 (Optimal) | — | Operational Parameter Only |
| **Flow Rate** | L/min | 3.0 – 6.0 (Nominal) | — | Volumetric Fluid Parameter Only |

### Autonomous Decision Engine Rules:
1. **🟢 SAFE:**
   - $\text{pH} \in [6.5, 8.5]$
   - $\text{TDS} \le 500\text{ mg/L}$
   - $\text{Turbidity} \le 1.0\text{ NTU}$
   - *Actuator Command:* `V-STR = OPEN`, `V-REJ = CLOSED`, `P-REC = OFF`. Water delivered to community reservoir.
2. **🟠 RE-TREAT:**
   - Any parameter exceeds the acceptable limit but remains within the permissible boundary:
     - $500 < \text{TDS} \le 2000\text{ mg/L}$, OR
     - $1.0 < \text{Turbidity} \le 5.0\text{ NTU}$, OR
     - $\text{pH} \in [5.8, 6.5)$ or $(8.5, 9.2]$
   - *Actuator Command:* `V-STR = CLOSED`, `V-REC = OPEN`, `P-REC = ON`. Re-routed through RO/NF membrane for secondary polishing pass (up to 3 automated cycles).
3. **🔴 REJECT:**
   - Any parameter violates the permissible limit:
     - $\text{TDS} > 2000\text{ mg/L}$, OR
     - $\text{Turbidity} > 5.0\text{ NTU}$, OR
     - $\text{pH} < 5.8$ or $> 9.2$, OR
     - Critical hardware fault (High Pressure Pump trip, UV-C lamp unpowered).
   - *Actuator Command:* `V-STR = CLOSED`, `V-REJ = OPEN`. Immediate diversion to reject discharge.

---

## 4. Hardware Bill of Materials (BOM) & Microcontroller Pinout

| Subsystem | Component | Specifications | Interface / Pin |
|---|---|---|---|
| **Core Compute** | ESP32-WROOM-32D | Dual-Core 240MHz, 4MB Flash, Wi-Fi & BLE | Master Gateway |
| **pH Sensor** | Industrial Analog pH Probe | E-201-C glass bulb, 0–14 pH, BNC connector | ADC1 / GPIO 34 |
| **TDS Sensor** | Gravity Analog TDS Meter | 0–1000 ppm, titanium probes, 3.3V ADC | ADC1 / GPIO 35 |
| **Turbidity Sensor** | Optical Turbidity Sensor | Infrared nephelometry 0–3000 NTU | ADC1 / GPIO 32 |
| **Temperature** | Dallas DS18B20 | Stainless steel probe, -55°C to +125°C | OneWire / GPIO 4 |
| **Flow Meter** | YF-S201 Hall Effect | 1–30 L/min, 450 pulses/L | Interrupt / GPIO 14 |
| **Relay Board** | 8-Channel 5V/12V Relay | Optocoupled industrial isolation, 10A/250VAC | GPIO 16, 17, 18, 19, 21, 22, 23, 25 |
| **Booster Pump** | Multistage Diaphragm Pump | 24VDC, 8.4 bar (120 PSI) discharge | Relay 2 |
| **UV-C Chamber** | Philips TUV 254nm Quartz Tube | 45W Electronic Ballast, 42 mJ/cm² dose | Relay 8 |
| **Valves** | 12V Solenoid Valves | Normally Closed (NC), Brass 1/2" NPT | Relays 4, 5, 6, 7 |

---

## 5. Software & Telemetry Stack

- **Frontend:** React 19 + TypeScript + Vite. Custom SVG particle water flow pipelines, responsive glassmorphism control center, live SSE streaming client.
- **Backend:** Node.js Express API + Server-Sent Events (SSE) gateway + in-memory state engine.
- **Firmware:** ESP32 C++ (Arduino Core) with FreeRTOS, non-blocking interrupt flow metering, analog calibration slopes, and edge interlock arbitration.

---

## 6. Step-by-Step Live Demo Presentation Script for SIH Judges

When presenting to the Smart India Hackathon jury, follow this 4-minute demonstration workflow:

1. **Introduction (30s):**
   - *"Respected judges, we present AQUORIX (SIH Problem Statement 26040, Govt. of Jharkhand) — a smart, portable water treatment and IoT monitoring station tailored for rural mining belts."*
   - Point out the Top Header: **🟢 IoT ONLINE**, ticking clock, and Jharkhand Rural Unit identification.

2. **Overview & Transformation (60s):**
   - Highlight the **Water Safety Status Banner** (🟢 SAFE).
   - Point out Section 3 (**Raw Water → Purification → Final Water**): Show how raw mining runoff (TDS 1180 mg/L, Turbidity 18 NTU) is dynamically transformed into safe drinking water (TDS 286 mg/L, Turbidity 0.6 NTU, 96.7% turbidity reduction).
   - Demonstrate the **13-Stage Animated Water Pipeline** with active flowing fluid lines.

3. **Autonomous Decision Engine & Interlocks (90s):**
   - Click **`RE-TREAT REQUIRED`** on the SIH Presentation Control Bar.
   - Show how the dashboard instantly updates: Status flips to **🟠 RE-TREAT**, TDS increases to 720 mg/L, the Recirculation Pump automatically turns ON, and the Decision Engine provides the exact mathematical rationale.
   - Click **`UNSAFE / REJECT`**: Show how the system shifts to **🔴 REJECT**, cuts the storage valve, and triggers the reject drain valve.

4. **Automated End-to-End Cycle (60s):**
   - Click **`PURIFY CYCLE DEMO`**: Watch the 15-second live simulation cycle showing raw intake ingestion, stage filtering, TDS reduction, and automated recovery to 🟢 SAFE.
   - Switch to the **Analytics** and **Treatment History** tabs to display historical logging and one-click CSV audit export.
