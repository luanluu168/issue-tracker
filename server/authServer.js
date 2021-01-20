const express = require('express');
const     app = express();
const    PORT = 4002;

app.set('views', '../views');
app.set('view engine', 'pug');

let       today = new Date();
let currentYear = today ? today.getFullYear() : 2020;

app.get('/auth/server/signin', (req, res) => {
    res.render('auth/signin', { year: currentYear, actionType: 'signin', error: '' });
});

app.get('/auth/server/signup', (req, res) => {
    res.render('auth/signup', { year: currentYear, actionType: 'signup', error: ''});
});

app.listen(PORT, () => console.log(`authServer is listening on port ${PORT}`));
