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
                logger.log("error",err);
            });
        });
    });
}

async function run(data) {

    let feature = await helper.getFeature(data.user_id, data.assignment_id);

    await queries.updateFeatureProgress(data.user_id, feature._id, data.assignment_id, helper.prepareProgressData(data));

    feature = await helper.getFeature(data.user_id, data.assignment_id);

    let progress = {};

    progress.total = await queries.getNumberOfAssignments(data.course_id);
    progress.completed = feature.progress.length;

    return progress;
}

exports.init = init;
