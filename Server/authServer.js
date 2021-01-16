const express = require('express');
const     app = express();
const    PORT = 4002;

app.set('view engine', 'pug');

let       today = new Date();
let currentYear = today ? today.getFullYear() : 2020;

app.get('/auth/server', (req, res) => {
    res.render('auth/signin', { year: currentYear });
});

app.listen(PORT, () => console.log(`authServer is listening on port ${PORT}`));
