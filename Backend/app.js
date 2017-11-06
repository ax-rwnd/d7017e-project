'use strict';

var express = require('express'); //Routes package
var mongoose = require('mongoose'); //Database communication
mongoose.Promise = require('bluebird');
var bodyParser = require('body-parser');
var passport = require('passport'); //authentication
var expressHbs = require('express-handlebars');
var cors = require('cors');
var config = require('config');
var logger = require('./logger'); //Use Logger
var errors = require('./lib/errors.js');
var morgan = require('morgan');

var app = express();

initApp();

//mongoose.set('debug', true);
process.title = 'd7017e-backend';
process.env.JWT_SECRET_KEY = 'supersecret';
process.env.JWT_AUTH_HEADER_PREFIX = 'bearer';

// Make sure NODE_ENV matches express env to make env accessible
// to the routers as well
process.env.NODE_ENV = app.get('env');

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));
app.use(passport.initialize());
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

var test_routes = express.Router();
require('./routes/api/tests')(test_routes);
app.use('/api/tests', test_routes);


//Route not found.
app.use(function (req, res, next) {
    console.log("Not found");
    next(errors.NOT_FOUND);
});

app.use(function (err, req, res, next) {
    if (err.name != "APIError") {
        return next(err);
    }

    console.log(err);
    res.status(err.httpCode).send("HTTP error: " + err.httpCode + " " + err.message);
});

app.use(function (err, req, res, next) {
    if (err.name !== "AuthorizationError") {
        return next(err);
    }

    console.log(err);
    res.status(err.httpCode).send("HTTP error: " + err.httpCode + " " + err.message);
});

app.use(function (err, req, res, next) {
    if (err.name === "CastError") {
        res.status(400).send("HTTP error: 400 Bad Input");
    }
    //logger.log('error', err.);

/*
    if (req.app.get('env') !== 'development') {
        delete err.stack;
    }
*/
    console.log(err);
    res.status(500).send("HTTP error: 500 Internal server error");
});

// Function to initiate the app/server into development- or production mode. (depends on NODE_ENV)
function initApp() {
    var dbConfig = config.get('Mongo.dbConfig'); //Get mongo database config
    console.log("Server running in " + app.get('env') + " mode.");
    mongoose.connect(dbConfig.host+":"+dbConfig.port+'/'+dbConfig.database_name, { useMongoClient: true }); // Connect to development- or production database);
}

module.exports = app;
