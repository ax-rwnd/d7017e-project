'use strict';

var Assignment = require('../models/schemas').Assignment;
var Test = require('../models/schemas').Test;
var request = require('request');
var queries = require('../lib/queries/queries');
var queries_features = require('../lib/queries/features');
var features = require('../features/features');
var logger = require('./logger');
var config = require('config');
var errors = require('./errors');

//Retrieve tests from db and send them to Tester with the format accepted by Tester.
function validateCode(user_id, lang, code, assignment_id) {
    //Get tests from our database

    return queries.getTestsFromAssignment(assignment_id)
    .then(function (tests) {
        /*if(!tests.hasOwnProperty('tests') || tests.tests === undefined) {
            logger.log("error",'Assignment', assignment_id, 'did not have tests object.');
            return res.sendStatus(500);
        }

        if(!tests.tests.hasOwnProperty('io') || tests.tests.io === undefined) {
            logger.log("error",'Assignment', assignment_id, 'did not have io list.');
            return res.sendStatus(500);
        }*/

        tests.tests.io.forEach(function(test) {
            test.id = test._id;
            delete test._id;
        });

        if(tests.hasOwnProperty('optional_tests')) {
            if(tests.optional_tests !== undefined && tests.optional_tests.hasOwnProperty('io')) {
                tests.optional_tests.io.forEach(function(test) {
                    test.id = test._id;
                    delete test._id;
                });
            } else {
                tests.optional_tests = [];
            }
        }

        if(config.get('App.environment') === 'production') {
            throw new Error('Remove `rejectUnauthorized` for production in '+ module.filename);
        }


        return new Promise(function (resolve, reject){

            request({
                url: config.get('Tester.tester_url'),
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
                        logger.log("error",'Tester returned', response.statusCode);
                    }
                    logger.log("error",error);
                    reject(error);
                    //res.sendStatus(response.statusCode);
                } else {

                    body.user_id = user_id;
                    body.assignment_id = assignment_id;
                    return queries_features.getCourseByAssignmentID(assignment_id)
                    .then(function(data) {
                        body.course_id = data._id;

                        // Do checks of result, like syntax errors, mandatory tests and so on...
                        return features.emitEvent(body)
                        .then(function(result) {
                            resolve(result);
                        });
                    });
                }
            });
        });
    });
}

function getTesterLanguages() {
    return new Promise(function (resolve, reject){

        if(config.get('App.environment') === 'production') {
            throw new Error('Remove `rejectUnauthorized` for production in '+ module.filename);
        }

        request({
            url: config.get('Tester.tester_url')+'/languages',
            method: 'GET',
            agentOptions: {
                rejectUnauthorized: false
            }
        }, function (error, response, body) {
            if(error || response.statusCode != 200) {
                throw new Error(error);
            } else {
                resolve(body);
            }
        });
    });
}

exports.validateCode = validateCode;
exports.getTesterLanguages = getTesterLanguages;
