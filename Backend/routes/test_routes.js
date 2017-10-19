var Assignment = require('../models/schemas').Assignment;
var Test = require('../models/schemas').Test;
var request = require('request');
var queries = require('../lib/queries');
var passport = require('passport');
var CasStrategy = require('passport-cas').Strategy;

const TESTER_IP = 'http://130.240.5.118:9100'

module.exports = function(router) {

//Retrieve tests from db and send them to tester
router.post('/test/1', function (req, res) {
    var lang = req.body.lang;
    var code = req.body.code;
    var assignment_id = req.body.assignment_id;

    //Get tests from our database
    queries.getTestsFromAssignment(assignment_id, function(tests) {

        request.post(
            TESTER_IP,
            { json: {
            'lang' : lang,
            'code' : code,
            'tests' : tests
        }},
        function (error, response, body){
            console.log(body)
            res.set('Content-Type', 'application/json');
            res.send(body);
        });
    });
});

router.get('/test/2', function (req, res) {
    queries.getTestsFromAssignment('59e47512d6bcdd1110d20f40', function(tests) {
       console.log("/ route retrieved");
       console.log(tests)
       res.send('Hello World');
    });
});   

}