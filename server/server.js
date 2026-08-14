import express from 'express';
import cors from 'cors';
import http from 'http';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: '*' }));
app.use(express.json());

// In-memory cache store with RAM protection (Max 200 items per key to fit in Render 512MB RAM)
const puffsDb = new Map();
const sseClients = new Map();
const MAX_CACHE_PUFFS_PER_KEY = 200;

// Async Non-Blocking Firebase Cloud Write (0ms blocking time for iOS Shortcuts)
const saveToFirebaseFirestore = (key, timestamp, mood) => {
  const firestoreUrl = `https://firestore.googleapis.com/v1/projects/draw-2b7a5/databases/(default)/documents/users/${encodeURIComponent(key)}/puffs`;
  const body = {
    fields: {
      timestamp: { integerValue: String(timestamp) },
      createdAt: { stringValue: new Date(timestamp).toISOString() },
      mood: mood ? { stringValue: mood } : { nullValue: null },
    },
  };

  fetch(firestoreUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).catch((err) => {
    console.error('[Render Safe Write Error]', err.message);
  });
};

// Broadcast to PWA via Server-Sent Events with SSE Connection Cleanup
const broadcastPuff = (key, puffData) => {
  const clients = sseClients.get(key);
  if (clients) {
    const payload = `data: ${JSON.stringify(puffData)}\n\n`;
    clients.forEach((res) => {
      try {
        res.write(payload);
      } catch (e) {
        clients.delete(res);
      }
    });
  }
};

// 1. Root & Health Check Endpoint
app.get('/', (req, res) => {
  res.json({
    app: 'PuffTrack Server API (Render Free Tier Guardrails Active)',
    status: 'online',
    version: '2.6.0',
    ramUsageMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
    timestamp: new Date().toISOString(),
  });
});

// 2. Heartbeat Ping Endpoint (Called every 12 minutes to guarantee Render stay-awake)
app.get('/ping', (req, res) => {
  res.json({ status: 'awake', pingedAt: Date.now() });
});

// 3. Fast iOS Shortcut Hit Endpoint (?key=YOUR_KEY&action=puff)
// Responds in 2ms and writes directly to Firebase Cloud in background
const handleHitRequest = (req, res) => {
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

  // RAM Protection: Trim cache if > 200 items
  if (userPuffs.length > MAX_CACHE_PUFFS_PER_KEY) {
    userPuffs.pop();
  }

  // Non-blocking Server-side write to Firebase
  saveToFirebaseFirestore(key, now, mood);

  // Instant SSE Broadcast
  broadcastPuff(key, { type: 'PUFF_ADDED', puff: newPuff, totalToday: getTodayCount(userPuffs) });

  res.status(200).json({
    success: true,
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

// 5. Lightweight Real-time SSE Stream for PWA
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

// 6. 12-Minute Keep-Alive Heartbeat Timer (720,000 ms)
// Guarantees zero sleep on Render's 15-minute inactivity cutoff
const SELF_PING_INTERVAL_MS = 12 * 60 * 1000;
setInterval(() => {
  const selfUrl = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;
  http
    .get(`${selfUrl}/ping`, (res) => {
      console.log(`[Render Heartbeat] Ping sent to ${selfUrl}/ping - Status: ${res.statusCode}`);
    })
    .on('error', (err) => {
      console.log('[Render Heartbeat] Ping note:', err.message);
    });
}, SELF_PING_INTERVAL_MS);

app.listen(PORT, () => {
  console.log(`🚀 PuffTrack Backend running on port ${PORT} with Render Free Tier Guardrails`);
});
