const dbConnection = require('./db');

const findUser = (query) => {
    return new Promise((resolve, reject) => {
        console.log(`------ query: ${query}`);
        dbConnection.any(query)
                    .then((data) => {
                        console.log(`Testing 1 pass...`);
                        if (data.length === 0) {
                            console.log(`Testing 2 pass...`);
                            reject({ error: 'User was not found', status: 'not found', code: '404' });
                            return;
                        } 
                        console.log(`Testing 3 pass...`);
                        // the case where data.length == 1, since data.length > 1 will not occur (unique email)
                        resolve(data[0]);
                    })
                    .catch((e) => {
                        console.log(`Testing 4 pass...`);
                        reject({ error: 'Error in finding a user', status: 'internal error', code: '500'});
                    }); 
    });
};

module.exports = { findUser };