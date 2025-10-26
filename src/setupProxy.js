const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Proxy for local development to bypass CORS issues
  app.use(
    '/api/v1',
    createProxyMiddleware({
      target: 'https://yushan.duckdns.org',
      changeOrigin: true,
      logLevel: 'info',
      onError: (err, req, res) => {
        console.error('Proxy error:', err);
        res.status(500).json({ error: 'Proxy error', message: err.message });
      },
    })
  );
};
