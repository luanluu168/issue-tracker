require('dotenv').config();
const         path = require('path');
const      express = require('express');
const { setUserImage } = require('../database/users');
const       morgan = require('morgan');
const        axios = require('axios');
const cookieParser = require('cookie-parser');
const { PROTOCOL, currentYear } = require('../utils/utils');
const         Jimp = require('jimp');
const       multer = require('multer');
const      storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '..', 'public', 'upload'));
    },
    filename: (req, file, cb) => {
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

(process.env.PRODUCTION === 'NO') ? app.set('views', 'views') : app.set('views', '../views');
app.set('view engine', 'pug');

app.get('/image/server/change-user-image', (req, res) => {
    res.redirect('/auth/server/edit-profile');
});
const multerMiddleWare = (req, res, next) => {
    const uploadHandler = upload.single('userAvatar');
    uploadHandler(req, res, (error) => {
        if (error) { //instanceof multer.MulterError
            const userInCookie = JSON.parse(req.cookies.userLoginInfo);
            if (error.code == 'LIMIT_FILE_SIZE') {
                error.message = 'File Size is too large. Allowed max file size is 1MB :)';
                return res.render('pages/editProfile', { year: currentYear, actionType: 'Upload file', status: 'fail', code: '500', error: error.message, user: userInCookie, isLoggedin: true  });
            }
            return res.render('pages/editProfile', { year: currentYear, actionType: 'Upload file', status: 'fail', code: '500', error: `Multer file upload error: ${err}`, user: userInCookie, isLoggedin: true  });
        } 
        next();
    });
};
app.post('/image/server/change-user-image', multerMiddleWare, async (req, res) => {
    try {
        // console.log(`!!!!!!!!!!! image server, req.body= ${JSON.stringify(req.body)}}, req.file= ${req.file}, req.file.filename= ${req.file.filename}, req.file.filepath= ${req.file.filepath}`);
        let newImageLink = '';
        if (req.file) {
            const imageDir = '/upload/';
            await setUserImage(JSON.parse(req.cookies.userLoginInfo).email, req.file.filename, imageDir).catch((e) => console.log(e) );
            // update user cookie image
            newImageLink = `${imageDir}${req.file.filename}`;
            // reduce image size
            const filepath = `./public/upload/${req.file.filename}`;
            Jimp.read(filepath)
                .then((image) => {
                    image
                        .resize(150, 150)
                        .quality(60)
                        .write(filepath);
                })
                .catch((e) => { console.log(`Error in jimp reading file, ${e}`) });
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
        const URL = `${PROTOCOL}://${req.headers.host}/auth/server/edit-profile`;
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
                    res.redirect(`${PROTOCOL}://${req.headers.host}/auth/server/edit-profile`);
                })
                .catch((err) => res.send(`Error ${err}`));
    } catch (error) {
        console.log(`Error in change user image route, ${error}`);
    }
});


app.listen(PORT, () => console.log(`Image server is listening on port ${PORT}`));