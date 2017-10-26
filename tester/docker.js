/* jshint node: true */
'use strict';

var logger = require('winston');
var uuidv4 = require('uuid/v4');
var request = require('request');
var tcpPortUsed = require('tcp-port-used');
var config = require('config').get('docker');
var Docker = require('dockerode');

var docker = new Docker();

var available_ports = [];
var containers = {};

function init() {
    for (var i = 0; i < config.get('MAX_GLOBAL_CONTAINERS'); i++) {
        available_ports.push(config.get('START_PORT')+i);
    }

    config.get('LANGS').forEach(function(lang) {
        containers[lang] = [];

        // Start containers to maintain pool
        for(i = 0; i < config.get('MIN_UNUSED_CONTAINERS_PER_LANG'); i++) {
            try {
                startContainer(lang);
            } catch (e) {
                logger.info(e);
            }
        }
    });
}

function getID() {
    return uuidv4();
}

function getPort() {
    // Get one of the available ports
    if(available_ports.length == 0 || available_ports == undefined) {
        throw new Error('No ports are available');
    } else {
        return available_ports.shift();
    }
}

function returnPort(port) {
    // Return port to pool
    tcpPortUsed.waitUntilFree(port, 50, 10000).then(function() {
        available_ports.push(port);
    }, function(err) {
        logger.error(err);
        throw err;
    });
}

function startContainer(lang) {

    var id = getID();

    var port;
    try {
        port = getPort();
    } catch (e) {
        return;
    }

    var c = {
        lang: lang,
        id: id,
        port: port,
        used: false,
        ready: false,
        time_created: Date.now()
    };
    containers[lang].push(c);

    var containerConfig = {
        Image: 'tester_'+lang,
        Cmd: [],
        name: id,
        'HostConfig': {
            Memory: config.get('CONTAINER_MEMORY'),
            CpuPeriod: config.get('CONTAINER_CPU_PERIOD'),
            CpuQuota: config.get('CONTAINER_CPU_QUOTA'),
            AutoRemove: true, // Remove container when stopped
            PortBindings: {
                '8080/tcp': [{ 'HostPort': port.toString() }]
            }
        }
    };

    docker.createContainer(containerConfig, function (err, container) {
        if(err) {
            returnPort(port);
            containers[lang].pop(c);
            logger.warn(err);

        } else {
            container.start(function (err, data) {
                if(err) {
                    returnPort(port);
                    containers[lang].pop(c);
                    logger.warn(err);
                } else {
                    waitForContainer(c);

                    c.idle_timeout = setTimeout(function() {
                        if(containers[lang].length >
                                config.get('MIN_UNUSED_CONTAINERS_PER_LANG') &&
                                !c.used) {
                            stopContainer(c);
                        }
                    }, config.get('IDLE_TIMEOUT'));
                }
            });
        }
    });
}

function waitForContainer(c, iteration = 0) {

    if(containers[c.lang].indexOf(c) === -1) {
        // This happen if user try toshut down the system while containers are
        // still starting. In this case stop pinging container.
        return;
    }

    if(iteration > 200) {
        logger.warn('Timeout for contacting node inside container.',
            'Node didn\'t start in 10seconds. Stopping container', c.id);
        stopContainer(c);
    } else {
        request.get('http://localhost:'+c.port+'/ping')
        .on('response', function(response) {
            if(response.statusCode == 200) {
                // Marks a container as ready
                c.ready = true;
            } else {
                setTimeout(function () {
                    waitForContainer(c, iteration+1);
                }, 50);
            }
        }).on('error', function(error) {
            setTimeout(function () {
                waitForContainer(c, iteration+1);
            }, 50);
        });
    }
}

function stopContainer(c, cb=function(){}) {
    containers[c.lang].splice(containers[c.lang].indexOf(c), 1);
    clearTimeout(c.idle_timeout);
    docker.getContainer(c.id).stop(function() {returnPort(c.port); cb();});
}

function getContainer(lang) {
    // Helper function to setup containers

    // Docker class hasn't been initiated yet
    if (containers[lang] === undefined) {
        throw new Error('Docker containers for that language is not initialized');
    }

    if(containers[lang].length == 0) {
        try {
            startContainer(lang);
        } catch(e) {
            logger.error(e);
        }
        throw new Error('No containers available for that language right now');
    }

    // Update existing containers and start new if less than max
    for(var i = 0; i < containers[lang].length; i++) {
        var c = containers[lang][i];

        if(!c.used && c.ready) {
            c.used = true;

            if(containers[lang].length <
                    config.get('MAX_CONTAINERS_PER_LANG')) {
                try {
                    startContainer(lang);
                } catch(e) {
                    logger.info(e);
                }
            }

            return {id: c.id, port: c.port};
        }
    }

    throw new Error('No container was ready for use');
}

function returnContainer(id) {
    // Destroys or recycles a container
    config.get('LANGS').forEach((lang) => {
        for(var i = 0; i < containers[lang].length; i++) {
            var c = containers[lang][i];

            // Container found recycle it
            if(c.id === id) {
                // Start a new container to replace the one returned
                if(containers[lang].length <
                        config.get('MAX_CONTAINERS_PER_LANG')) {
                    try {
                        startContainer(lang);
                    } catch(e) {
                        logger.info(e);
                    }
                }
                stopContainer(c);
            }
        }
    });
}

function stopContainers(cb) {

    available_ports = null;

    let total;
    let stopped = 0;

    let callback = function() {

        total = 0;
        config.get('LANGS').forEach((lang) => {
            total += containers[lang].length;
        });
        if(total == 0) {
            cb();
        } else {
            stopContainers(cb);
        }
    };

    total = 0;
    config.get('LANGS').forEach((lang) => {
        total += containers[lang].length;
        for(var i = 0; i < containers[lang].length; i++) {
            stopContainer(containers[lang][i], callback);
        }
    });

    // No containers running
    if(total == 0) {
        cb();
    }
}

exports.init = init;
exports.getContainer = getContainer;
exports.returnContainer = returnContainer;
exports.containers = containers;
exports.stopContainers = stopContainers;
