
require('dotenv').config();
const    path = require('path');
const express = require('express');
const   axios = require('axios');
const cookieParser = require('cookie-parser');
const  morgan = require('morgan');
const { getProjects } = require('../database/projects');
const { getIssues } = require('../database/issues');
const     app = express();
const    PORT = process.env.FRONTEND_SERVER_PORT || 4003;

(process.env.PRODUCTION === 'NO') ? app.set('views', 'views') : app.set('views', '../views');
app.set('view engine', 'pug');

app.use(express.json()); // handle json data
app.use(express.urlencoded({ extended: true })); // to recognize the incoming Request Object as strings or arrays, with nested objects, or generally any type.
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(cookieParser());
app.use(morgan('dev'));

const       today = new Date();
const currentYear = today ? today.getFullYear() : 2020;

app.get('/', (req, res) => {
    if (req.cookies.userLoginInfo) {
        const userInCookie = JSON.parse(req.cookies.userLoginInfo);
        return res.render('pages/landing', { year: currentYear, actionType: 'access-landing-page', status: 'success', error: 'None', user: userInCookie, isLoggedin: true });
    }
    res.render('pages/landing', { year: currentYear, actionType: 'access-landing-page', status: 'success', error: 'None', isLoggedin: false });
});

app.get('/home', (req, res) => {
    if (req.cookies.userLoginInfo) {
        const       userInCookie = JSON.parse(req.cookies.userLoginInfo);
        const getProjectsPromise = getProjects(userInCookie.aId);
        return getProjectsPromise
                    .then((projects) => {
                        return res.render('pages/home', { year: currentYear, actionType: 'access-home-page', status: 'success', error: 'None', user: userInCookie, isLoggedin: true, listings: projects });
                    })
                    .catch((err) => { console.log(`${err}`) });
    }
    process.env.PRODUCTION == 'NO' ? res.redirect(`${process.env.DOMAIN_NAME}:${process.env.PORT}/auth/server/signin`) : res.redirect(`${process.env.DOMAIN_NAME}/auth/server/signin`);
});

app.post('/create-project', (req, res) => {
    if (req.cookies.userLoginInfo) {
        const       userInCookie = JSON.parse(req.cookies.userLoginInfo);
        console.log(`create-projects route, userInCookie= ${userInCookie}, req.body.projectEndDate= ${req.body.projectEndDate}`);
        const URL = (process.env.PRODUCTION == 'NO') ?  `${process.env.DOMAIN_NAME}:${process.env.PORT}/api/server/create-project/query` : 
                                                        `${process.env.DOMAIN_NAME}/api/server/create-project/query`;

        // use proxy is another approach, but the api server also need to implement proxy or redirect to a another modified url which cost more than just simply use axios
        return axios({
                    method: 'POST',
                    url: URL,
                    data: {
                        userLoginInfo: req.cookies.userLoginInfo,
                        projectEndDate: req.body.projectEndDate,
                        projectName: req.body.projectName
                    }
                    })
                    .then((result) => result.data)
                    .then((data) => {
                        console.log(`axios create project data= ${JSON.stringify(data)}`);
                        res.redirect('/home');
                    })
                    .catch((err) => console.log(`Error ${err}`));
    }
    process.env.PRODUCTION == 'NO' ? res.redirect(`${process.env.DOMAIN_NAME}:${process.env.PORT}/auth/server/signin`) : res.redirect(`${process.env.DOMAIN_NAME}/auth/server/signin`);
});

app.post('/delete-project', (req, res) => {
    if (req.cookies.userLoginInfo) {
        const       userInCookie = JSON.parse(req.cookies.userLoginInfo);
        console.log(`create-projects route, userInCookie= ${userInCookie}, req.body.projectEndDate= ${req.body.projectEndDate}`);
        const URL = (process.env.PRODUCTION == 'NO') ?  `${process.env.DOMAIN_NAME}:${process.env.PORT}/api/server/delete-project/query` : 
                                                        `${process.env.DOMAIN_NAME}/api/server/delete-project/query`;

        // use proxy is another approach, but the api server also need to implement proxy or redirect to a another modified url which cost more than just simply use axios
        return axios({
                    method: 'POST',
                    url: URL,
                    data: {
                        userLoginInfo: req.cookies.userLoginInfo,
                        projectEndDate: req.body.projectEndDate,
                        projectName: req.body.projectName
                    }
                    })
                    .then((result) => result.data)
                    .then((data) => {
                        console.log(`axios delete project data= ${JSON.stringify(data)}`);
                        res.redirect('/home');
                    })
                    .catch((err) => console.log(`Error ${err}`));
    }
    process.env.PRODUCTION == 'NO' ? res.redirect(`${process.env.DOMAIN_NAME}:${process.env.PORT}/auth/server/signin`) : res.redirect(`${process.env.DOMAIN_NAME}/auth/server/signin`);
});

app.post('/update-project', (req, res) => {
    if (req.cookies.userLoginInfo) {
        const       userInCookie = JSON.parse(req.cookies.userLoginInfo);
        console.log(`create-projects route, userInCookie= ${userInCookie}, req.body.projectEndDate= ${req.body.projectEndDate}`);
        const URL = (process.env.PRODUCTION == 'NO') ?  `${process.env.DOMAIN_NAME}:${process.env.PORT}/api/server/modify-project/query` : 
                                                        `${process.env.DOMAIN_NAME}/api/server/modify-project/query`;

        // use proxy is another approach, but the api server also need to implement proxy or redirect to a another modified url which cost more than just simply use axios
        return axios({
                    method: 'POST',
                    url: URL,
                    data: {
                        userLoginInfo: req.cookies.userLoginInfo,
                        projectEndDate: req.body.projectEndDate,
                        projectName: req.body.projectName
                    }
                    })
                    .then((result) => result.data)
                    .then((data) => {
                        console.log(`axios create project data= ${JSON.stringify(data)}`);
                        res.redirect('/home');
                    })
                    .catch((err) => console.log(`Error ${err}`));
    }
    process.env.PRODUCTION == 'NO' ? res.redirect(`${process.env.DOMAIN_NAME}:${process.env.PORT}/auth/server/signin`) : res.redirect(`${process.env.DOMAIN_NAME}/auth/server/signin`);
});

app.post('/crud-project', (req, res) => {
    const btnValue = req.body.crudProjectBtn;
    const       id = req.body.projectId;
    console.log(`crud-project route is called, req.body= ${JSON.stringify(req.body)} btnValue= ${btnValue}, id= ${id}`);
    const      URL = (process.env.PRODUCTION == 'NO') ? `${process.env.DOMAIN_NAME}:${process.env.PORT}/api/server/${btnValue}-project/query` : 
                                                        `${process.env.DOMAIN_NAME}/api/server/${btnValue}-project/query`;

    switch (btnValue) {
        case 'delete':
            console.log(`switch to delete`);
            axios({
                method: 'POST',
                url: URL,
                data: {
                    userLoginInfo: req.cookies.userLoginInfo,
                    deleteId: id
                }
                })
                .then((result) => result.data)
                .then((data) => {
                    console.log(`axios delete project data= ${JSON.stringify(data)}`);
                    res.redirect('/home');
                })
                .catch((err) => console.log(`Error ${err}`));
            break;
        case'update':
            console.log(`switch to update`);
            axios({
                method: 'POST',
                url: URL,
                data: {
                    userLoginInfo: req.cookies.userLoginInfo,
                    updateId: id,
                    updateName: req.body.projectNameInModal,
                    updateEndDate: req.body.endDateInModal,
                    updateStatus: req.body.optradio
                }
                })
                .then((result) => result.data)
                .then((data) => {
                    console.log(`axios update project data= ${JSON.stringify(data)}`);
                    res.redirect('/home');
                })
                .catch((err) => console.log(`Error ${err}`));
            break;
        default:
            console.log(`switch to detail`);
            res.redirect(`/project-issue/?pid=${id}&pname=${req.body.projectName}`);
    }
});

app.get('/project-issue', (req, res) => {
    const      URL = (process.env.PRODUCTION == 'NO') ? `${process.env.DOMAIN_NAME}:${process.env.PORT}/api/server/project-issue/query` : 
                                                        `${process.env.DOMAIN_NAME}/api/server/project-issue/query`;
    console.log(`req.query= ${JSON.stringify(req.query.pid)}`);

    if (req.cookies.userLoginInfo) {
        const       userInCookie = JSON.parse(req.cookies.userLoginInfo);
        const          projectId = req.query.pid;
        const              pname = req.query.pname;
        console.log(`projectId= ${projectId}`)
        const   getIssuesPromise = getIssues(projectId);
        return getIssuesPromise
                    .then((issues) => {
                        console.log(`get issues successfully`);
                        res.render('pages/issue', { year: currentYear, actionType: 'access-issue-page', status: 'success', error: 'None', isLoggedin: true, user: userInCookie, projectName: pname, projectId: projectId, listings: issues });
                    })
                    .catch((err) => {
                        console.log(`Error ${err}`);
                        res.render('pages/error', { year: currentYear, actionType: 'access-issue-page', status: 'fail', error: 'Error occur when accessing issue page', isLoggedin: true });
        });
    }
    process.env.PRODUCTION == 'NO' ? res.redirect(`${process.env.DOMAIN_NAME}:${process.env.PORT}/auth/server/signin`) : res.redirect(`${process.env.DOMAIN_NAME}/auth/server/signin`);


    // axios({
    //     method: 'POST',
    //     url: URL,
    //     data: {
    //         userLoginInfo: req.cookies.userLoginInfo,
    //         detailId: req.params.pid
    //     }
    //     })
    //     .then((result) => result.data)
    //     .then((data) => {
    //         console.log(`axios detail project data= ${JSON.stringify(data)}`);
    //         res.render('pages/issue', { year: currentYear, actionType: 'access-issue-page', status: 'success', error: 'None', isLoggedin: true });
    //     })
    //     .catch((err) => {
    //         console.log(`Error ${err}`);
    //         res.render('pages/error', { year: currentYear, actionType: 'access-issue-page', status: 'fail', error: 'Error occur when accessing issue page', isLoggedin: true });
    //     });
});

app.post('/crud-issue', (req, res) => {
    const btnValue = req.body.crudIssueBtn;
    const       id = req.body.issueId;
    const      pid = req.body.projectId;
    const    pname = req.body.projectName;
    console.log(`crud-issue route is called, req.body= ${JSON.stringify(req.body)} btnValue= ${btnValue}, id= ${id}`);
    const      URL = (process.env.PRODUCTION == 'NO') ? `${process.env.DOMAIN_NAME}:${process.env.PORT}/api/server/${btnValue}-issue/query` : 
                                                        `${process.env.DOMAIN_NAME}/api/server/${btnValue}-issue/query`;

    switch (btnValue) {
        case 'create':
            console.log(`switch to create`);
            axios({
                method: 'POST',
                url: URL,
                data: {
                    userLoginInfo: req.cookies.userLoginInfo,
                    projectId: req.body.projectId,
                    issueSummary: req.body.issueSummary,
                    issueResolvedDate: req.body.issueResolvedDate,
                    priority: req.body.optradio
                }
                })
                .then((result) => result.data)
                .then((data) => {
                    console.log(`axios create issue succesfully`);
                    res.redirect(`/project-issue/?pid=${req.body.projectId}&pname=${req.body.projectName}`);
                })
                .catch((err) => console.log(`Error ${err}`));
            break;
        case 'delete':
            console.log(`switch to delete`);
            axios({
                method: 'POST',
                url: URL,
                data: {
                    userLoginInfo: req.cookies.userLoginInfo,
                    deleteId: id
                }
                })
                .then((result) => result.data)
                .then((data) => {
                    console.log(`axios delete issue data= ${JSON.stringify(data)}`);
                    res.redirect(`/project-issue/?pid=${pid}&pname=${pname}`);
                })
                .catch((err) => console.log(`Error ${err}`));
            break;
        case'update':
            console.log(`switch to update`);
            axios({
                method: 'POST',
                url: URL,
                data: {
                    userLoginInfo: req.cookies.userLoginInfo,
                    updateId: id,
                    updateName: req.body.projectNameInModal,
                    updateEndDate: req.body.endDateInModal,
                    updateStatus: req.body.optradio
                }
                })
                .then((result) => result.data)
                .then((data) => {
                    console.log(`axios update project data= ${JSON.stringify(data)}`);
                    res.redirect('/home');
                })
                .catch((err) => console.log(`Error ${err}`));
            break;
        default:
            console.log(`switch to detail`);
            res.redirect(`/project-issue/?pid=${id}&pname=${req.body.projectName}`);
    }
});

app.all('*', (req, res) => {
    res.render('pages/error', { year: currentYear, actionType: 'response', code: '404', error: 'Page not found!', detail: 'You try to catch some fog but you miss :(' });
});

app.listen(PORT, () => console.log(`frontend server is listening on port ${PORT}`));