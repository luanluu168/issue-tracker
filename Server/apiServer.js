const express = require('express');
const     app = express();
const    PORT = 4001;

app.get('/api/server/data', (req, res) => {
    res.send('api data received');
});

app.listen(PORT, () => console.log(`apiServer is listening on port ${PORT}`));
