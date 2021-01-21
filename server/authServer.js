require('dotenv').config();
const         path = require('path');
const      express = require('express');
const     passport = require('passport');
const { Strategy } = require('passport-google-oauth20');
const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, SESSION_SECRET } = process.env;
const    PORT = process.env.AUTH_SERVER_PORT || 4002;
const     app = express();

passport.use(new Strategy({
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: '/auth/server/auth/google/done'
    },
    (accessToken, refreshToken, profile, callback) => {
        console.log(`accessToken: ${accessToken}`);
        console.log(`refreshToken: ${refreshToken}`);
        console.log(`profile: ${JSON.stringify(profile)}`);
        console.log(`profile.id: ${profile.id}`);
        console.log(`profile.email: ${profile.email}`);
        console.log(`profile.name: ${profile.displayName}`);
        return callback(null, profile);
    }
));

passport.serializeUser((user, callback) => {
    console.log(`serializeUser, user: ${user}`);
    callback(null, user);
});

passport.deserializeUser((object, callback) => {
    console.log(`deserializeUser, object: ${object}`);
    callback(null, object);
});

app.use(require('express-session')({ secret: SESSION_SECRET, resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
(process.env.PRODUCTION === 'NO') ? app.set('views', 'views') : app.set('views', '../views');
app.set('view engine', 'pug');

let       today = new Date();
let currentYear = today ? today.getFullYear() : 2020;

app.get('/auth/server/signin', (req, res) => {
    res.render('auth/signin', { year: currentYear, actionType: 'signin', error: '' });
});

app.get('/auth/server/signup', (req, res) => {
    res.render('auth/signup', { year: currentYear, actionType: 'signup', error: ''});
});

app.get('/auth/server/login/google', passport.authenticate('google', { scope: ['profile'] }));

app.get('/auth/server/auth/google/done', passport.authenticate('google', { failureRedirect: '/' }), (req, res, next) => {
    res.render('pages/home', { year: currentYear, actionType: 'Google-auth', error: ''});
});

app.listen(PORT, () => console.log(`authServer is listening on port ${PORT}`));

