'use strict';

 var winston = require('winston'); //Logging 
 var config = require('config');
 var morgan = require('morgan');

 // Setup winston as a logger
 var logConfig = config.get('Logger');
 const transports = [
  new (winston.transports.File)(logConfig.combined), //Write to all logs with level `info` and below to `combined.log`
  new (winston.transports.File)(logConfig.error), //Write all logs error (and below) to `error.log`.
  new (winston.transports.File)(logConfig.serverError) //Write all serverError (and below) to `error.log`.
 ];

 //Custom log levels
 const loggerLevels = {
  levels: {
    error: 0, 
    serverError: 1,
    warn: 2, 
    info: 3, 
    verbose: 4, 
    debug: 5, 
    silly: 6 
  }
};

 const logger = new (winston.Logger)({
  levels: loggerLevels.levels,
  level: 'info',
  transport: transports
});

/*
* Setup logger depending on enviornment setting.
*/
function initializeLogger(app){
  //Set environment-dependent transports
 switch(app.get('env')){
    case "production":
      setupProductionLogger();
      break;
    case "development":
      setupDevelopmentLogger();
      break;
 }
 //Connect streams for morgan
 var morganServerErrorStream = morgan('tiny', //setup error stream
 {skip: function (req, res) { return res.statusCode < 500; }, //only logs if status code is 500 or up
  stream: logger.serverErrorStream}); 

 var morganGeneralStream = morgan('tiny', //setup general stream
 {skip: function (req, res) { return res.statusCode >= 500; }, //only logs if status code below 500
  stream: logger.generalStream}); 
 
 app.use(morganServerErrorStream);
 app.use(morganGeneralStream);
}

//Function to setup logger with production settings
function setupProductionLogger() {
}

//Function to setup logger with development settings
function setupDevelopmentLogger() {
  logger.add(winston.transports.Console); //Add console transport to log all to console
}

//Log function exposed for external modules
function log(infoType,message){
  logger.log(infoType,message);
}

//Stream to connect logger with morgan.
logger.serverErrorStream = {
  write: function(message, encoding){
    logger.log('serverError',message); //Handle as serverError level
  }
};

//Stream to connect logger with morgan.
logger.generalStream = {
  write: function(message, encoding){
    logger.log('info',message); //Handle as info level
  }
};

//module.exports = logger; //Expose logger to other modules what want to use it

module.exports = {
  log,
  initializeLogger
};




