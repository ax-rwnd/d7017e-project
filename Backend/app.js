var express = require('express'); //Routes package
var mongoose = require('mongoose'); //Database communication
var bodyParser = require('body-parser');
var passport = require('passport'); //authentication
var cors = require('cors');
var flags = require('flags'); //flags to start node with
var app = express();

var isProductionMode = false;

// Function to initiate the app/server into development- or production mode.
function initApp() {
  flags.defineBoolean('production', false, 'Run server as production environment?'); // Define a bool flag (true by default)
  flags.parse(); // Parse flag input

  isProductionMode = flags.get('production'); // Get flag if bool or not

  //Connect to development- or production database
  if (!isProductionMode){
    console.log("Server initialized in Development mode");  
    mongoose.connect('130.240.5.132:27017'); // Dev database
  } else{
    console.log("Server initialized in Production mode");  
    //mongoose.connect('130.240.5.132:27017'); // Production database
  }
}

initApp();

//mongoose.set('debug', true);
process.title = 'd7017e-backend';

app.use(bodyParser.json());
app.use(passport.initialize());
app.use(cors({origin: '*'}));

//defining routes
var api = express.Router();
require('./routes/API')(api);
app.use('/api', api);

//Route not found.
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

//Error in server. Basically http error 500, internal server error.
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  //res.locals.message = err.message;
  //res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.send("HTTP error: " + err.status + ". " + err.message);
});


module.exports = app;
