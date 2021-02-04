require('dotenv').config();
const      path = require('path');
const   express = require('express');
const httpProxy = require('http-proxy');
const    morgan = require('morgan');
const      PORT = process.env.PORT || 4000;

const       app = express();
const     proxy = httpProxy.createProxyServer();

app.set('views', './views');
app.set('view engine', 'pug');

app.use(morgan('dev'));
app.use(express.json()); // parse application/json 
app.use(express.urlencoded({ extended: false })); // parse application/x-www-form-urlencoded
app.use(express.static(path.join(__dirname, 'public')));

proxy.on('error', (err, req, res) => {
    res.status(500).send(`Proxy error: ${err}`);
});
// need this to parse html form body elements' values from proxy to another service/server 
proxy.on('proxyReq', (proxyReq, req) => {
    if (req.body && req.complete) {
      const bodyData = JSON.stringify(req.body);
      proxyReq.setHeader('Content-Type', 'application/json');
      proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
      proxyReq.write(bodyData);
    }
});

// api server
app.all('/api/server*', (req, res) => {
    proxy.web(req, res, {
        target: `http://localhost:${process.env.API_SERVER_PORT}`
    });
});

// auth server
app.all('/auth/server*', (req, res) => {
    proxy.web(req, res, {
        target: `http://localhost:${process.env.AUTH_SERVER_PORT}`
    });
});

// security server
app.all('/security/server*', (req, res) => {
    proxy.web(req, res, {
        target: `http://localhost:${process.env.SECURITY_SERVER_PORT}`
    });
});

// image server
app.all('/image/server*', (req, res) => {
    proxy.web(req, res, {
        target: `http://localhost:${process.env.IMAGE_SERVER_PORT}`
    });
});

// frontend server
app.all('/*', (req, res) => {
    proxy.web(req, res, {
        target: `http://localhost:${process.env.FRONTEND_SERVER_PORT}`
    });
});

app.listen(PORT, () => console.log(`Proxy is listening on port ${PORT}`));