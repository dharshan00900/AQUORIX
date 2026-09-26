/**
 * AQUORIX — IoT Backend & Gateway API Service
 * Smart Water Purification & Quality Monitoring System for Rural and Mining-Affected Areas
 * SIH Problem Statement ID: 26040 | Govt. of Jharkhand
 */

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.AQUORIX_PORT || 5001;

app.use(cors({ origin: '*' }));
app.use(express.json());

// In-Memory Real-Time Telemetry & Actuator State
let state = {
  rawWater: { ph: 5.9, tds: 1180, turbidity: 18.0, temperature: 29.2, flowRate: 4.2 },
  finalWater: { ph: 7.2, tds: 286, turbidity: 0.6, temperature: 27.1, flowRate: 4.8 },
  decision: 'SAFE',
  waterSafetyScore: 92,
  recirculationState: 'NOT REQUIRED',
  recirculationCycle: 0,
  actuators: {
    pump_raw: 'ON',
    pump_hp: 'ON',
    pump_rec: 'OFF',
    valve_inlet: 'OPEN',
    valve_ro: 'OPEN',
    valve_reject: 'CLOSED',
    valve_storage: 'OPEN',
    uv_module: 'ON'
  },
  lastUpdate: new Date().toISOString()
};

// Connected SSE clients for live telemetry streaming
const sseClients = new Set();

function broadcastSSE(data) {
  const payload = `data: ${JSON.stringify(data)}\n\n`;
  for (const client of sseClients) {
    try {
      client.res.write(payload);
    } catch {
      sseClients.delete(client);
    }
  }
}

// 1. SSE Stream for Dashboard
app.get('/api/aquorix/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const client = { id: Date.now(), res };
  sseClients.add(client);

  // Send initial snapshot
  res.write(`data: ${JSON.stringify({ type: 'SNAPSHOT', state })}\n\n`);

  req.on('close', () => {
    sseClients.delete(client);
  });
});

// 2. Telemetry Ingestion from ESP32
app.post('/api/aquorix/telemetry', (req, res) => {
  const { rawWater, finalWater } = req.body;

  if (rawWater) state.rawWater = { ...state.rawWater, ...rawWater };
  if (finalWater) state.finalWater = { ...state.finalWater, ...finalWater };
  state.lastUpdate = new Date().toISOString();

  // Evaluate Decision
  if (state.finalWater.tds > 2000 || state.finalWater.turbidity > 5.0 || state.finalWater.ph < 5.8 || state.finalWater.ph > 9.2) {
    state.decision = 'REJECT';
    state.waterSafetyScore = 20;
    state.actuators.valve_reject = 'OPEN';
    state.actuators.valve_storage = 'CLOSED';
  } else if (state.finalWater.tds > 500 || state.finalWater.turbidity > 1.0 || state.finalWater.ph < 6.5 || state.finalWater.ph > 8.5) {
    state.decision = 'RE-TREAT';
    state.waterSafetyScore = 65;
    state.actuators.pump_rec = 'ON';
    state.recirculationState = 'IN PROGRESS';
  } else {
    state.decision = 'SAFE';
    state.waterSafetyScore = 94;
    state.actuators.valve_reject = 'CLOSED';
    state.actuators.valve_storage = 'OPEN';
    state.actuators.pump_rec = 'OFF';
    state.recirculationState = 'NOT REQUIRED';
  }

  broadcastSSE({ type: 'TELEMETRY_UPDATE', state });

  res.json({
    status: 'success',
    receivedAt: state.lastUpdate,
    decision: state.decision,
    actuatorCommands: state.actuators
  });
});

// 3. Actuator Control Endpoint
app.post('/api/aquorix/actuator/:id', (req, res) => {
  const { id } = req.params;
  const { state: targetState } = req.body;

  if (state.actuators[id] !== undefined) {
    state.actuators[id] = targetState;
    broadcastSSE({ type: 'ACTUATOR_UPDATE', id, state: targetState });
    return res.json({ status: 'success', id, state: targetState });
  }

  res.status(404).json({ error: 'Unknown actuator ID' });
});

// 4. Get Current Snapshot
app.get('/api/aquorix/telemetry/latest', (_req, res) => {
  res.json({
    status: 'success',
    state
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`[AQUORIX IoT Server] Listening on http://localhost:${PORT}`);
  console.log(`[AQUORIX IoT Server] SSE Stream: http://localhost:${PORT}/api/aquorix/stream`);
  console.log(`[AQUORIX IoT Server] Telemetry Ingest: POST http://localhost:${PORT}/api/aquorix/telemetry`);
});
