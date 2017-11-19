'use strict';

var queries = require('../../lib/queries/features');
var helper = require('../features_helper');
var logger = require('../../lib/logger');

function init(emitter, name) {
    emitter.on('handleFeatures', function(data) {
        return new Promise(function (resolve, reject){
            run(data).then(function(result) {
                let json = {};
                json[name] = result;
                resolve(json);
            }).catch(function(err) {
                logger.error(err);
            });
        });
    });
}

async function run(data) {

    let feature = await helper.getFeature(data.user_id, data.assignment_id);

    await queries.updateFeatureProgress(data.user_id, feature._id, data.assignment_id, helper.prepareProgressData(data));

    let progress = {};

    progress.total = await queries.getNumberOfAssignments(data.course_id);
    progress.completed = await queries.getNumberOfCompletedAssignments(data.course_id, data.user_id);

    return progress;
}

function updateProgress(progress, feature_progress={}) {
    progress.tests.forEach(function(test) {
        let foundTestInFeatureProgress = false;
        feature_progress.tests.forEach(function(feature_test) {
            if(feature_test.test.equals(test.test)) {
                foundTestInFeatureProgress = true;

                if(test.results === true) {
                    feature_test.results = true;
                }
                feature_test.optional_test = test.optional_test;
            }
        });
        if(!foundTestInFeatureProgress) {
            feature_progress.tests.push(test);
        }
    });

    return feature_progress;
}

exports.init = init;
