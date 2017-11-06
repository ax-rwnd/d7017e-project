'use strict';

var queries = require('../../lib/queries/features');
var helper = require('../features_helper');
var logger = require('../../logger');

function init(emitter, name) {
    emitter.on('handleFeatures', function(data) {
        return new Promise(function (resolve, reject){
            run(data).then(function(result) {
                let json = {};
                json[name] = result;
                resolve(json);
            });
        });
    });
}

async function run(data) {

    queries.updateFeatureProgress(data.assignment_id, {progress: [helper.prepareProgressData(data)]});

    let progress = {};

    let total = await queries.getNumberOfAssignments(data.course_id);
    progress.total = total[0].total;
    
    let completed = await queries.getNumberOfCompletedAssignments(data.course_id, data.user_id);
    progress.completed = completed[0].completed;

    return progress;
}

function updateProgress(progress, feature_progress={}) {
    console.log(progress);
    console.log(feature_progress);

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



    console.log(feature_progress);
    return feature_progress;
}

exports.init = init;
