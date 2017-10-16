var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var cors = require('cors');

var app = express();

//Connect to db
//If you have no mongodb running. Comment the below to prevent the app from crashing at start.
mongoose.connect('130.240.5.132:27017');
//
//mongoose.set('debug', true);
process.title = 'd7017e-backend';

app.use(bodyParser.json());
app.use(cors({origin: '*'}));

//defining routes
var api = express.Router();
require('./routes/API')(api);
app.use('/api', api);

//

//NOT REALLY SURE WHAT THIS DOES
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

//NOT REALLY SURE WHAT THIS DOES
app.use(function(err, req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  // set locals, only providing error in development
  //res.locals.message = err.message;
  //res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.send("HTTP error: " + err.status + ". " + err.message);
});


module.exports = app;
