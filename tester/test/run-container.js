const logger = require('../log.js');
const request = require('request');
const Docker = require('dockerode');

const docker = new Docker();

async function startContainer(lang) {
    // starts a runner in a container and resolves to a container object
    // connection info is added as field .extra.address
    var containerConfig = {
        Image: 'tester_'+lang,
        Cmd: [],
        'Hostconfig': {
            AutoRemove: true,
        }
    };
    c = await docker.createContainer(containerConfig);
    var container = await c.start();
    const inspectData = await container.inspect();
    container.extra = {address: inspectData.NetworkSettings.IPAddress + ':8080'};
    return container;
}

function _containerReady(container, resolve, reject) {
    // resolves to the container when the runner responds to ping
    request.get('http://' + container.extra.address + '/ping')
    .on('response', response => {
        if(response.statusCode == 200) {
            // Marks a container as ready
            resolve(container);
        } else {
            setTimeout(() => {
                _containerReady(container, resolve, reject);
            }, 250);
        }
    }).on('error', function(error) {
        setTimeout(() => {
            _containerReady(container, resolve, reject);
        }, 250);
    });
}

function containerReady(container) {
    return new Promise((resolve, reject) => {
        _containerReady(container, resolve, reject);
    });
}

async function startRunner(lang) {
    // resolves to a container that is ready
    // you are responsible for calling container.stop() when you are done
    var container = await startContainer(lang);
    await containerReady(container);
    return container;
}
//
//logger.level = 'debug';
//startRunner('python27').then(container => {
//    logger.debug('ok');
//    container.stop();
//}).catch(err => {
//    logger.debug('err');
//    logger.debug(err);
//});

module.exports.startRunner = startRunner;
