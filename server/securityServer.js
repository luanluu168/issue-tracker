require('dotenv').config();
const         path = require('path');
const      express = require('express');
const        axios = require('axios');
const       morgan = require('morgan');
const cookieParser = require('cookie-parser');
const         PORT = process.env.SECURITY_SERVER_PORT || 4004;
const          app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(cookieParser());
app.use(morgan('dev'));

(process.env.PRODUCTION === 'NO') ? app.set('views', 'views') : app.set('views', '../views');
app.set('view engine', 'pug');

const       today = new Date();
const currentYear = today ? today.getFullYear() : 2020;

app.get('/security/server/verify-is-human', (req,res) => {
    res.render('pages/verifyIsHuman', { year: currentYear });
});
app.post('/security/server/verify-is-human', (req,res) => {
    console.log(`security server is called, req.body= ${JSON.stringify(req.body)}`);
    const token = req.body['g-recaptcha-response'];
    console.log(`token= ${token}`);
    if(token == undefined || token == '' || token == null) {
      return res.render('pages/verifyIsHuman', {actionType: 'verify recaptcha', status: 'fail', code: 1, error: "Please complete the captcha"});
    }

    let secretKey = process.env.RECAPTCHA_SECRET_KEY;
    let verificationUrl = "https://www.google.com/recaptcha/api/siteverify?secret=" + secretKey + "&response=" + token + "&remoteip=" + req.socket.remoteAddress;

    axios({
        method: 'POST',
        url: verificationUrl
        })
        .then(result => {
            console.log(`!!!! 1. result.data= ${JSON.stringify(result.data)}`)
            result.data
        })
        .then(result => {
            console.log(`!!!! 2. verify recaptcha successfully`)
            res.cookie("recaptcha", 
                    {
                        "actionType": "verify recaptcha",
                        "status": "success",
                        "code": "0",
                        "error": "none"
                    }, 
                    { maxAge: 2 * 60 * 60 * 1000 }); // expire in 2 hours
            res.render('auth/signup', { year: currentYear });
        })
        .catch(err => { console.log(`Error in getting verifaction google recaptcha url: ${err}`) });
});



app.listen(PORT, () => { console.log(`Security server is listening on port ${PORT}`) });
