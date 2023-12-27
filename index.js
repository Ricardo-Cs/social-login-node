const express = require('express');
const connectToMongoDb = require('./app/config/db.config');
const app = express();

connectToMongoDb();

app.listen(3000, () => console.log('App running...'));