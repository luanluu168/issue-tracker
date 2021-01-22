const    pgPromise = require('pg-promise')({});
const dbConnection =  pgPromise(process.env.DATABASE_URL);

module.exports = dbConnection;