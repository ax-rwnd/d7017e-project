'use strict';

var Assignment = require('../models/schemas').Assignment;
var Test = require('../models/schemas').Test;
var request = require('request');
var queries = require('../lib/queries/queries');
var features = require('../features/features');
var logger = require('../logger'); //Use Logger

const TESTER_IP = 'http://130.240.5.118:9100';

//Retrieve tests from db and send them to Tester with the format accepted by Tester.
function validateCode(lang, code, assignment_id, res) {

    //Get tests from our database
    queries.getTestsFromAssignment(assignment_id, function(tests) {
        tests.tests.io.forEach(function(test) {
            test.id = test._id;
            delete test._id;
        });
        tests.optional_tests.io.forEach(function(test) {
            test.id = test._id;
            delete test._id;
        });

        //Send the data to Tester
        request.post(
            TESTER_IP,
            { json: {
            'lang' : lang,
            'code' : code,
            'tests' : tests.tests,
            'optional_tests': tests.optional_tests
        }},

        //send the response back to front end.
        function(error, response, body) {
            if(response.statusCode != 200) {
                logger.error('Response from tester was bad');
                res.sendStatus(500);
            } else {

                body.assignment_id = assignment_id;

                // Do checks of result, like syntax errors, mandatory tests and so on...
                features.emitEvent(body).then(function(result) {
                    res.set('Content-Type', 'application/json');
                    res.send(result);
                });
            }
        });
    });
}

exports.validateCode = validateCode;
