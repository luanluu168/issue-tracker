require('dotenv').config();
const express = require('express');
const { createProject, getProjects, deleteProject } = require('../database/projects');
const       morgan = require('morgan');
const cookieParser = require('cookie-parser');
const     app = express();
const    PORT = 4001;

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

app.listen(PORT, () => console.log(`apiServer is listening on port ${PORT}`));
