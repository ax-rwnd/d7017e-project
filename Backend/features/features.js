'use strict';

var requireDir = require('require-dir');
var EventEmitter = require('events-async');

var emitter = new EventEmitter();

var feature_names = [];

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
    return new Promise(function (resolve, reject){
        emitter.emit('handleFeatures', result).then(function(data) {
            /*if(data1.constructor !== Array) {
                data1 = [data1];
            }
            emitter.emit('handleBadges', result).then(function(data2) {
                if(data2.constructor !== Array) {
                    data2 = [data2];
                }
                result.features = createResultjson(data1.concat(data2));
                resolve(result);
            });*/
            result.features = data;
            resolve(result);
        });
    });
}

function createResultjson(data) {
    let json = {};
    data.forEach(function(item) {

        console.log(item);

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
