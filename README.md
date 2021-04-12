# issue-tracker
### use to track todos, bugs, and features

## Create .env file that looks the following way:
```
DATABASE_URL=postgres://<db_user>:<db_password>@<db_host>:<db_port>/<db_name>
SESSION_SECRET=<your_secret>
GOOGLE_CLIENT_ID=<your_google_client_id>
GOOGLE_CLIENT_SECRET=<your_google_client_secret>
REDIS_URL=<your_redis_url>
RECAPTCHA_SITE_KEY=<your_recaptcha_client_id>
RECAPTCHA_SECRET_KEY=<your_recaptcha_secret>
SENDGRID_API_KEY=<your_sendgrid_client_id>
```

## To Run
#### 1. Install all dependencies if not do it yet
```
npm i
```
#### 2. Install pm2 if not do it yet
```
npm install pm2 -g
```
#### 3. Run the app
```
npm test
```
#### Or
```
pm2 start process.config.js
```

## To Stop
```
npm stop
```
#### Or
```
pm2 kill
```

Frontend: PUG
Microservices in backend: Express Redis
