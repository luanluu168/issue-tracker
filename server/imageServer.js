require('dotenv').config();
const         path = require('path');
const      express = require('express');
const { setUserImage } = require('../database/users');
const       morgan = require('morgan');
const        axios = require('axios');
const cookieParser = require('cookie-parser');
const       multer = require('multer');
const      storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '..', 'public', 'upload'));
    },
    filename: (req, file, cb) => {
        console.log(file);
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});
const fileFilter = (req, file, cb) => {
    if (file.mimetype == 'image/jpeg' || file.mimetype == 'image/png') {
        cb(null, true);
    } else {
        cb(null, false);
    }
};
const limits = {
    fileSize: 1024 * 1024
};
let         upload = multer({ storage: storage, limits: limits, fileFilter: fileFilter });
const         PORT = process.env.IMAGE_SERVER_PORT || 4005;
const          app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(morgan('dev'));

app.get('/image/server/change-user-image', (req, res) => {
    res.redirect('/auth/server/edit-profile');
});
app.post('/image/server/change-user-image', upload.single('userAvatar'), async (req, res) => {
    try {
        console.log(`!!!!!!!!!!! image server, req.body= ${JSON.stringify(req.body)}}, req.file= ${req.file}`);
        let newImageLink = '';
        if (req.file) {
            const imageDir = '/upload/';
            await setUserImage(JSON.parse(req.cookies.userLoginInfo).email, req.file.filename, imageDir).catch((e) => console.log(e) );
            // update user cookie image
            newImageLink = `${imageDir}${req.file.filename}`;
        }
        
        const changeUserName = (newName) => { 
            let  userInCookie = JSON.parse(req.cookies.userLoginInfo);
            if(newImageLink != '') { userInCookie.image = newImageLink };
            userInCookie.name = newName;
            res.cookie("userLoginInfo", 
                        JSON.stringify(userInCookie), 
                        { maxAge: 2 * 60 * 60 * 1000 }); // expire in 2 hours
        };
        // pass the setting of new user name and password to the auth server
        const URL = `${req.protocol}://${req.headers.host}/auth/server/edit-profile`;
        axios({
                method: 'POST',
                url: URL,
                data: {
                    userLoginInfo: req.cookies.userLoginInfo,
                    updatedUserName: req.body.userName,
                    updatedUserPassword: req.body.newPassword
                }
                })
                .then((result) => result.data)
                .then((data) => {
                    console.log(`!!!!!!!!!!! update change-user-image route successfully`);
                    changeUserName(req.body.userName);
                    res.redirect(`${req.protocol}://${req.headers.host}/auth/server/edit-profile`);
                })
                .catch((err) => res.send(`Error ${err}`));
    } catch (error) {
        console.log(`Error in change user image route, ${error}`);
    }
});


app.listen(PORT, () => console.log(`Image server is listening on port ${PORT}`));