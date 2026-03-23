const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function setupProxy(app) {
  const target = process.env.REACT_APP_PROXY_TARGET || "http://localhost:8080";

  app.use(
    createProxyMiddleware({
      target,
      changeOrigin: true,
      secure: false,
      xfwd: true,
      logLevel: "debug",
      pathFilter: ["/api", "/auth"],
      onError: (error, req, res) => {
        if (!res.headersSent) {
          res.writeHead(502, { "Content-Type": "application/json" });
        }

        res.end(
          JSON.stringify({
            message: "Proxy request failed.",
            path: req.url,
            target,
            error: error.message,
          })
        );
      },
    })
  );
};
