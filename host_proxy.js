const http = require('http');

console.log('Starting Local Host Proxy...');

const server = http.createServer((req, res) => {
  // Rewrite the host header so Next.js accepts it
  req.headers.host = 'localhost:3000';
  delete req.headers['x-forwarded-host'];
  delete req.headers['x-forwarded-for'];
  delete req.headers['x-forwarded-proto'];
  delete req.headers['x-forwarded-port'];
  delete req.headers['forwarded'];

  const options = {
    hostname: '127.0.0.1',
    port: 3000,
    path: req.url,
    method: req.method,
    headers: req.headers,
  };

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });

  proxyReq.on('error', (err) => {
    console.error('Proxy Error:', err.message);
    res.writeHead(502);
    res.end('Bad Gateway: Next.js is not responding. Check if npm run dev is running on port 3000.');
  });

  req.pipe(proxyReq, { end: true });
});

// Basic WebSocket handling for Next.js HMR
server.on('upgrade', (req, socket, head) => {
  req.headers.host = 'localhost:3000';
  const options = {
    hostname: '127.0.0.1',
    port: 3000,
    path: req.url,
    method: req.method,
    headers: req.headers,
  };

  const proxyReq = http.request(options);
  proxyReq.on('upgrade', (proxyRes, proxySocket, proxyHead) => {
    socket.write(
      'HTTP/1.1 101 Web Socket Protocol Handshake\r\n' +
        'Upgrade: WebSocket\r\n' +
        'Connection: Upgrade\r\n' +
        '\r\n'
    );
    proxySocket.pipe(socket);
    socket.pipe(proxySocket);
  });
  
  proxyReq.on('error', (err) => {
    socket.end();
  });
  proxyReq.end();
});

server.listen(3001, () => {
  console.log('Proxy listening on 3001, forwarding to Next.js on 3000');
});
