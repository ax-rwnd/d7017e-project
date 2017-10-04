'use strict';

const express = require('express');

// Constants
const PORT = 8080;
const HOST = '0.0.0.0';

// App
const app = express();
app.get('/', (req, res) => {
  res.send('Hello world from NodeJS inside a docker container!\n');
});

app.post('/', (req, res) => {
  res.send('Hello POST from NodeJS inside a docker container!\n')
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
