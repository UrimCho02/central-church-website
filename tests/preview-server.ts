import { createServer } from 'node:http';
import { createServer as createViteServer } from 'vite';
import { config } from 'dotenv';
import pastor from '../api/pastor.ts';
import ask from '../api/ask.ts';

config({ path: process.env.PASTOR_TEST_ENV || '.env', quiet: true });
const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
const server = createServer(async (request, response) => {
  const url = new URL(request.url || '/', 'http://127.0.0.1:4173');
  if (url.pathname === '/api/pastor' || url.pathname === '/api/ask') {
    const parts: Buffer[] = [];
    for await (const part of request) parts.push(Buffer.from(part));
    try {
      const text = Buffer.concat(parts).toString();
      const req = Object.assign(request, { query: Object.fromEntries(url.searchParams), body: text ? JSON.parse(text) : {} });
      const res = Object.assign(response, {
        status(code: number) { response.statusCode = code; return this; },
        json(data: unknown) { response.setHeader('Content-Type', 'application/json; charset=utf-8'); response.end(JSON.stringify(data)); return this; },
      });
      await (url.pathname === '/api/pastor' ? pastor : ask)(req as any, res as any);
    } catch { response.statusCode = 400; response.end('{}'); }
    return;
  }
  vite.middlewares(request, response);
});
server.listen(4173, '127.0.0.1', () => console.log('Preview: http://127.0.0.1:4173/?pastor'));
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => { server.close(); void vite.close().then(() => process.exit()); });
