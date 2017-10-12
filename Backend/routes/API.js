var Assignment = require('../models/example_model').Assignment;
var Tests = require('../models/example_model').Tests;

var request = require('request');

module.exports = function(router) {

	router.get('/', function (req, res) {
	   console.log("/ route retrieved");
	   res.send('Hello World');
	})

	router.post('/test', function(req, res) {
		var lang = req.body.lang;
		var code = req.body.code;
		var test_id = req.body.test_id;

		// GET TESTS

		request.post(
			'http://127.0.0.1:8000/api/tester',
			{ json: {
			'lang' : lang,
			'code' : code,
			'tests' : [
				{'stdin':'', 'stdout':'hello world\n', 'id':0}
			]
	    }},
	    function (error, response, body){
	    	console.log(body)
	    	res.send(body);
	    });
	})

	router.post('/tester', function(req, res) {
		res.send("You are at the tester endpoint");
	})
};