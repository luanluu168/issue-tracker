const dbConnection = require('./db');

const getIssues = (projectId) => {
    const query = `SELECT * FROM "Issues" WHERE project_id=${projectId}`;
    console.log(`query= ${query}`); 
    return new Promise((resolve, reject) => {
                    dbConnection.any(query)
                            .then((data) => { 
                                // console.log(`getIssues, data= ${JSON.stringify(data)}`);
                                resolve(data);
                            })
                            .catch((err) => reject({ error: `Error in getting issues: ${err}`, status: 'internal error', code: '500' }));
    });
};

const createIssue = (projectId, summary, resolvedDate, priority, createdBy, userId) => {
    if (userId > Number.MAX_SAFE_INTEGER + 1) { userId= parseInt(("" + userId).substring(0,7)) };
    const query = `INSERT INTO "Issues"(project_id, summary, resolved_date, priority, created_by, user_id) VALUES (${parseInt(projectId)}, '${summary}', '${resolvedDate}', '${priority}', '${createdBy}', ${userId})`;
    console.log(`query= ${query}`); 
    return new Promise((resolve, reject) => {
                    dbConnection.any(query)
                            .then((data) => { 
                                console.log(data);
                                resolve(data);
                            })
                            .catch((err) => reject({ error: `Error in creating issues: ${err}`, status: 'internal error', code: '500' }));
    });
};

const deleteIssue = (deleteId) => {
    const query = `DELETE FROM "Issues" WHERE id=${deleteId}`;
    console.log(`query= ${query}`);
    return new Promise((resolve, reject) => {
                    dbConnection.any(query)
                            .then((data) => { 
                                console.log(`delete issue successfully`);
                                resolve(data);
                            })
                            .catch((err) => reject({ error: `Error in deleting issues: ${err}`, status: 'internal error', code: '500' }));
    });
};

const updateIssue = (updateSummary, updateResolvedDate, updateStatus, updatePriority, modifiedOn, modifiedBy, issueId) => {
    // calculate end date
    const query = `UPDATE "Issues" SET (summary, resolved_date, status, priority, modified_on, modified_by) = ('${updateSummary}', '${updateResolvedDate}', '${updateStatus}', '${updatePriority}', '${modifiedOn}', '${modifiedBy}') WHERE id=${issueId}`;
    console.log(`query= ${query}`);
    return new Promise((resolve, reject) => {
                    dbConnection.any(query)
                            .then((data) => { 
                                console.log(`update issues data successfully`);
                                resolve(data);
                            })
                            .catch((err) => reject({ error: `Error in update issues: ${err}`, status: 'internal error', code: '500' }));
    });
};

module.exports = {
    getIssues,
    createIssue,
    deleteIssue,
    updateIssue
};