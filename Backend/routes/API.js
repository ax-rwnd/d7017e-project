var Assignment = require('../models/example_model').Assignment;
var Tests = require('../models/example_model').Tests;

var request = require('request');

module.exports = function(router) {

	router.get('/', function (req, res) {
	   console.log("/ route retrieved");
	   res.send('Hello World');
	});

/*
 * /test/ Endpoints
 */ 

	router.post('/test', function (req, res) {
		var lang = req.body.lang;
		var code = req.body.code;
		var test_id = req.body.test_id;

		// GET TESTS

		//var assignment = GetTest(test_id)

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
	    	res.set('Content-Type', 'application/json');
	    	res.send(body);
	    });
	});

    // TEMPORARY FUNCTION WHILE NOT CONNECTED TO TESTER
	router.post('/tester', function (req, res) {
		res.json(JSON.stringify({
		    'results': [
		        {'id':0, 'time': 45, 'ok': true},
		    ]
		}));
	});

/*
 * /users/ Endpoints
 */
 	router.get('/users', function (req, res) {
 		var ids = req.query.ids;
 		res.send("/users?ids=" + ids + " GET Endpoint");
 	});

	router.get('/users/:user_id', function (req, res) {
		var user_id = req.params.user_id;
		res.send("/users/" + user_id + " GET Endpoint");
	});

	router.delete('/users/:user_id', function (req, res) {
		var user_id = req.params.user_id;
		res.send("/users/" + user_id + " DELETE Endpoint");
	});

	router.post('/users/register', function (req, res) {
		res.send("/users/register POST Endpoint");
	});

	router.get('/users/:user_id/submissions', function (req, res) {
		var user_id = req.params.user_id;
		res.send("/users/" + user_id + "/submissions GET Endpoint");
	});

	router.get('/users/:user_id/courses', function (req, res) {
		var user_id = req.params.user_id;
		res.send("/users/" + user_id + "/courses GET Endpoint");
	});

	router.post('/users/:user_id/courses', function (req, res) {
		var user_id = req.params.user_id;
		res.send("/users/" + user_id + "/courses POST Endpoint");
	});

	router.get('/users/:user_id/courses/:course_id/submissions', function (req, res) {
		var user_id = req.params.user_id;
		var course_id = req.params.course_id;
		res.send("/users/" + user_id + "/courses/" + course_id + "/submissions GET Endpoint");
	});




/*
 * /courses/ Endpoints
 */
 	router.get('/courses/:course_id/users', function (req, res) {
 		var course_id = req.params.course_id;
		res.send("/courses/" + course_id + "/users GET Endpoint");
	});

 	router.get('/courses/:course_id/submissions', function (req, res) {
 		var course_id = req.params.course_id;
		res.send("/courses/" + course_id + "/submissions GET Endpoint");
	});

 	router.post('/courses/:course_id/submissions', function (req, res) {
 		var course_id = req.params.course_id;
		res.send("/courses/" + course_id + "/submissions POST Endpoint");
	});

	router.get('/courses/:course_id/submissions/:submission_id', function (req, res) {
 		var course_id = req.params.course_id;
 		var submission_id = req.params.submissions_id
		res.send("/courses/" + course_id + "/submissions/" + submission_id + " GET Endpoint");
	});

	router.get('/courses/:course_id/tests', function (req, res) {
 		var course_id = req.params.course_id;
		res.send("/courses/" + course_id + "/tests GET Endpoint");
	});

	router.get('/courses/:course_id/tests/:test_id', function (req, res) {
 		var course_id = req.params.course_id;
 		var test_id = req.params.test_id
		res.send("/courses/" + course_id + "/tests/" + test_id + " GET Endpoint");
	});

};