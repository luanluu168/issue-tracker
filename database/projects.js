const dbConnection = require('./db');

const getProjects = (userId) => {
    const query = `SELECT * FROM "Projects" WHERE user_id=${userId}`;
    console.log(`query= ${query}`); 
    return new Promise((resolve, reject) => {
                    dbConnection.any(query)
                            .then((data) => { 
                                // console.log(`getProjects, data= ${JSON.stringify(data)}`);
                                resolve(data);
                            })
                            .catch((err) => reject({ error: `Error in getting projects: ${err}`, status: 'internal error', code: '500' }));
    });
};

const createProject = (name, endDate, createdBy, userId) => {
    if (userId > Number.MAX_SAFE_INTEGER + 1) { userId= parseInt(("" + userId).substring(0,7)) };
    const query = `INSERT INTO "Projects"(name, end_date, created_by, user_id) VALUES ('${name}', '${endDate}', '${createdBy}', ${userId})`;
    console.log(`query= ${query}`); 
    return new Promise((resolve, reject) => {
                    dbConnection.any(query)
                            .then((data) => { 
                                console.log(data);
                                resolve(data);
                            })
                            .catch((err) => reject({ error: `Error in creating projects: ${err}`, status: 'internal error', code: '500' }));
    });
};

const deleteProject = (deleteId) => {
    const query = `DELETE FROM "Projects" WHERE id=${deleteId}`;
    return new Promise((resolve, reject) => {
                    dbConnection.any(query)
                            .then((data) => { 
                                console.log(data);
                                resolve(data);
                            })
                            .catch((err) => reject({ error: `Error in deleting projects: ${err}`, status: 'internal error', code: '500' }));
    });
};

const updateProject = (updateId, updateName, updateEndDate, updateStatus, modifiedOn, modifiedBy) => {
    // calculate end date
    const query = `UPDATE "Projects" SET (name, end_date, status, modified_on, modified_by) = ('${updateName}', '${updateEndDate}', '${updateStatus}', '${modifiedOn}', '${modifiedBy}') WHERE id=${updateId}`;
    console.log(`query= ${query}`);
    return new Promise((resolve, reject) => {
                    dbConnection.any(query)
                            .then((data) => { 
                                console.log(`update project data= ${data}`);
                                resolve(data);
                            })
                            .catch((err) => reject({ error: `Error in update projects: ${err}`, status: 'internal error', code: '500' }));
    });
};

module.exports = {
    getProjects,
    createProject,
    deleteProject,
    updateProject
};