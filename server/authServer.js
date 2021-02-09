require('dotenv').config();
const         path = require('path');
const      express = require('express');
const dbConnection = require('../database/db');
const  { bc, SALT_ROUNDS, SALT } = require('../database/hash');
const { findUser,
        registerUser,
        registerUserByOAuth,
        updateUserName, 
        updateUserNameAndPassword,
        updateUserLastLogin } = require('../database/users');
const       morgan = require('morgan');
const cookieParser = require('cookie-parser');
const      session = require('express-session');
const     passport = require('passport');
const { Strategy } = require('passport-google-oauth20');
const        redis = require('redis');
const   RedisStore = require('connect-redis')(session);
const       client = process.env.PRODUCTION == 'NO' ? redis.createClient() : redis.createClient(process.env.REDIS_URL);
const       crypto = require('crypto');
const       sgMail = require('@sendgrid/mail');
const { getTimeStampFormat, getStringTimeWithoutGMT } = require('../utils/utils');
const          dns = require('dns');
const         PORT = process.env.AUTH_SERVER_PORT || 4002;
const          app = express();

let            key = 0;
client.on("error", (err) => {
    console.error(err);
});

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
        console.log(`profile.emails[0].value: ${profile.emails[0].value}`);
        console.log(`profile.name: ${profile.displayName}`);

        let user = {
            aId:   profile.id,
            role:  'user',
            name:  profile.name.givenName,
            email: profile.emails[0].value,
            image: '/upload/default-user.png',
            isLoggedin: true
        };

        key = profile.id;
        client.get(profile.id, (err, cachedValue) => {
            if(err) { console.log(`Error in client get: ${err}`) };
            if(!cachedValue) {
                console.log('Redis cache miss');
                client.set(profile.id, JSON.stringify(user));
                client.expire(profile.id, 2 * 60 * 60) // key will be expired in 2 hours
            } else {
                console.log('Cache found the data');
            }

            return callback(null, profile);
        });
    }
));

passport.serializeUser((user, callback) => {
    console.log(`serializeUser, user: ${JSON.stringify(user)}`);
    callback(null, user);
});

passport.deserializeUser((object, callback) => {
    console.log(`deserializeUser, object: ${JSON.stringify(object)}`);
    callback(null, object);
});

app.use(session({ 
    store : new RedisStore({ client: client }),
    secret: process.env.SESSION_SECRET,
    resave: true, // false if have touch method
    saveUninitialized: true,
    cookie: { maxAge: 2 * 60 * 60 * 1000 } // session will be expired in 2 hours
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

(process.env.PRODUCTION === 'NO') ? app.set('views', 'views') : app.set('views', '../views');
app.set('view engine', 'pug');

// Sendgrid email
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const       today = new Date();
const currentYear = today ? today.getFullYear() : 2020;

app.get('/auth/server/signin', (req, res) => {
    if (req.cookies.recaptcha == undefined) {
        return res.render('pages/verifyIsHuman', { year: currentYear, actionType: 'render the page verify is human' });
    }
    res.render('auth/signin', { year: currentYear, actionType: 'signin', error: '' });
});
app.post('/auth/server/signin/query', (req, res) => {
    const    loginEmail = req.body.userEmail;
    const loginPassword = req.body.userPassword;
    const         query = `SELECT id, name, email, password, role, image FROM "Users" WHERE email='${loginEmail}'`;
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
                        image: data.image,
                        email: loginEmail,
                        isSocialAccount: false,
                        isLoggedin: true
                    };
                    console.log(`req.session.User.name= ${req.session.User.name}`);
                    res.cookie("userLoginInfo", 
                                JSON.stringify(req.session.User), 
                                { maxAge: 2 * 60 * 60 * 1000 }); // expire in 2 hours
                    // res.render('pages/home', { year: currentYear, actionType: 'signin', status: 'success', error: 'None', isLoggedin: true, user: req.session.User });
                    if (process.env.PRODUCTION == 'NO') {
                        return res.redirect(`${process.env.DOMAIN_NAME}:${process.env.PORT}/home`);  // delegate render task for frontend server
                    }
                    res.redirect(`${process.env.DOMAIN_NAME}/home`);  // delegate render task for frontend server
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
    console.log(`req.cookies.recaptcha= ${JSON.stringify(req.cookies.recaptcha)}`);
    console.log(`!!!!!!!! req.headers.host= ${req.headers.host}`); // can use this to remove domain
    if (req.cookies.recaptcha == undefined) {
        return res.render('pages/verifyIsHuman', { year: currentYear, actionType: 'render the page verify is human' });
    }
    
    res.render('auth/signup', { year: currentYear, actionType: 'signup', error: ''});
});
const handleSignupWithVerifyEmail = (req, res) => {
    let newUser = {
        aId: key,
        userName: req.body.userName,
        userEmail: req.body.userEmail,
        userPassword: req.body.userPassword,
        userRole: 'user',
        emailToken: crypto.randomBytes(64).toString('hex'),
        status: 'pending'
    };

    const message = {
        to: newUser.userEmail,
        from: 'issuetrackerex@gmail.com',
        subject: 'Issue-Tracker - verify your email',
        text: `
            Hello, thanks for registering on Issue-Tracker. 
            Please copy and past the address below to verify your account. 
            ${req.protocol}://${req.headers.host}/auth/server/verify-email?token=${newUser.emailToken}&email=${newUser.userEmail}
        `,
        html: `
            <!doctype html>
            <html lang="en">
                <head>
                    <title>Issue-Tracker</title>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                </head>
                <body>
                    <div style="text-align:center;width:100%;">
                        <table style="box-sizing:border-box;border-spacing:0;border-collapse:separate!important;border-top:3px solid gray;border-left:3px solid gray;border-right:3px solid gray;border-image: linear-gradient(to bottom right, #b827fc 0%, #2c90fc 25%, #b8fd33 50%, #fec837 75%, #fd1892 100%);border-image-slice: 1;" width="100%">
                            <tbody>
                                <tr>
                                    <td style="background-color:rgb(228, 228, 235);"><a href="https://issue-tracker-ex.herokuapp.com/"><img src="https://i.ibb.co/Kb1CQWr/web-logo-landing.png" alt="web-logo-landing" border="0"></a></td>
                                </tr>
                                <tr>
                                    <td style="box-sizing:border-box;font-family:'Open Sans','Helvetica Neue','Helvetica',Helvetica,Arial,sans-serif;font-size:16px;vertical-align:top;padding:30px" valign="top">
                                    <table style="box-sizing:border-box;width:100%;border-spacing:0;border-collapse:separate!important" width="100%">
                                        <tbody>
                                            <tr>
                                                <td style="box-sizing:border-box;padding:0;font-family:'Open Sans','Helvetica Neue','Helvetica',Helvetica,Arial,sans-serif;font-size:16px;vertical-align:top" valign="top">
                                                <h2 style="margin:0;margin-bottom:30px;font-family:'Open Sans','Helvetica Neue','Helvetica',Helvetica,Arial,sans-serif;font-weight:300;line-height:1.5;font-size:24px;color:#294661!important">Hello, ${newUser.userName}!</h2>

                                                <p style="margin:0;margin-bottom:30px;color:#294661;font-family:'Open Sans','Helvetica Neue','Helvetica',Helvetica,Arial,sans-serif;font-size:16px;font-weight:300"><strong>Thanks for registering on Issue-Tracker.<br><br>Let's verify your account so you can start using the web application.</strong></p>

                                                <p style="margin:0;margin-bottom:30px;color:#294661;font-family:'Open Sans','Helvetica Neue','Helvetica',Helvetica,Arial,sans-serif;font-size:16px;font-weight:300"><small>Your link is active for 2 hours. After that, you will need to register again to get a new token link.</small></p>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="box-sizing:border-box;padding:0;font-family:'Open Sans','Helvetica Neue','Helvetica',Helvetica,Arial,sans-serif;font-size:16px;vertical-align:top" valign="top">
                                                <table cellpadding="0" cellspacing="0" style="box-sizing:border-box;border-spacing:0;width:100%;border-collapse:separate!important" width="100%">
                                                    <tbody>
                                                        <tr>
                                                            <td style="box-sizing:border-box;padding:0;font-family:'Open Sans','Helvetica Neue','Helvetica',Helvetica,Arial,sans-serif;font-size:16px;vertical-align:top;padding-bottom:15px" valign="top">
                                                            <table cellpadding="0" cellspacing="0" style="box-sizing:border-box;border-spacing:0;width:auto;border-collapse:separate!important;display:flex;justify-content:center;align-items:center;">
                                                                <tbody>
                                                                    <tr>
                                                                        <td style="box-sizing:border-box;padding:0;font-family:'Open Sans','Helvetica Neue','Helvetica',Helvetica,Arial,sans-serif;font-size:16px;vertical-align:top;border-radius:2px;text-align:center" valign="top">
                                                                            <a href='${req.protocol}://${req.headers.host}/auth/server/verify-email?token=${newUser.emailToken}&email=${newUser.userEmail}'
                                                                            target="_blank" style="font-size: 16px; font-family: Helvetica, Arial, sans-serif; color: #ffffff; text-decoration: none; 
                                                                            border-radius: 3px; background-color: #0275d8; border-top: 12px solid #0275d8; border-bottom: 12px solid #0275d8; 
                                                                            border-right: 18px solid #0275d8; border-left: 18px solid #0275d8; display: inline-block;">Verify your account &rarr;</a>
                                                                        </td>
                                                                    </tr>

                                                                    <tr>
                                                                        <td>
                                                                            <p style="margin-top:20px;margin-bottom:20px;"> Or copy the link below and past it to your browser </p>
                                                                        </td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td>
                                                                        <a href='${req.protocol}://${req.headers.host}/auth/server/verify-email?token=${newUser.emailToken}&email=${newUser.userEmail}'>${req.protocol}://${req.headers.host}/auth/server/verify-email?token=${newUser.emailToken}&email=${newUser.userEmail}</a>
                                                                        <td>
                                                                    </tr>
                                                                </tbody>
                                                            </table>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                        <table style="border-bottom:3px solid gray;border-left:3px solid gray;border-right:3px solid gray;background-color:rgb(228, 228, 235);color:#000;font-size:15px;border-image: linear-gradient(to top right, #b827fc 0%, #2c90fc 25%, #b8fd33 50%, #fec837 75%, #fd1892 100%);border-image-slice: 1;" width="100%" height="80" cellpadding="0" cellspacing="0" border="0">
                            <tbody>
                                <tr>
                                    <td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif">
                                        <span>Copyright © 2021 Issue-Tracker, All right reserved</span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </body>
            </html>
        `
    };

    const sendEmailToVerify = async () => {
        try {
            await sgMail.send(message);
            // save the new user info to redis store
            client.set(newUser.userEmail, JSON.stringify(newUser));
            client.expire(newUser.userEmail, 2 * 60 * 60) // key will be expired in 2 hours
            res.render('auth/signup', { year: currentYear, actionType: 'server send token email', status: 'success', error: `Thanks for registering. Please check your email to verify your account` });
        } catch(err) {
            console.log(err);
            if (err.response) { console.error(err.response.body) };
            res.render('auth/signup', { year: currentYear, actionType: 'server send token email', status: 'fail', error: 'Something went wrong. Please contact us for assistance' });
        }
    };

    // check if the redis still has the email key, then we do not need to resend and generate a new token
    client.get(newUser.userEmail, (err, cachedValue) => {
        if(err) { console.log(`Error in client get: ${err}`) };
        if(cachedValue) { // email and token exist in cache
            res.render('auth/signup', { year: currentYear, actionType: 'Email exists in redis cache', status: 'success', error: `Thanks for registering. Please check your email to verify your account! (be aware that your token will be expired after 2 hours)` });
        } else { // email and token not in cache
            sendEmailToVerify();
        }
    });
}
app.post('/auth/server/signup/query', (req, res) => {
    const processSignup = () => {
        // 1. find if the user email was already taken
        const query = `SELECT id, name, email, password, role FROM "Users" WHERE email='${req.body.userEmail}'`;
        console.log(`auth server signup query= ${query}`);
        const findUserPromise = findUser(query);
        findUserPromise
            .then((result) => { // the case where user account already existed
                res.render('auth/signup', { year: currentYear, actionType: 'register user', status: 'fail', error: 'Email was taken by another user' });
            })
            .catch((e) => { // the case where user account was not existed yet
                // 2. ask user to verify their email and save the token to redis store
                handleSignupWithVerifyEmail(req, res);
            }); 
    };
    const emailDomain = req.body.userEmail.split('@')[1];
    dns.resolveMx(emailDomain, (error, domains) => {
        if(error) { console.log(error) };

        if(domains) {
            processSignup();
        } else {
            res.render('auth/signup', { year: currentYear, actionType: 'Validate email domain in signup route', status: 'false', error: `Please enter a valid email domain` });
        }
    });
});
app.get('/auth/server/verify-email', (req, res, next) => {
    client.get(req.query.email, (error, cachedValue) => {
        if(error) { console.log(`Error in client.get: ${error}`) };
        if (!cachedValue) { // token not exists or expired
            return res.render('auth/server/signup', { year: currentYear, actionType: 'server send token email', status: 'fail', error: '<p>Your token is invalid. Please register again</p>' });
        }
        // the case where token is in the cache
        user = JSON.parse(cachedValue);
        req.session.valid = true;
        req.session.User = {
            aId:   user.aId,
            role:  user.useRole,
            name:  user.userName,
            email: user.userEmail,
            isSocialAccount: false,
            isLoggedin: true
        };
        // save the user to db
        const promise = registerUser(user, bc, SALT_ROUNDS);
        promise.then((data) => {
                    // clear the cache and return to the signin page
                    client.del(req.query.email);
                    res.render('auth/signin', { year: currentYear, actionType: 'signup', status: 'success', error: 'Register successfully, please sign-in' });
                })
                .catch( (e) => {
                    console.log(`Error signup @ authServer: ${e}`);
                    let strError = e.error;
                    res.render('auth/signup', { year: currentYear, actionType: 'singup', status: 'fail', error: strError });
                });
    });
});

app.get('/auth/server/signout', (req, res, next) => {
    // destroy session
    if(req.session.User) {
        req.session.destroy( err => {
            if(err) { console.log('Error logging out') };
        });
    };
    console.log(`req.cookies= ${req.cookies}`);
    if (!req.cookies.userLoginInfo) { return res.render('pages/landing', { year: currentYear, isLoggedin: false }) };
    const copyEmail = JSON.parse(req.cookies.userLoginInfo).email;
    updateUserLastLogin(copyEmail, getTimeStampFormat()).catch((e) => { console.log(`Error in signout, ${e}`) });
    // destroy cookie
    if(req.cookies.userLoginInfo) { res.clearCookie("userLoginInfo") };
    res.render('pages/landing', { year: currentYear, isLoggedin: false });
});

app.get('/auth/server/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/server/auth/google/done', passport.authenticate('google', { failureRedirect: '/auth/server/signin' }), (req, res, next) => {
    console.log(`!!!!!!!! google oauth success`);
    client.get(key, async (error, cachedValue) => {
        if(error) { console.log(`Error in client.get: ${error}`) };
        user = JSON.parse(cachedValue);
        req.session.valid = true;
        req.session.User = {
            aId:   parseInt(("" + user.aId).substring(0,7)),
            role:  user.role,
            name:  user.name,
            email: user.email,
            image: user.image,
            isSocialAccount: true,
            isLoggedin: true
        };

        // check and store account into db 
        const query = `SELECT id, name, email, password, role, image FROM "Users" WHERE email='${user.email}'`;
        console.log(`query= ${query}`);
        const findUserPromise = findUser(query);
        findUserPromise
            .then((data) => {} ) // the case where user account already existed
            .catch((err) => {
                const registerUserPromise = registerUserByOAuth(user, bc, SALT_ROUNDS);
                registerUserPromise
                    .then((data) => { 
                        console.log(`registerUserPromise data= ${data}`);
                    })
                    .catch((e) => { console.log(`registerUserPromise error= ${e}`) });
            }); // the case where user was not found
        
        res.cookie("userLoginInfo", 
                    JSON.stringify(req.session.User), 
                    { maxAge: 2 * 60 * 60 * 1000 }); // expire in 2 hours

        client.incr('user-counter', (err, value) => {
            if(err) { console.log(`Error in client.incr: ${err}`) };
            client.expire('user-counter', 60) // key will be expired in 1 minute
        });
        
        // Successful authentication, redirect home
        // res.render('pages/home', { year: currentYear, actionType: 'Google-auth', status: 'success', error: 'None', user: req.session.User, isLoggedin: true });
        if (process.env.PRODUCTION == 'NO') {
            return res.redirect(`${process.env.DOMAIN_NAME}:${process.env.PORT}/home`);  // delegate render task for frontend server
        }
        res.redirect(`${process.env.DOMAIN_NAME}/home`);  // delegate render task for frontend server
    });
});

app.get('/auth/server/edit-profile', (req, res, next) => {
    if(req.cookies.userLoginInfo) {
        const         query = `SELECT id, name, email, password, role, image, created_on, last_login, is_social_account FROM "Users" WHERE email='${JSON.parse(req.cookies.userLoginInfo).email}'`;
        return findUser(query)
                    .then((data) => {
                        let user = {
                            aId: 'key',
                            name: data.name,
                            email: data.email,
                            password: data.password,
                            role: data.role,
                            image: data.image,
                            createdOn: data.created_on,
                            lastLogin: data.last_login,
                            isSocialAccount: data.is_social_account,
                            isLoggedIn: true
                        };
                        res.render('pages/editProfile', { year: currentYear, actionType: 'access user profile', status: 'success', code: '200', error: '', user: user, isLoggedin: true });        
                    })
                    .catch( (e) => console.log(e) );
    }
    res.render('auth/signin', { year: currentYear, actionType: 'access user profile', status: 'fail', code: '400', error: '', isLoggedIn: false });        
});


app.post('/auth/server/edit-profile', (req, res, next) => {
    console.log(`req.body= ${JSON.stringify(req.body)}`);
    const        userName = req.body.updatedUserName;
    const userNewPassword = req.body.updatedUserPassword;
    const noChangePassword = (userNewPassword === undefined || userNewPassword === '' || userNewPassword === null) ? true : false;
    
    // update user name and password if needed
    if (noChangePassword) { // only update userName
        return updateUserName(userName, JSON.parse(req.body.userLoginInfo).email)
                .then((result) => {
                    res.json({ actionType: 'Update user name in auth server', status: 'success', error: 'Update user name successfully' });
                })
                .catch((e) => { 
                    console.log(`Error in line 1, ${e}`); 
                    res.json({ actionType: 'Update user name in auth server', status: 'fail', error: e });
                });
    }

    return updateUserNameAndPassword(userName, userNewPassword, JSON.parse(req.body.userLoginInfo).email, bc, SALT_ROUNDS)
            .then((result) => {
                res.json({ actionType: 'Update user name and password in auth server', status: 'success', error: 'Update user name and password successfully' });
            })
            .catch((e) => {
                console.log(`Error in line 2, ${e}`);
                res.json({ actionType: 'Update user name and password in auth server', status: 'fail', error: e });
            });
});

// TODO: may open one more server to serve this route, then remove this
app.get('/auth/server/home', (req, res) => {
    if (req.isAuthenticated()) {
        return res.render('pages/home', { year: currentYear, actionType: 'Google-account-authenticated', status: 'success', error: 'None'});
    }
    res.render('auth/signin', { year: currentYear, actionType: 'Google-account-authenticated', status: 'fail', error: 'Google account authenticated fail' });
});

app.all('*', (req, res) => {
    res.redirect('/auth/server/signup');   
});

app.listen(PORT, () => console.log(`authServer is listening on port ${PORT}`));