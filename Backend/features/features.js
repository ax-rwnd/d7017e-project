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
        emitter.emit('handleFeature', result).then(function(data) {

            console.log(data);

            let json = {};
            data.forEach(function(item) {

                console.log(item);

                if(Object.keys(item).length != 1) {
                    reject('Result was too long');
                }

                let key = Object.keys(item)[0];

                if(feature_names.indexOf(key) === -1) {
                    reject('Feature not supported');
                }

                json[key] = item[key];
            });

            result.features = json;
            resolve(result);

        });
    });
}

// Should be moved. But to where?
initFeatures();

// TODO: REMOVE this after code is done
let t = {
    "results": {
        "io": [
            {
                "id": "59f8a1401ac36c0762eb46ab",
                "ok": true,
                "stderr": "",
                "time": 81440918
            },
            {
                "id": "59f8a1541ac36c0762eb46ac",
                "ok": true,
                "stderr": "",
                "time": 65636960
            }
        ],
        "prepare": "",
        "code_size": 20,
        "optional_tests": [
            {
                "id": "59f8a1621ac36c0762eb46ad",
                "ok": true,
                "stderr": "",
                "time": 23770657
            }
        ],
        "lint": "/tmp/tmp-21okZiNRuZOCOu.tmp:1:21: W292 no newline at end of file\n"
    }
};
//emitEvent(t).then(function(result) {
//    console.log(result);
//});
// END REMOVE

exports.initFeatures = initFeatures;
exports.emitEvent = emitEvent;
