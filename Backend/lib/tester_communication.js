'use strict';

var Assignment = require('../models/schemas').Assignment;
var Test = require('../models/schemas').Test;
var request = require('request');
var queries = require('../lib/queries/queries');

const TESTER_IP = 'http://130.240.5.118:9100';

//Retrieve tests from db and send them to Tester with the format accepted by Tester.
function validateCode(lang, code, assignment_id, res) {

    //Get tests from our database
    queries.getTestsFromAssignment(assignment_id, function(tests) {
        //console.log("hejasad")
        var testsNewFormat = [];     //this will hold the tests in the format accepted by Tester.

        //The tests needs to match the format used by Tester.
        for (var i = 0; i < tests.length; i ++) { 
            testsNewFormat.push( {stdin: tests[i].stdin, 
                args: tests[i].args, 
                stdout: tests[i].stdout,
                id: tests[i]._id
            } );
        }

        //Send the data to Tester
        request.post(
            TESTER_IP,
            { json: {
            'lang' : lang,
            'code' : code,
            'tests' : tests
        }},

        //send the response back to front end.
        function(error, response, body) {
            console.log(body);
            res.set('Content-Type', 'application/json');
            res.send(body);
        });
    });
}

exports.validateCode = validateCode;
