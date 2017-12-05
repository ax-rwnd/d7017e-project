'use strict';

var mongoose = require('mongoose'); //Database communication
var queries = require('../lib/queries/features');
var logger = require('../lib/logger');
var errors = require('../lib/errors');

//see if all mandatory tests are passed
function passAllMandatoryTests(data) {
    var mandatoryTests = data.results.io;

    for (var i = 0; i < mandatoryTests.length; i++) {
        if (mandatoryTests[i].ok === false) {
            return false;
        }
    }
    return true;
}

function getFeature(user_id, assignment_id) {
    return queries.getCourseByAssignmentID(assignment_id).then(function(course) {
        return queries.getFeatureOfUserID(course._id, user_id);
    });
}

function arrayContainsArray (superset, subset) {
  return subset.every(function (value) {
    return (superset.indexOf(value) >= 0);
  });
}

function prepareProgressData(result) {

    let timing = 0;
    let tests = [];

    for(let test of result.results.io) {
        tests.push({test: test.id, result: test.ok, optional_test: false});
        timing += test.time;
    }
    for(let test of result.results.optional_tests) {
        tests.push({test: test.id, result: test.ok, optional_test: true});
    }

    return {
        assignment: result.assignment_id,
        tests: tests,
        timing: timing,
        code_size: result.results.code_size
    };
}


exports.passAllMandatoryTests = passAllMandatoryTests;
exports.getFeature = getFeature;
exports.arrayContainsArray = arrayContainsArray;
exports.prepareProgressData = prepareProgressData;
