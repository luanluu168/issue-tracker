const dbConnection = require('./db');

const findUser = (query) => {
    return new Promise((resolve, reject) => {
        console.log(`------query: ${query}`);
        dbConnection.any(query)
                    .then((data) => {
                        console.log(`Signin testing 1 pass...`);
                        if (data.length === 0) {
                            console.log(`Signin testing 2 pass...`);
                            reject({ error: 'User was not found', status: 'not found', code: '404' });
                            return;
                        } 
                        console.log(`Signin testing 3 pass...`);
                        // the case where data.length == 1, since data.length > 1 will not occur (unique email)
                        resolve(data[0]);
                    })
                    .catch((e) => {
                        console.log(`Signin testing 4 pass...`);
                        reject({ error: 'Error in finding a user', status: 'internal error', code: '500'});
                    }); 
    });
};

const registerUser = (user, bc, SALT_ROUNDS) => {
    return new Promise((resolve, reject) => {
        const { userName, userEmail, userPassword, userRole } = user;

        // check if the input data are all valid (not undefined)
        if (userName == undefined || userEmail == undefined || userPassword == undefined || userRole == undefined) return reject({ error: 'Data arguments require', actionType: 'Register user', status: 'fail', code: '400'});

        const callback = (err, hashPass) => {
            if (err) { reject({ error: err, actionType: 'Hash Password', status: 'fail', code: '500'}); }

            const     query = `INSERT INTO "Users" (name, email, password, role) VALUES ('${userName}', '${userEmail}', '${hashPass}', '${userRole}')`;
            console.log(`------ registerUser query: ${query}`);
            dbConnection.any(query)
                        .then((data) => {
                            console.log(`Register user testing 1 pass...`);
                            console.log(`hashPass= ${hashPass}`);
                            resolve({ error: 'Account register successfully', actionType: 'Register user', status: 'success', code: '200' });
                        })
                        .catch((e) => {
                            console.log(`Register user testing 2 pass...`);
                            reject({ error: 'User email already existed', actionType: 'Register user', status: 'fail', code: '400'});
                        }); 
        };
        // use async bcrypt function to hash
        bc.hash(userPassword, SALT_ROUNDS, callback);
    });
};

const registerUserByOAuth = (user) => {
    const { userName, userEmail, userPass, userRole } = user;
    const query = `INSERT INTO "Users"(name, email, password, role) VALUES (${userName}, ${userEmail}, ${userPass}, ${userRole})`;
    console.log(`------ registerUser query: ${query}`);
    dbConnection.any(query)
                .then((data) => {
                    console.log(`RegisterUserByOAth testing 1 pass...`);
                    resolve({ error: 'Account register successfully', actionType: 'Register user', status: 'success', code: '200' });
                })
                .catch((e) => {
                    console.log(`RegisterUserByOAth testing 2 pass...`);
                    reject({ error: 'User email already existed', actionType: 'Register user', status: 'fail', code: '400'});
                }); 
};

module.exports = { findUser, registerUser, registerUserByOAuth };