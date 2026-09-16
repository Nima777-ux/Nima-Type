import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

// Automatically write/sync .env with runtime process.env secrets
if (process.env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_ANON_KEY) {
  try {
    const lines = [
      `VITE_SUPABASE_URL=${process.env.VITE_SUPABASE_URL || ''}`,
      `VITE_SUPABASE_ANON_KEY=${process.env.VITE_SUPABASE_ANON_KEY || ''}`,
    ];
    fs.writeFileSync('.env', lines.join('\n') + '\n', 'utf-8');
  } catch (err) {
    console.error('Failed to write .env file:', err);
  }
}

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// API: Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    serverTime: Date.now(),
  });
});

// Vite middleware / Static serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    // Intercept @vite/client in dev to neutralize HMR WebSocket connect attempts in the container
    app.use((req, res, next) => {
      if (req.url && req.url.startsWith('/@vite/client')) {
        const origEnd = res.end.bind(res);
        const origWrite = res.write.bind(res);
        const chunks: Buffer[] = [];

        res.write = function (chunk: any, ...args: any[]) {
          if (chunk) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
          return true;
        } as any;

        res.end = function (chunk: any, ...args: any[]) {
          if (chunk) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
          let body = Buffer.concat(chunks).toString('utf-8');

          const dummyTransport =
            'const createWebSocketModuleRunnerTransport = (options) => ({ async connect(handlers) { if (handlers && handlers.onMessage) { handlers.onMessage({ type: "connected" }); } }, disconnect() {}, send(data) {} });\n\nfunction createHMRHandler';
          body = body.replace(
            /const createWebSocketModuleRunnerTransport = \(options\) => \{[\s\S]*?\n\};\n\nfunction createHMRHandler/,
            dummyTransport
          );

          res.removeHeader('content-length');
          res.removeHeader('etag');
          res.setHeader('cache-control', 'no-store');
          res.setHeader('content-length', Buffer.byteLength(body, 'utf-8'));
          return origEnd(body, ...args);
        } as any;
      }
      next();
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Nima Type server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
