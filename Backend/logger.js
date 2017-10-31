'use strict';

 var winston = require('winston'); //Logging 
 var config = require('config');
 
 // Setup winston as a logger
 var logConfig = config.get('Logger');  
 const logger = new (winston.Logger)({
     level: 'info',
     transports: [
       new (winston.transports.Console)(), //Log all to console
       new (winston.transports.File)(logConfig.combined), //Write to all logs with level `info` and below to `combined.log` 
       new (winston.transports.File)(logConfig.error), //Write all logs error (and below) to `error.log`.
     ]
   });

 module.exports = logger; //Expose logger to other modules what want to use it
