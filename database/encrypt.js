require('dotenv').config();
const    bc = require('bcrypt');
const  SALT = bc.genSalt(parseInt(process.env.SALT_ROUNDS, 10));

module.exports = { bc, SALT };