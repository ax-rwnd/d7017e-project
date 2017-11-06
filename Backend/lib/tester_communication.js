'use strict';

var Assignment = require('../models/schemas').Assignment;
var Test = require('../models/schemas').Test;
var request = require('request');
var queries = require('../lib/queries/queries');
var queries_features = require('../lib/queries/features');
var features = require('../features/features');
var logger = require('../logger'); //Use Logger

const TESTER_IP = 'https://130.240.5.119:9100';

//Retrieve tests from db and send them to Tester with the format accepted by Tester.
function validateCode(user_id, lang, code, assignment_id, res) {

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

        if(process.env.NODE_ENV != 'development') {
            throw new Error('Remove `rejectUnauthorized` for production in '+ module.filename);
        }

        request({
            url: TESTER_IP,
            method: 'POST',
            agentOptions: {
                rejectUnauthorized: false
            },
            json:  {
                "lang" : lang,
                "code" : code,
                "tests" : tests.tests,
                "optional_tests": tests.optional_tests
            }
        }, function (error, response, body) {
            if(error || response.statusCode != 200) {
                if(response) {
                    logger.error('Tester returned', response.statusCode);
                }
                logger.error(error);
                res.sendStatus(500);
            } else {

                body.user_id = user_id;
                body.assignment_id = assignment_id;
                queries_features.getCourseByAssignmentID(assignment_id).then(function(data) {
                    body.course_id = data._id;

                    // Do checks of result, like syntax errors, mandatory tests and so on...
                    features.emitEvent(body).then(function(result) {
                        res.set('Content-Type', 'application/json');
                        res.send(result);
                    });
                });
            }
        });
    });
}

function getTesterLanguages() {
    return new Promise(function (resolve, reject){

        if(process.env.NODE_ENV != 'development') {
            throw new Error('Remove `rejectUnauthorized` for production in '+ module.filename);
        }
        request({
            url: TESTER_IP+'/languages',
            method: 'GET',
            agentOptions: {
                rejectUnauthorized: false
            }
        }, function (error, response, body) {
            if(error || response.statusCode != 200) {
                reject(error);
            } else {
                console.log(body);
                resolve(body);
            }
        });
    });
}

exports.validateCode = validateCode;
exports.getTesterLanguages = getTesterLanguages;
