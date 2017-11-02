'use strict';

var queries = require('../../lib/queries/queries');
var helper = require('../features_helper');

function init(emitter, name) {
    emitter.on('handleBadges', function(data) {
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

    // Specific code for badges

    // All mandatory tests must pass

    return 'result of badges';
}

exports.init = init;
