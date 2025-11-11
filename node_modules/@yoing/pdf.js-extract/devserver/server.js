const bodyParser = require('body-parser');
const express = require('express');

const { handler } = require('./handler');

const app = express();

app.use(bodyParser.raw());

app.post('/bookUpload', handler);

app.listen(3000, () => {
    // eslint-disable-next-line no-console
    console.log('listening on http://localhost:3000');
});
