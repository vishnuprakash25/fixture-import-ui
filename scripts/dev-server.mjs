#!/usr/bin/env node
// Zero-dependency static server for local development.
//
// Unlike `python3 -m http.server`, this sends no-store headers so the browser
// always fetches the current file. That means no "clear cache and hard reload"
// while developing, and colleagues hitting your machine on the LAN always see
// the latest build too.
//
// Usage:
//   node scripts/dev-server.mjs [port]
//   PORT=5000 node scripts/dev-server.mjs

import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const port = Number(process.argv[2] || process.env.PORT || 4173);

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.map': 'application/json; charset=utf-8'
};

function send(response, status, body, headers = {}) {
  response.writeHead(status, {
    // The whole point: never let the browser reuse a local dev asset.
    'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
    Pragma: 'no-cache',
    Expires: '0',
    ...headers
  });
  response.end(body);
}

const server = http.createServer(async (request, response) => {
  try {
    // Drop the ?v=… cache-bust param (and any other query) before resolving.
    const requestUrl = new URL(request.url, `http://${request.headers.host}`);
    const decodedPath = decodeURIComponent(requestUrl.pathname);
    let filePath = path.join(rootDir, decodedPath);

    // Never serve outside the project root.
    if (!filePath.startsWith(rootDir)) {
      send(response, 403, 'Forbidden');
      return;
    }

    let stats = await fs.stat(filePath).catch(() => null);
    if (stats?.isDirectory()) {
      filePath = path.join(filePath, 'index.html');
      stats = await fs.stat(filePath).catch(() => null);
    }

    if (!stats?.isFile()) {
      send(response, 404, `Not found: ${decodedPath}`, { 'Content-Type': 'text/plain; charset=utf-8' });
      return;
    }

    const body = await fs.readFile(filePath);
    const contentType = MIME_TYPES[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
    send(response, 200, body, { 'Content-Type': contentType });
  } catch (error) {
    send(response, 500, `Server error: ${error.message}`, { 'Content-Type': 'text/plain; charset=utf-8' });
  }
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Fixture Import UI served from ${rootDir}`);
  console.log(`  http://localhost:${port}/`);
  console.log('Caching is disabled (no-store), so a normal refresh always shows the latest changes.');
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use. Try: npm run serve -- ${port + 1}`);
    process.exit(1);
  }
  throw error;
});

