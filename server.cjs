const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 5199;
const DIST = path.join(__dirname, 'dist');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
};

function serveFile(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    res.writeHead(200, {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      'Cache-Control': 'public, max-age=86400',
      'Access-Control-Allow-Origin': '*',
    });
    res.end(data);
  });
}

function serveSPA(res, basePath) {
  const htmlPath = path.join(DIST, 'index.html');
  fs.readFile(htmlPath, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    // Inject base path for SPA routing
    let html = data.toString();
    html = html.replace('<head>', `<head><base href="${basePath}">`);
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
  });
}

http.createServer((req, res) => {
  const url = req.url.split('?')[0];

  // Surveillance app at /surveillance
  if (url.startsWith('/surveillance')) {
    const subPath = url.replace('/surveillance', '') || '/';
    // API routes or SPA
    if (subPath.startsWith('/assets/') || subPath === '/favicon.svg' || subPath === '/manifest.json' || subPath === '/sw.js') {
      serveFile(res, path.join(DIST, subPath));
    } else {
      serveSPA(res, '/surveillance/');
    }
    return;
  }

  // Presentation at root
  if (url === '/' || url === '/index.html') {
    serveFile(res, path.join(DIST, 'presentation.html'));
    return;
  }

  // Static files
  const filePath = path.join(DIST, url);
  if (!filePath.startsWith(DIST)) { res.writeHead(403); res.end(); return; }
  serveFile(res, filePath);
}).listen(PORT, () => {
  console.log(`🐱 MiauCorp → http://localhost:${PORT}`);
  console.log(`   /               Presentation landing page`);
  console.log(`   /surveillance   Surveillance dashboard`);
});
