const   express = require('express');
const      path = require('path');
const httpProxy = require('http-proxy');
const      PORT = 4000;

const       app = express();
const     proxy = httpProxy.createProxyServer();

app.set('views', './views');
app.set('view engine', 'pug');
app.use(express.static(path.join(__dirname, 'public')));

proxy.on('error', (err, req, res) => {
    res.status(500).send(`Proxy error: ${err}`);
});

let       today = new Date();
let currentYear = today ? today.getFullYear() : 2020;

// home route
app.all('/', (req, res) => {
    console.log('gateway api is called');
    res.render('pages/landing', {year: currentYear});
});

// api server
app.all('/api/server*', (req, res) => {
    console.log("gateway api is called");
    proxy.web(req, res, {
        target: 'http://localhost:4001'
    });
});

// auth server
app.all('/auth/server*', (req, res) => {
    console.log("gateway api is called");
    proxy.web(req, res, {
        target: 'http://localhost:4002'
    });
});

app.listen(PORT, () => console.log(`Proxy is listening on port ${PORT}`));