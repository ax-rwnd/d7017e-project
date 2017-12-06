'use strict';

var requireDir = require('require-dir');
var EventEmitter = require('events-async');
var helper = require('./features_helper');
var queries = require('../lib/queries/features');

var emitter = new EventEmitter();

let feature_names = [];

function initFeatures() {

    var features = requireDir('./modules');

    for(var feature in features) {

        if(feature_names.indexOf(feature) === -1) {
            feature_names.push(feature);
        } else {
            throw new Error('Multiple features has the same name');
        }

        if(!features[feature].hasOwnProperty('init')) {
            throw new Error('Feature module `'+feature+
                '` did not have init function');
        }

        features[feature].init(emitter, feature);
    }
}

function emitEvent(result) {
    return new Promise(function (resolve, reject) {

        result.passed = helper.passAllMandatoryTests(result);

        if(!result.passed) {
            resolve(result);
            return;
        }

        //queries.getFeatureOfUserID(result.course_id, result.user_id)
        //.then(function(feature) {
        //    console.log(feature);
        //helper.getFeature(result.user_id, result.assignment_id).then(function(feature) {
            emitter.emit('handleFeatures', result)
            .then(function(data) {
                result.features = createResultjson(data);
                resolve(result);
            });
        //}).catch(function(err) {
        //    throw new Error(err);
        //});
    });
}

function createResultjson(data) {
    let json = {};
    
    data.forEach(function(item) {

        if(Object.keys(item).length != 1) {
            throw new Error('Result was too long');
        }

        let key = Object.keys(item)[0];

        if(feature_names.indexOf(key) === -1) {
            throw new Error('Feature not supported');
        }

        json[key] = item[key];
    });

    return json;
}

// Should be moved. But to where?
initFeatures();

exports.initFeatures = initFeatures;
exports.emitEvent = emitEvent;
