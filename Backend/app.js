'use strict';

var express = require('express'); //Routes package
var mongoose = require('mongoose'); //Database communication
mongoose.Promise = require('bluebird');
var bodyParser = require('body-parser');
var expressHbs = require('express-handlebars');
var cors = require('cors');
var config = require('config');
var logger = require('./logger'); //Use Logger
var errors = require('./lib/errors.js');
var morgan = require('morgan');
var fs = require('fs');
var crypto = require('crypto');

var app = express();

let secret;
try {
    secret = fs.readFileSync('.secret', 'utf8');
} catch (e) {
    secret = crypto.randomBytes(64).toString('hex');
    fs.writeFileSync('.secret', secret, 'utf8');
} finally {
    config.App.secret = secret;
}

process.title = config.get('App.title');

// Make sure NODE_ENV matches express env to make env accessible
// to the routers as well
// process.env.NODE_ENV = app.get('env');
config.App.environment = app.get('env');

initApp();

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));
app.use(cors({origin: '*'}));

//defining routes
var auth = express.Router();
require('./routes/auth')(auth);
app.use('/auth', auth);

var users = express.Router();
require('./routes/api/users')(users);
app.use('/api/users', users);

var courses = express.Router();
require('./routes/api/courses')(courses);
app.use('/api/courses', courses);

var features = express.Router();
require('./routes/api/features')(features);
app.use('/api/features', features);

var tester = express.Router();
require('./routes/api/tester')(tester);
app.use('/api/tester', tester);

var search = express.Router();
require('./routes/api/search')(search);
app.use('/api/search', search);


//Route not found.
app.use(function (req, res, next) {
    console.log("Not found");
    next(errors.NOT_FOUND);
});

app.use(function (err, req, res, next) {
    if (err.name != "APIError") {
        return next(err);
    }

    //console.log(err);
    res.status(err.httpCode).send("HTTP error: " + err.httpCode + " " + err.message);
});

app.use(function (err, req, res, next) {
    if (err.name !== "AuthorizationError") {
        return next(err);
    }

    //console.log(err);
    res.status(err.httpCode).send("HTTP error: " + err.httpCode + " " + err.message);
});

app.use(function (err, req, res, next) {
    if (err.name === "CastError") {
        return res.status(400).send("HTTP error: 400 Bad Input");
    }
    //logger.log('error', err.);

/*
    if (req.app.get('env') !== 'development') {
        delete err.stack;
    }
*/
    //console.log(err);
    res.status(500).send("HTTP error: 500 Internal server error");
});

// Function to initiate the app/server into development- or production mode. (depends on NODE_ENV)
function initApp() {
    let dbConfig = config.get('Mongo.dbConfig'); //Get mongo database config
    console.log("Server running in " + app.get('env') + " mode.");
    mongoose.connect(dbConfig.host+":"+dbConfig.port+'/'+dbConfig.database_name, { useMongoClient: true }); // Connect to development- or production database);
}

module.exports = app;
