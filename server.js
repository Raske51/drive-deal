const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const DIST_DIR = path.join(__dirname, 'dist');

const server = http.createServer((req, res) => {
  // Normalize URL by removing query parameters and trailing slash
  let url = req.url.split('?')[0];
  if (url.endsWith('/') && url !== '/') {
    url = url.slice(0, -1);
  }
  
  // Default to index.html for root path
  if (url === '/') {
    url = '/index.html';
  }
  
  // Construct the file path
  const filePath = path.join(DIST_DIR, url);
  
  // Check if file exists
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // If file doesn't exist, try to serve index.html from the requested directory
      const indexPath = path.join(DIST_DIR, url, 'index.html');
      fs.stat(indexPath, (err, stats) => {
        if (err || !stats.isFile()) {
          // If that doesn't exist either, serve the 404 page
          const notFoundPath = path.join(DIST_DIR, '404.html');
          fs.stat(notFoundPath, (err, stats) => {
            if (err || !stats.isFile()) {
              // If 404 page doesn't exist, send a simple 404 response
              res.writeHead(404, { 'Content-Type': 'text/plain' });
              res.end('404 Not Found');
            } else {
              // Serve the 404 page
              serveFile(notFoundPath, res);
            }
          });
        } else {
          // Serve the index.html from the requested directory
          serveFile(indexPath, res);
        }
      });
    } else {
      // Serve the requested file
      serveFile(filePath, res);
    }
  });
});

function serveFile(filePath, res) {
  const extname = path.extname(filePath);
  let contentType = 'text/html';
  
  // Set the content type based on file extension
  switch (extname) {
    case '.js':
      contentType = 'text/javascript';
      break;
    case '.css':
      contentType = 'text/css';
      break;
    case '.json':
      contentType = 'application/json';
      break;
    case '.png':
      contentType = 'image/png';
      break;
    case '.jpg':
    case '.jpeg':
      contentType = 'image/jpeg';
      break;
    case '.gif':
      contentType = 'image/gif';
      break;
    case '.svg':
      contentType = 'image/svg+xml';
      break;
    case '.ico':
      contentType = 'image/x-icon';
      break;
  }
  
  // Read and serve the file
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('500 Internal Server Error');
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
}

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  console.log(`Serving files from ${DIST_DIR}`);
}); 