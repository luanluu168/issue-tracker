require('dotenv').config();
const          bc = require('bcrypt');
const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS, 10);
const        SALT = bc.genSalt(SALT_ROUNDS);

module.exports = { bc, SALT_ROUNDS, SALT };