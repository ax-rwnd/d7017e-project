'use strict';

var queries = require('../../lib/queries/features');
var helper = require('../features_helper');

function init(emitter, name) {
    emitter.on('handleTests', function(data) {
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

    // Specific code for progress

    // All mandatory tests must pass

    return 'result of timing';
}

exports.init = init;
