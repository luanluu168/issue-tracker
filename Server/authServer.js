const express = require('express');
const     app = express();
const    PORT = 4002;

app.set('view engine', 'pug');

app.get('/auth/server', (req, res) => {
    res.render('auth/signin', {success: true});
});

app.listen(PORT, () => console.log(`authServer is listening on port ${PORT}`));
