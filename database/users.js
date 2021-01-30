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

const registerUserByOAuth = (user, bc, SALT_ROUNDS) => {
    return new Promise((resolve, reject) => {
        const userName = user.name;
        const userEmail = user.email;
        const userPassword = user.aId;
        const userRole = user.role;
        console.log(`userName= ${userName}, userEmail= ${userEmail}, userPassword= ${userPassword}, userRole= ${userRole}`);

        // check if the input data are all valid (not undefined)
        if (userName == undefined || userEmail == undefined || userPassword == undefined || userRole == undefined) return reject({ error: 'Data arguments require', actionType: 'Register user', status: 'fail', code: '400'});

        const callback = (err, hashPass) => {
            if (err) { reject({ error: err, actionType: 'Hash Password', status: 'fail', code: '500'}); }

            const    userId = parseInt(("" + user.aId).substring(0,7));
            const     query = `INSERT INTO "Users" (id, name, email, password, role) VALUES (${userId}, '${userName}', '${userEmail}', '${hashPass}', '${userRole}')`;
            console.log(`------ registerUser query: ${query}`);
            dbConnection.any(query)
                        .then((data) => {
                            console.log(`Register Google oauth user testing 1 pass...`);
                            console.log(`hashPass= ${hashPass}`);
                            resolve({ error: 'Google oauth Account register successfully', actionType: 'Register user', status: 'success', code: '200' });
                        })
                        .catch((e) => {
                            console.log(`Register Google oauth user testing 2 pass...`);
                            reject({ error: 'Google email already existed', actionType: 'Register user', status: 'fail', code: '400'});
                        }); 
        };
        // use async bcrypt function to hash
        bc.hash(userPassword, SALT_ROUNDS, callback);
    });
};

module.exports = { 
    findUser,
    registerUser,
    registerUserByOAuth
};