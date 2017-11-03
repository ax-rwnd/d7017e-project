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

    // Specific code for badges
    
    let t = await helper.getFeature(data.user_id, data.assignment_id);

    console.log(t);


    return 'result of badges';
}

exports.init = init;
