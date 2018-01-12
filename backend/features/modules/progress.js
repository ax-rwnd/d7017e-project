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

function run(data) {

    let progress = {};

    return queries.getFeatureOfUserID(data.course_id, data.user_id)
    .then(function(feature) {
        return queries.updateFeatureProgress(data.user_id, feature._id, data.assignment_id, helper.prepareProgressData(data))
        .then(function() {
            return queries.getFeatureOfUserID(data.course_id, data.user_id)
            .then(function(feature) {
                return queries.getNumberOfAssignments(data.course_id)
                .then(function(numberOfAssignments) {

                    progress.total = numberOfAssignments;
                    progress.completed = feature.progress.length;

                    return progress;
                });
            });
        });
    });
}

exports.init = init;
