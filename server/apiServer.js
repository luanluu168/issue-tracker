require('dotenv').config();
const express = require('express');
const { createProject, getProjects, deleteProject, updateProject } = require('../database/projects');
const { createIssue, getIssues, deleteIssue, updateIssue } = require('../database/issues');
const       morgan = require('morgan');
const cookieParser = require('cookie-parser');
const     app = express();
const    PORT = process.env.API_SERVER_PORT || 4001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

app.get('/api/server/data', (req, res) => {
    res.send('api data received');
});

app.post('/api/server/create-project/query', (req, res) => {
    console.log(`!!!!! api create project route is called, req.body= ${JSON.stringify(req.body)}`);
    if (req.body.userLoginInfo) {
        console.log(`!!!!!!!!! here`);
        const   userInCookie = JSON.parse(req.body.userLoginInfo);
        console.log(`----------- Date.now()= ${Date.now()}, req.body.projectEndDate= ${req.body.projectEndDate}`);
        const projectEndDate = new Date(Date.now() + parseInt(req.body.projectEndDate) * 24 * 60 * 60 * 1000);
        const    formatMonth = projectEndDate.getMonth()+1 < 10 ? `0${projectEndDate.getMonth()+1}` : projectEndDate.getMonth()+1;
        const projectEndDateTSF = `${projectEndDate.getFullYear()}-${formatMonth}-${projectEndDate.getDate()}`;
        const        promise = createProject(req.body.projectName, projectEndDateTSF, userInCookie.name, userInCookie.aId);
        console.log(`projectEndDate= ${projectEndDate}, formatMonth= ${formatMonth}, projectEndDateTSF= ${projectEndDateTSF}, promise= ${promise}`);
        return promise
                    .then((data) => {
                        console.log(`data= ${data}`);
                        res.send({ actionType: 'create-project', status: 'success', code: 200, error: 'New project created successfully', isLoggedin: true });
                    })
                    .catch((err) => console.log(`Error in api server create project: ${err}`));
    } else {
        console.log(`!!!!! Non login user want to create project`);
        res.send({ actionType: 'create-project', status: 'fail', code: 403, error: 'Must logged in first', isLoggedin: false });
    }
});

app.post('/api/server/delete-project/query', (req, res) => {
    console.log(`!!!!! api delete project route is called, req.body= ${JSON.stringify(req.body)}`);
    if (req.body.userLoginInfo) {
        console.log(`!!!!!!!!! deleteId= ${req.body.deleteId}`);
        const  promise = deleteProject(req.body.deleteId);
        return promise
                    .then((data) => {
                        console.log(`data= ${data}`);
                        res.send({ actionType: 'delete-project', status: 'success', code: 200, error: 'Delete project successfully', isLoggedin: true });
                    })
                    .catch((err) => console.log(`Error in api server delete project: ${err}`));
    } else {
        console.log(`!!!!! Non login user want to delete project`);
        res.send({ actionType: 'delete-project', status: 'fail', code: 403, error: 'Must logged in first', isLoggedin: false });
    }
});

app.post('/api/server/update-project/query', (req, res) => {
    console.log(`!!!!! api update project route is called, req.body= ${JSON.stringify(req.body)}`);
    if (req.body.userLoginInfo) {
        console.log(`!!!!!!!!! updateId= ${req.body.updateId}`);
        const    projectEndDate = new Date(Date.now() + parseInt(req.body.updateEndDate) * 24 * 60 * 60 * 1000);
        const       formatMonth = projectEndDate.getMonth()+1 < 10 ? `0${projectEndDate.getMonth()+1}` : projectEndDate.getMonth()+1;
        const projectEndDateTSF = `${projectEndDate.getFullYear()}-${formatMonth}-${projectEndDate.getDate()}`;

        const             today = new Date(Date.now() + 24 * 60 * 60 * 1000);
        const       formatToday = today.getMonth()+1 < 10 ? `0${today.getMonth()+1}` : today.getMonth()+1;
        const        modifiedOn = `${today.getFullYear()}-${formatToday}-${today.getDate()}`;
        const  modifiedBy = JSON.parse(req.body.userLoginInfo).name;
        const     promise = updateProject(req.body.updateId, req.body.updateName, projectEndDateTSF, req.body.updateStatus, modifiedOn, modifiedBy);
        return promise
                    .then((data) => {
                        console.log(`data= ${data}`);
                        res.send({ actionType: 'update-project', status: 'success', code: 200, error: 'Update project successfully', isLoggedin: true });
                    })
                    .catch((err) => console.log(`Error in api server update project: ${JSON.stringify(err)}`));
    } else {
        console.log(`!!!!! Non login user want to update project`);
        res.send({ actionType: 'update-project', status: 'fail', code: 403, error: 'Must logged in first', isLoggedin: false });
    }
});


// issues
app.post('/api/server/create-issue/query', (req, res) => {
    console.log(`!!!!! api create issue route is called, req.body= ${JSON.stringify(req.body)}, projectId= ${JSON.stringify(req.body.projectId)}, issueSummary= ${JSON.stringify(req.body.issueSummary)}`);
    if (req.body.userLoginInfo) {
        const    issueResolvedDate = new Date(Date.now() + parseInt(req.body.issueResolvedDate) * 24 * 60 * 60 * 1000);
        const          formatMonth = issueResolvedDate.getMonth()+1 < 10 ? `0${issueResolvedDate.getMonth()+1}` : issueResolvedDate.getMonth()+1;
        const issueResolvedDateTSF = `${issueResolvedDate.getFullYear()}-${formatMonth}-${issueResolvedDate.getDate()}`;

        const userInCookie = JSON.parse(req.body.userLoginInfo);
        const       userId = userInCookie.aId;
        const     userName = userInCookie.name;
        const      promise = createIssue(req.body.projectId, req.body.issueSummary, issueResolvedDateTSF, req.body.priority, userName, userId);
        return promise
                    .then((data) => {
                        console.log(`data= ${data}`);
                        res.send({ actionType: 'update-project', status: 'success', code: 200, error: 'Update project successfully', isLoggedin: true });
                    })
                    .catch((err) => console.log(`Error in api server update project: ${JSON.stringify(err)}`));
    } else {
        console.log(`!!!!! Non login user want to update project`);
        res.send({ actionType: 'update-project', status: 'fail', code: 403, error: 'Must logged in first', isLoggedin: false });
    }
});

app.post('/api/server/delete-issue/query', (req, res) => {
    console.log(`!!!!! api delete issue route is called, req.body= ${JSON.stringify(req.body)}, deleteId= ${JSON.stringify(req.body.deleteId)}, issueSummary= ${JSON.stringify(req.body.issueSummary)}`);
    if (req.body.userLoginInfo) {
        const  promise = deleteIssue(req.body.deleteId);
        return promise
                    .then((data) => {
                        console.log(`data= ${data}`);
                        res.send({ actionType: 'delete-issue', status: 'success', code: 200, error: 'Delete issue successfully', isLoggedin: true });
                    })
                    .catch((err) => console.log(`Error in api server delete issue: ${JSON.stringify(err)}`));
    } else {
        console.log(`!!!!! Non login user want to update project`);
        res.send({ actionType: 'delete-issue', status: 'fail', code: 403, error: 'Must logged in first', isLoggedin: false });
    }
});

app.post('/api/server/update-issue/query', (req, res) => {
    console.log(`!!!!! api update issue route is called, req.body= ${JSON.stringify(req.body)}, projectId= ${JSON.stringify(req.body.projectId)}, issueSummary= ${JSON.stringify(req.body.updateSummary)}`);
    if (req.body.userLoginInfo) {
        const    issueResolvedDate = new Date(Date.now() + parseInt(req.body.updateResolvedDate) * 24 * 60 * 60 * 1000);
        const          formatMonth = issueResolvedDate.getMonth()+1 < 10 ? `0${issueResolvedDate.getMonth()+1}` : issueResolvedDate.getMonth()+1;
        const issueResolvedDateTSF = `${issueResolvedDate.getFullYear()}-${formatMonth}-${issueResolvedDate.getDate()}`;

        const  updateSummary = req.body.updateSummary;
        const   updateStatus = req.body.updateStatus;
        const        issueId = req.body.updateId;
        const updatePriority = req.body.updatePriority;

        const          today = new Date(Date.now() + 24 * 60 * 60 * 1000);
        const    formatToday = today.getMonth()+1 < 10 ? `0${today.getMonth()+1}` : today.getMonth()+1;
        const     modifiedOn = `${today.getFullYear()}-${formatToday}-${today.getDate()}`;

        const   userInCookie = JSON.parse(req.body.userLoginInfo);
        const     modifiedBy = userInCookie.name;
        const        promise = updateIssue(updateSummary, issueResolvedDateTSF, updateStatus, updatePriority, modifiedOn, modifiedBy, issueId);
        return promise
                    .then((data) => {
                        console.log(`data= ${data}`);
                        res.send({ actionType: 'update-project', status: 'success', code: 200, error: 'Update project successfully', isLoggedin: true });
                    })
                    .catch((err) => console.log(`Error in api server update project: ${JSON.stringify(err)}`));
    } else {
        console.log(`!!!!! Non login user want to update project`);
        res.send({ actionType: 'update-project', status: 'fail', code: 403, error: 'Must logged in first', isLoggedin: false });
    }
});


app.listen(PORT, () => console.log(`apiServer is listening on port ${PORT}`));
