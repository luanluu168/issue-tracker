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
            const     query = `INSERT INTO "Users" (id, name, email, password, role, is_social_account) VALUES (${userId}, '${userName}', '${userEmail}', '${hashPass}', '${userRole}', ${true})`;
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

const setUserImage = (userEmail, imageFile, imageDir) => {
    return new Promise((resolve, reject) => {
                const query = `UPDATE "Users" SET image='${imageDir}${imageFile}' WHERE email='${userEmail}'`;
                console.log(`query= ${query}`);
                
                dbConnection.any(query)
                        .then((data) => {
                            console.log(`Update user image successfully`);
                            resolve({ error: 'Update user image successfully', actionType: 'Update user image', status: 'success', code: '200' });
                        })
                        .catch((e) => {
                            console.log(`Fail to update user image, error= ${e}`);
                            reject({ error: 'Fail to update user image', actionType: 'Update user image', status: 'fail', code: '400' });
                        });
    });
};

const updateUserNameAndPassword = (userName, userPassword, userEmail, bc, SALT_ROUNDS) => {
    return new Promise((resolve, reject) => {
        const callback = (err, hashPass) => {
            if (err) { reject({ error: err, actionType: 'Hash Password', status: 'fail', code: '500'}); }

            const query = `UPDATE "Users" SET name='${userName}', password='${hashPass}' WHERE email='${userEmail}'`;
            console.log(`query= ${query}`);
            dbConnection.any(query)
                        .then((data) => {
                            console.log(`Update user name and password successfully`);
                            resolve({ error: 'Update user name and password successfully', actionType: 'Update user name and password', status: 'success', code: '200' });
                        })
                        .catch((e) => {
                            console.log(`Fail to update user name, error= ${e}`);
                            reject({ error: 'Fail to update user name', actionType: 'Update user name and password', status: 'fail', code: '400' });
                        }); 
        };
        // use async bcrypt function to hash
        bc.hash(userPassword, SALT_ROUNDS, callback);
    });
};

const updateUserPassword = (userPassword, userEmail, bc, SALT_ROUNDS) => {
    return new Promise((resolve, reject) => {
        const callback = (err, hashPass) => {
            if (err) { reject({ error: err, actionType: 'Hash Password', status: 'fail', code: '500'}); }

            const query = `UPDATE "Users" SET password='${hashPass}' WHERE email='${userEmail}'`;
            console.log(`query= ${query}`);
            dbConnection.any(query)
                        .then((data) => {
                            console.log(`Update user password successfully`);
                            resolve({ error: 'Update user password successfully', actionType: 'Update user password', status: 'success', code: '200' });
                        })
                        .catch((e) => {
                            console.log(`Fail to update user password, error= ${e}`);
                            reject({ error: 'Fail to update user password', actionType: 'Update user password', status: 'fail', code: '400' });
                        }); 
        };
        // use async bcrypt function to hash
        bc.hash(userPassword, SALT_ROUNDS, callback);
    });
};

const updateUserName = (userName, userEmail) => {
    return new Promise((resolve, reject) => {
        const query = `UPDATE "Users" SET name='${userName}' WHERE email='${userEmail}'`;
        console.log(`query= ${query}`);
        
        dbConnection.any(query)
                .then((data) => {
                    console.log(`Update user name successfully`);
                    resolve({ error: 'Update user name successfully', actionType: 'Update user name', status: 'success', code: '200' });
                })
                .catch((e) => {
                    console.log(`Fail to update user name, error= ${e}`);
                    reject({ error: 'Fail to update user name', actionType: 'Update user name', status: 'fail', code: '400' });
                });
    });
};

const updateUserLastLogin = (userEmail, currentTimeStamp) => {
    return new Promise((resolve, reject) => {
        const query = `UPDATE "Users" SET last_login='${currentTimeStamp}' WHERE email='${userEmail}'`;
        console.log(`query= ${query}`);
        
        dbConnection.any(query)
                .then((data) => {
                    console.log(`Update user last login time successfully`);
                    resolve({ error: 'Update user name successfully', actionType: 'Update user name', status: 'success', code: '200' });
                })
                .catch((e) => {
                    console.log(`Fail to update user last login time, error= ${e}`);
                    reject({ error: 'Fail to update user name', actionType: 'Update user name', status: 'fail', code: '400' });
                });
    });
};

module.exports = { 
    findUser,
    registerUser,
    registerUserByOAuth,
    setUserImage,
    updateUserNameAndPassword,
    updateUserPassword,
    updateUserName,
    updateUserLastLogin
};