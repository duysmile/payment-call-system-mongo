const express = require('express');

const app = express();

app.post('/jobs', (req, res) => {

    res.send('ok');
});

app.listen(3000, () => {
    console.log('server started at port 3000');
});
