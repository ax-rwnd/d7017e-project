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

    // Specific code for score and timing

    // All mandatory tests must pass

    // Performance calculate on both mandatory, optional tests and lint
    // ((4+3)/7)*0.9 + 0.1*0
    // ((Mandatory tests + optional tests) / total numer of tests) * 0.9 +
    // lint bool*0.1

    return 'result of score and timing';
}

exports.init = init;
