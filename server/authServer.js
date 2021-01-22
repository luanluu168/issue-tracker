require('dotenv').config();
const         path = require('path');
const      express = require('express');
const dbConnection = require('../database/db');
const { findUser } = require('../database/users')
const       bcrypt = require('bcrypt');
const    NUM_SALTS = 8;
const cookieParser = require('cookie-parser');
const      session = require('express-session');
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

app.use(session({ 
    secret: SESSION_SECRET,
    resave: true, 
    saveUninitialized: true,
    cookie: { maxAge: 2 * 60 * 60 * 1000 }
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

(process.env.PRODUCTION === 'NO') ? app.set('views', 'views') : app.set('views', '../views');
app.set('view engine', 'pug');

let       today = new Date();
let currentYear = today ? today.getFullYear() : 2020;

app.get('/auth/server/signin', (req, res) => {
    res.render('auth/signin', { year: currentYear, actionType: 'signin', error: '' });
});
app.post('/auth/server/signin/query', (req, res) => {
    console.log('testing is called');
    let    loginEmail = `'${req.body.userEmail}'`;
    let loginPassword = `'${req.body.userPassword}'`;
    let query = `SELECT id, email, password, role FROM "Users" WHERE email=${loginEmail}`;
    console.log(`query: ${query}`);
    let body = JSON.stringify(req.body);
    console.log(`body: ${body}`);
    // dbConnection.any(query)
    //             .then((data) => {
    //                 console.log(`Testing 1 pass...`);
    //                 if (data.length === 0) {
    //                     return res.json({error: 'Email was not correct'});
    //                 }
                    
    //                 let tmp = JSON.stringify(data);
    //                 console.log(`Testing 2 pass... ${tmp}`);
    //                 const isValidatePassword = bcrypt.compareSync(loginPassword, data[0].password);
    //                 console.log(`Testing 3 pass... ${tmp}`);
    //                 let userPassword = `'${data[0].password}'`;
    //                 console.log(`userRole == 'admin' ? ${data[0].role == 'admin'}`);
    //                 console.log(`userPassword == loginPassword ? ${userPassword == loginPassword}`);
    //                 // users can be created directly in PG or through the app that use bcrypt, so need to check 2 cases: with and without bcrypt
    //                 if ((data[0].role == 'user' || data[0].role == 'admin') && (userPassword == loginPassword || isValidatePassword)) {
    //                     console.log(`Testing 4 pass...`);
    //                     req.session.valid = true;
    //                     req.session.User = {
    //                         aId:   data[0].id,
    //                         role:  data[0].role,
    //                         name:  data[0].customerName,
    //                         email: loginEmail,
    //                         isLoggedin: true
    //                     };
    //                     res.cookie("userLoginInfo", 
    //                                 JSON.stringify(req.session.User), 
    //                                 { maxAge: 2 * 60 * 60 * 100 });
    //                     // res.status(200).json({ actionType: 'signin', status: 'success', error: 'None' });
    //                     res.render('pages/home', { year: currentYear, actionType: 'signin', status: 'success', error: 'None' });
    //                 } else {
    //                     console.log(`Testing 5 pass...`);
    //                     // res.json({ error: 'Password is wrong' });
    //                     res.render('auth/signin', { year: currentYear, actionType: 'signin', status: 'fail', error: 'Password is wrong' });
    //                 }
    //             })
    //             .catch( (e) => {
    //                 console.log(`Error in authServer: ${e}`);
    //                 res.json({ error: e });
    //             }); 

    let promise = findUser(`email`, loginEmail);
    console.log(`!!!!!!!!!!!!!! promise`);
    promise.then((data) => {
        let userPassword = `'${data.password}'`;
        const isValidatePassword = bcrypt.compareSync(loginPassword, userPassword);
        // users can be created directly in PG or through the app that use bcrypt, so need to check 2 cases: with and without bcrypt
        if ((data.role == 'user' || data.role == 'admin') && (userPassword == loginPassword || isValidatePassword)) {
            console.log(`Testing 4 pass...`);
            req.session.valid = true;
            req.session.User = {
                aId:   data.id,
                role:  data.role,
                name:  data.name,
                email: loginEmail,
                isLoggedin: true
            };
            res.cookie("userLoginInfo", 
                        JSON.stringify(req.session.User), 
                        { maxAge: 2 * 60 * 60 * 100 });
            // res.status(200).json({ actionType: 'signin', status: 'success', error: 'None' });
            res.render('pages/home', { year: currentYear, actionType: 'signin', status: 'success', error: 'None' });
        } else {
            console.log(`Testing 5 pass...`);
            // res.json({ error: 'Password is wrong' });
            res.render('auth/signin', { year: currentYear, actionType: 'signin', status: 'fail', error: 'Password is wrong' });
        }
    })
    .catch( (e) => {
        console.log(`Error signin @ authServer: ${e}`);
        res.json({ error: e });
    });
});

app.get('/auth/server/signup', (req, res) => {
    res.render('auth/signup', { year: currentYear, actionType: 'signup', error: ''});
});


app.get('/auth/server/auth/google', passport.authenticate('google', { scope: ['profile'] }));

app.get('/auth/server/auth/google/done', passport.authenticate('google', { failureRedirect: '/' }), (req, res, next) => {
    res.render('pages/home', { year: currentYear, actionType: 'Google-auth', status: 'success', error: ''});
});

app.all('*', (req, res) => {
    res.render('pages/error', { year: currentYear, actionType: 'response', code: '404', error: 'Page not found!', detail: 'You try to catch some fog but you miss :(' });
});

app.listen(PORT, () => console.log(`authServer is listening on port ${PORT}`));

