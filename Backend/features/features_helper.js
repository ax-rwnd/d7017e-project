'use strict';

var mongoose = require('mongoose'); //Database communication
var queries = require('../lib/queries/features');

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

        if(feature.user.equals(user_id)) {
            return feature;
        }
    }
    throw new Error('User did not have a Feature for that course. Create one');
}


exports.passAllMandatoryTests = passAllMandatoryTests;
exports.getFeature = getFeature;
