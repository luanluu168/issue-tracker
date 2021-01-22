const dbConnection = require('./db');

const findUser = (query) => {
    return new Promise((resolve, reject) => {
        dbConnection.any(query)
                    .then((data) => {
                        if (data.length === 0) {
                            reject({ error: 'User was not found', status: 'not found', code: '404' });
                            return;
                        } 
                        // the case where data.length == 1, since data.length > 1 will not occur (unique email)
                        resolve(data[0]);
                    })
                    .catch((e) => {
                        reject({ error: 'Error in finding a user', status: 'internal error', code: '500'});
                    }); 
    });
};

module.exports = { findUser };