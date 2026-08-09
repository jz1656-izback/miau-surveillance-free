// Miau Surveillance — Production Server
// Serves: / = presentation, /surveillance = SPA dashboard
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 5199;
const HOST = process.env.HOST || '0.0.0.0';
const DIST = path.join(__dirname, 'dist');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.woff2': 'font/woff2',
};

const CACHE = {
  'default': 'public, max-age=86400',
  'html': 'public, max-age=3600',
};

// Security headers applied to all responses
const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

function log(level, msg) {
  const ts = new Date().toISOString().slice(11, 19);
  process.stdout.write(`[${ts}] ${level} ${msg}\n`);
}

function serveFile(res, filePath, cacheType) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');
      return;
    }
    const headers = {
      'Content-Type': contentType,
      'Cache-Control': CACHE[cacheType] || CACHE['default'],
      ...SECURITY_HEADERS,
    };
    res.writeHead(200, headers);
    res.end(data);
  });
}

function serveSPA(res, basePath, status) {
  const htmlPath = path.join(DIST, 'index.html');
  fs.readFile(htmlPath, (err, data) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Server error');
      log('ERROR', 'index.html missing from dist/');
      return;
    }
    let html = data.toString();
    if (basePath) {
      html = html.replace('<head>', `<head><base href="${basePath}">`);
    }
    const headers = {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': CACHE['html'],
      ...SECURITY_HEADERS,
    };
    res.writeHead(status || 200, headers);
    res.end(html);
  });
}

const server = http.createServer((req, res) => {
  const url = req.url.split('?')[0];
  const method = req.method;

  // Health check
  if (url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json', ...SECURITY_HEADERS });
    res.end(JSON.stringify({ status: 'ok', uptime: process.uptime() }));
    return;
  }

  // Block suspicious requests
  if (url.includes('..') || url.includes('\0')) {
    res.writeHead(400); res.end();
    return;
  }

  // Only GET/HEAD
  if (method !== 'GET' && method !== 'HEAD') {
    res.writeHead(405); res.end();
    return;
  }

  // ═══ /surveillance ═══
  if (url.startsWith('/surveillance')) {
    const subPath = url.replace('/surveillance', '') || '/';
    if (subPath.startsWith('/assets/')) {
      serveFile(res, path.join(DIST, subPath), 'default');
    } else if (subPath === '/favicon.svg' || subPath === '/manifest.json' || subPath === '/sw.js') {
      serveFile(res, path.join(DIST, subPath), 'default');
    } else {
      serveSPA(res, '/surveillance/', 200);
    }
    return;
  }

  // ═══ Presentation (root) ═══
  if (url === '/' || url === '/index.html') {
    serveFile(res, path.join(DIST, 'presentation.html'), 'html');
    return;
  }

  // Static files from dist/
  const filePath = path.join(DIST, url);
  if (!filePath.startsWith(DIST)) { res.writeHead(403); res.end(); return; }
  serveFile(res, filePath, 'default');
});

server.listen(PORT, HOST, () => {
  log('INFO', `MiauCorp → http://${HOST}:${PORT}`);
  log('INFO', `  /                 Presentation`);
  log('INFO', `  /surveillance     Dashboard`);
  log('INFO', `  /health           Status`);
});

// Graceful shutdown
process.on('SIGTERM', () => { log('INFO', 'Shutting down...'); server.close(() => process.exit(0)); });
process.on('SIGINT', () => { log('INFO', 'Shutting down...'); server.close(() => process.exit(0)); });

// Crash protection
process.on('uncaughtException', (err) => {
  log('ERROR', 'Uncaught: ' + err.message);
  // Don't crash — keep serving
});
process.on('unhandledRejection', (reason) => {
  log('ERROR', 'Unhandled rejection: ' + reason);
});
