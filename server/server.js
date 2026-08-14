import express from 'express';
import cors from 'cors';
import http from 'http';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: '*' }));
app.use(express.json());

// In-memory + persistent cache store for puff logs by syncKey
const puffsDb = new Map();
const sseClients = new Map();

// Helper to write hit directly into Firebase Cloud Firestore Database
const saveToFirebaseFirestore = async (key, timestamp, mood) => {
  try {
    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/draw-2b7a5/databases/(default)/documents/users/${encodeURIComponent(key)}/puffs`;
    const body = {
      fields: {
        timestamp: { integerValue: String(timestamp) },
        createdAt: { stringValue: new Date(timestamp).toISOString() },
        mood: mood ? { stringValue: mood } : { nullValue: null },
      },
    };
    await fetch(firestoreUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    console.log(`[Firebase Server Write] Direct puff logged for key: ${key} at ${timestamp}`);
  } catch (e) {
    console.error('[Firebase Server Write Error]', e);
  }
};

// Helper to broadcast new puff event to connected PWA instances
const broadcastPuff = (key, puffData) => {
  const clients = sseClients.get(key);
  if (clients) {
    const payload = `data: ${JSON.stringify(puffData)}\n\n`;
    clients.forEach((res) => {
      try {
        res.write(payload);
      } catch (e) {
        console.error('SSE write error', e);
      }
    });
  }
};

// 1. Root & Health Check Endpoint
app.get('/', (req, res) => {
  res.json({
    app: 'PuffTrack Server API with Direct Firebase Cloud Write',
    status: 'online',
    version: '2.5.0',
    timestamp: new Date().toISOString(),
  });
});

// 2. Heartbeat Ping Endpoint (Called every 14 minutes to prevent Render sleep)
app.get('/ping', (req, res) => {
  res.json({ status: 'awake', pingedAt: Date.now() });
});

// 3. Main iOS Shortcut Background Hit Endpoint (?key=YOUR_KEY&action=puff)
// Writes DIRECTLY to Firebase Cloud Firestore even when PWA is completely CLOSED!
const handleHitRequest = async (req, res) => {
  const key = req.query.key || req.body.key || 'default-device';
  const mood = req.query.mood || req.body.mood || null;

  if (!puffsDb.has(key)) {
    puffsDb.set(key, []);
  }

  const userPuffs = puffsDb.get(key);
  const now = Date.now();
  const newPuff = {
    id: `srv-${now}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: now,
    mood: mood || undefined,
  };

  userPuffs.unshift(newPuff);

  // Directly write to Firebase Cloud Database on the server!
  saveToFirebaseFirestore(key, now, mood);

  // Broadcast to PWA via Server-Sent Events in real-time if open!
  broadcastPuff(key, { type: 'PUFF_ADDED', puff: newPuff, totalToday: getTodayCount(userPuffs) });

  res.status(200).json({
    success: true,
    message: 'Puff hit logged directly to Firebase Cloud database',
    puff: newPuff,
    todayCount: getTodayCount(userPuffs),
  });
};

app.get('/hit', handleHitRequest);
app.post('/hit', handleHitRequest);

// 4. Get Puffs for a Key
app.get('/api/puffs', (req, res) => {
  const key = req.query.key || 'default-device';
  const userPuffs = puffsDb.get(key) || [];
  res.json({
    key,
    puffs: userPuffs,
    todayCount: getTodayCount(userPuffs),
  });
});

// 5. Real-time Server-Sent Events (SSE) Stream for PWA
app.get('/api/stream', (req, res) => {
  const key = req.query.key || 'default-device';

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  if (!sseClients.has(key)) {
    sseClients.set(key, new Set());
  }
  sseClients.get(key).add(res);

  // Send initial ping
  res.write(`data: ${JSON.stringify({ type: 'CONNECTED', key })}\n\n`);

  req.on('close', () => {
    const clients = sseClients.get(key);
    if (clients) {
      clients.delete(res);
      if (clients.size === 0) sseClients.delete(key);
    }
  });
});

function getTodayCount(puffs) {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const startMs = startOfDay.getTime();
  return puffs.filter((p) => p.timestamp >= startMs).length;
}

// 6. Self-Ping Keep-Alive Heartbeat Timer (Every 14 Minutes = 840,000 ms)
const SELF_PING_INTERVAL_MS = 14 * 60 * 1000;
setInterval(() => {
  const selfUrl = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;
  http
    .get(`${selfUrl}/ping`, (res) => {
      console.log(`[Heartbeat] Self ping sent to ${selfUrl}/ping - Status: ${res.statusCode}`);
    })
    .on('error', (err) => {
      console.log('[Heartbeat] Self ping error:', err.message);
    });
}, SELF_PING_INTERVAL_MS);

app.listen(PORT, () => {
  console.log(`🚀 PuffTrack Backend Server running on port ${PORT} with Direct Firebase Cloud Write`);
});
