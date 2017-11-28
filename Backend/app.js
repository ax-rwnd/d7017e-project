'use strict';

var express = require('express'); //Routes package
var mongoose = require('mongoose'); //Database communication
mongoose.Promise = require('bluebird');
var bodyParser = require('body-parser');
var validator = require('express-validator');
var expressHbs = require('express-handlebars');
var cors = require('cors');
var config = require('config');
var logger = require('./lib/logger'); //Use Logger
var errors = require('./lib/errors.js');
var fs = require('fs');
var crypto = require('crypto');
var auth = require('./lib/authentication');
var swaggerUi = require('swagger-ui-express');
var swaggerDocument = require('./lib/swagger.json');

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


//app.use(logger.initializeMorgan()); //Initialize morgan with logger
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));
app.use(validator());
app.use(cors({origin: '*'}));

//defining routes
var auth_router = express.Router();
require('./routes/auth')(auth_router);
app.use('/auth', auth_router);

// only authenticated users can access /api
app.use('/api', auth.validateJWTtoken);

var users = express.Router();
require('./routes/api/users')(users);
app.use('/api/users', users);

var courses = express.Router();
require('./routes/api/courses')(courses);
app.use('/api/courses', courses);

/*
var features = express.Router();
require('./routes/api/features')(features);
app.use('/api/features', features);
*/

var tester = express.Router();
require('./routes/api/tester')(tester);
app.use('/api/tester', tester);

var search = express.Router();
require('./routes/api/search')(search);
app.use('/api/search', search);

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

//Route not found.
app.use(function (req, res, next) {
    next(errors.NOT_FOUND);
});

app.use(function (err, req, res, next) {
    if (err.name !== "APIError") {
        return next(err);
    }

    logger.log("error", err.message);
    res.status(err.httpCode).send(err.message);
});

app.use(function (err, req, res, next) {
    if (err.name !== "BadInputError") {
        return next(err);
    }

    logger.log("error", err.message);
    res.status(err.httpCode).json({message: err.message, badinput: err.inputErrors});
});

app.use(function (err, req, res, next) {
    if (err.name !== "AuthorizationError") {
        return next(err);
    }

    logger.log("error", err);
    res.status(err.httpCode).send(err.message);
});

app.use(function (err, req, res, next) {
    if (err.name === "CastError") {
        logger.log("error", err);
        return res.status(400).send("Bad Input");
    }

/*
    if (req.app.get('env') !== 'development') {
        delete err.stack;
    }
*/
    logger.log("serverError", err);
    res.status(500).send("Internal server error");
});

// Function to initiate the app/server into development- or production mode. (depends on NODE_ENV)
function initApp() {
    app.set('port', config.get('App.port')); //Set port from config
    let dbConfig = config.get('Mongo.dbConfig'); //Get mongo database config
    logger.initializeLogger(app);
    logger.log("info","Server running in " + app.get('env') + " mode.");

    mongoose.connect(dbConfig.host+":"+dbConfig.port+'/'+dbConfig.database_name, { useMongoClient: true }); // Connect to development- or production database);
}

module.exports = app;
