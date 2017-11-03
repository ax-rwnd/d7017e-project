'use strict';

var queries = require('../../lib/queries/features');
var helper = require('../features_helper');

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

    // Specific code for dumping result data into the db

    // All mandatory tests must pass

    return 'result of this data';
}

exports.init = init;
