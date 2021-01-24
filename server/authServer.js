require('dotenv').config();
const         path = require('path');
const      express = require('express');
const dbConnection = require('../database/db');
const  { bc, SALT_ROUNDS, SALT } = require('../database/hash');
const { findUser, registerUser } = require('../database/users');
const       morgan = require('morgan');
const cookieParser = require('cookie-parser');
const      session = require('express-session');
const     passport = require('passport');
const { Strategy } = require('passport-google-oauth20');
const         PORT = process.env.AUTH_SERVER_PORT || 4002;
const          app = express();

passport.use(new Strategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
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
    console.log(`serializeUser, user: ${JSON.stringify(user)}`);

    req.session.valid = true;
    req.session.User = {
        aId:   user.id,
        role:  'user',
        name:  `${user.name.givenName} ${user.name.familyName}`,
        email: user.id,
        isLoggedin: true
    };
    res.cookie("userLoginInfo", 
                JSON.stringify(req.session.User), 
                { maxAge: 2 * 60 * 60 * 1000 });

    callback(null, user);
});

passport.deserializeUser((object, callback) => {
    console.log(`deserializeUser, object: ${JSON.stringify(object)}`);
    callback(null, object);
});

app.use(session({ 
    secret: process.env.SESSION_SECRET,
    resave: true, 
    saveUninitialized: true,
    cookie: { maxAge: 2 * 60 * 60 * 1000 }
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(morgan('dev'));

(process.env.PRODUCTION === 'NO') ? app.set('views', 'views') : app.set('views', '../views');
app.set('view engine', 'pug');

const       today = new Date();
const currentYear = today ? today.getFullYear() : 2020;

app.get('/auth/server/signin', (req, res) => {
    res.render('auth/signin', { year: currentYear, actionType: 'signin', error: '' });
});
app.post('/auth/server/signin/query', (req, res) => {
    const    loginEmail = req.body.userEmail;
    const loginPassword = req.body.userPassword;
    const         query = `SELECT id, name, email, password, role FROM "Users" WHERE email='${loginEmail}'`;
    console.log(`query: ${query}`);

    const promise = findUser(query);
    promise
        .then((data) => {
            console.log(`loginPass: ${loginPassword}, data.password: ${data.password}, data= ${JSON.stringify(data)}`);

            const callback = (err, isSameHashPassword) => {
                if(err) { console.log(`Error in route signin query: ${err}`) };
                console.log(`!!!!!!!!!!!! isSameHashPassword= ${isSameHashPassword}`);
                // users can be created directly in PG or through the app that use bcrypt, so need to check 2 cases: with and without bcrypt
                if ((data.role == 'user' || data.role == 'admin') && (data.password == loginPassword || isSameHashPassword)) {
                    req.session.valid = true;
                    req.session.User = {
                        aId:   data.id,
                        role:  data.role,
                        name:  data.name,
                        email: loginEmail,
                        isLoggedin: true
                    };
                    console.log(`req.session.User.name= ${req.session.User.name}`);
                    res.cookie("userLoginInfo", 
                                JSON.stringify(req.session.User), 
                                { maxAge: 2 * 60 * 60 * 1000 });
                    res.render('pages/home', { year: currentYear, actionType: 'signin', status: 'success', error: 'None', isLoggedin: true, user: req.session.User });
                } else {
                    res.render('auth/signin', { year: currentYear, actionType: 'signin', status: 'fail', error: 'Wrong password', isLoggedin: false });
                }
            };

            bc.compare(req.body.userPassword, data.password, callback);
    })
    .catch( (e) => {
        console.log(`Error signin @ authServer: ${e}`);
        if (e.code == '404')
            return res.render('auth/signin', { year: currentYear, actionType: 'signin', status: e.status, error: 'Email is not existed' });
        let strError = JSON.stringify(e);
        res.render('pages/error', { year: currentYear, actionType: 'signin', status: e.status, error: strError });
    });
});

app.get('/auth/server/signup', (req, res) => {
    res.render('auth/signup', { year: currentYear, actionType: 'signup', error: ''});
});
app.post('/auth/server/signup/query', (req, res) => {
    let user = {
        userName: req.body.userName,
        userEmail: req.body.userEmail,
        userPassword: req.body.userPassword,
        userRole: 'user'
    };
    
    const promise = registerUser(user, bc, SALT_ROUNDS);
    promise.then((data) => {
                res.render('auth/signin', { year: currentYear, actionType: 'signup', status: 'success', error: 'Register successfully' });
            })
            .catch( (e) => {
                console.log(`Error signup @ authServer: ${e}`);
                let strError = e.error;
                res.render('auth/signup', { year: currentYear, actionType: 'singup', status: 'fail', error: strError });
            });
});

app.get('/auth/server/signout', (req, res) => {
    req.logout();
    res.render('pages/landing', { year: currentYear });
});


app.get('/auth/server/auth/google', passport.authenticate('google', { scope: ['profile'] }));

app.get('/auth/server/auth/google/done', passport.authenticate('google', { failureRedirect: '/auth/server/signin' }), (req, res, next) => {
    console.log(`!!!!!!!! google oauth success`);
    res.render('pages/home', { year: currentYear, actionType: 'Google-auth', status: 'success', error: 'None'});
});

// may open one more server to serve this route
app.get('/auth/server/home', (req, res) => {
    if (req.isAuthenticated()) {
        return res.render('pages/home', { year: currentYear, actionType: 'Google-account-authenticated', status: 'success', error: 'None'});
    }
    res.render('auth/signin', { year: currentYear, actionType: 'Google-account-authenticated', status: 'fail', error: 'Google account authenticated fail' });
});

app.all('*', (req, res) => {
    res.render('pages/error', { year: currentYear, actionType: 'response', code: '404', error: 'Page not found!', detail: 'You try to catch some fog but you miss :(' });
});

app.listen(PORT, () => console.log(`authServer is listening on port ${PORT}`));