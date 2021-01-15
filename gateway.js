const   express = require('express');
const httpProxy = require('http-proxy');
const      PORT = 4000;

const app = express();
const proxy = httpProxy.createProxyServer();

proxy.on('error', (err, req, res) => {
    res.status(500).send(`Proxy error: ${err}`);
});

app.all('/api/server*', (req, res) => {
    console.log("gateway api is called");
    proxy.web(req, res, {
        target: 'http://localhost:4001'
    });
});

app.listen(PORT, () => console.log(`Proxy is listening on port ${PORT}`));