require('dotenv').config();
const    bc = require('bcrypt');
const  SALT = process.env.SALT;

module.exports = { bc, SALT };