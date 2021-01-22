require('dotenv').config();
const config = {
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false } // need to set this for production to resolve error pg_hba ssl
};
const    pgPromise = require('pg-promise')();
const dbConnection = pgPromise(config);

module.exports = dbConnection;