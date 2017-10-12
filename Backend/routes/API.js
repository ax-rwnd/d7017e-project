var Assignment = require('../models/example_model').Assignment;
var Tests = require('../models/example_model').Tests;


module.exports = function(router) {

	router.get('/', function (req, res) {
	   console.log("/ route retrieved")
	   res.send('Hello World');
	})
};