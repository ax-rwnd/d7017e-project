'use strict';

var mongoose = require('mongoose'); //Database communication
var queries = require('../lib/queries/features');
var logger = require('../lib/logger');

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

async function getFeature(user_id, assignment_id) {
    let course = await queries.getCourseByAssignmentID(assignment_id);

    for (let feature_item of course.features) {
        let feature = await queries.getFeatureByID(feature_item);

        if(feature === null) {
            logger.log("warn",'Feature '+feature_item+' in course '+course._id+' is null and should be removed!');
        } else {
            if(feature.user._id.equals(user_id)) {
                return feature;
            }
        }
    }

    return await queries.createFeature(user_id, course._id);
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
