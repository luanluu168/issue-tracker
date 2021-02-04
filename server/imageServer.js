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
        // console.log(`storage->destination, req.body= ${req.body}, file= ${JSON.stringify(file)}`);
        cb(null, path.join(__dirname, '..', 'public', 'upload'));
    },
    filename: (req, file, cb) => {
        // console.log(`storage->filename `);
        console.log(file);
        // cb(null, Date.now() + path.extname(file.originalname));
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
let         upload = multer({ storage: storage, fileFilter: fileFilter });
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
    console.log(`!!!!!!!!!!! image server, req.body= ${JSON.stringify(req.body)}}`);
    
    const imageDir = '/upload/';
    await setUserImage(JSON.parse(req.cookies.userLoginInfo).email, req.file.filename, imageDir).catch((e) => console.log(e) );
    
    const changeUserName = (newName) => { JSON.parse(req.cookies.userLoginInfo).name = newName };
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
});


app.listen(PORT, () => console.log(`Image server is listening on port ${PORT}`));