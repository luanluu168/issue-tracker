
require('dotenv').config();
const    path = require('path');
const express = require('express');
const   axios = require('axios');
const cookieParser = require('cookie-parser');
const  morgan = require('morgan');
const     app = express();
const    PORT = process.env.FRONTEND_SERVER_PORT || 4003;

(process.env.PRODUCTION === 'NO') ? app.set('views', 'views') : app.set('views', '../views');
app.set('view engine', 'pug');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(cookieParser());
app.use(morgan('dev'));

const       today = new Date();
const currentYear = today ? today.getFullYear() : 2020;

app.get('/', (req, res) => {
    if (req.cookies.userLoginInfo) {
        const userInCookie = JSON.parse(req.cookies.userLoginInfo);
        return res.render('pages/landing', { year: currentYear, actionType: 'access-landing-page', status: 'success', error: 'None', user: userInCookie, isLoggedin: true });
    }
    res.render('pages/landing', { year: currentYear, actionType: 'access-landing-page', status: 'success', error: 'None', isLoggedin: false });
});

app.get('/home', (req, res) => {
    if (req.cookies.userLoginInfo) {
        const userInCookie = JSON.parse(req.cookies.userLoginInfo);
        return res.render('pages/home', { year: currentYear, actionType: 'access-home-page', status: 'success', error: 'None', user: userInCookie, isLoggedin: true });
    }

    process.env.PRODUCTION == 'NO' ? res.redirect(`${process.env.DOMAIN_NAME}:${process.env.PORT}/auth/server/signin`) : res.redirect(`${process.env.DOMAIN_NAME}/auth/server/signin`);
});

app.listen(PORT, () => console.log(`frontend server is listening on port ${PORT}`));