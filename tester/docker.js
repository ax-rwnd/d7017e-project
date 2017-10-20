/* jshint node: true */
'use strict';

var uuidv4 = require('uuid/v4');
var http = require('http');
var request = require('request');
var locks = require('locks');
var tcpPortUsed = require('tcp-port-used');
var config = require('config').get('docker');
var Docker = require('dockerode');

var docker = new Docker({socketPath: '/var/run/docker.sock'});
var docker = new Docker();

var mutex = locks.createMutex();
var available_ports = [];
var containers = {};

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
            console.log(e);
        }
    }
});

function getID() {
    return uuidv4();
}

function getPort() {
    // Get one of the available ports
    if(available_ports.length == 0) {
        throw new Error('No ports are available');
    } else {
        return available_ports.shift();
    }
}

function returnPort(port) {
    // Return port to pool
    tcpPortUsed.waitUntilFree(port, 250, 10000).then(function() {
        available_ports.push(port);
    }, function(err) {
        console.log('Error:', err.message);
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

    var containerConfig = {
        Image: 'tester_'+lang,
        Cmd: [],
        name: id,
        'Hostconfig': {
            AutoRemove: true,
            PortBindings: {
                "8080/tcp": [{ "HostPort": port.toString() }]
            }
        }
    };

    docker.createContainer(containerConfig, function (err, container) {
        if(err) {
            returnPort(port);
            console.log(err);
        } else {
            container.start(function (err, data) {
                if(err) {
                    returnPort(port);
                    console.log(err);
                } else {
                    var c = {
                        lang: lang,
                        id: id,
                        port: port,
                        used: false,
                        ready: false,
                        time_created: Date.now()
                    };
                    containers[lang].push(c);

                    waitForContainer(c);

                    setTimeout(function() {
                        if(containers[lang].length > config.get('MIN_UNUSED_CONTAINERS_PER_LANG') &&
                                !c.used || !c.ready) {
                            stopContainer(c);
                        }
                    }, config.get('IDLE_TIMEOUT'));
                }
            });
        }
    });
}

function waitForContainer(c, iteration = 0) {

    if(iteration > 20) {
        console.log("Something went wrong inside container; ", c);
    } else {
        request.get('http://localhost:'+c.port+'/ping')
        .on('response', function(response) {
            if(response.statusCode == 200) {
                // Marks a container as ready
                c.ready = true;
            } else {
                setTimeout(function () {
                    waitForContainer(c, iteration+1);
                }, 250);
            }
        }).on('error', function(error) {
            setTimeout(function () {
                waitForContainer(c, iteration+1);
            }, 250);
        });
    }
}

function stopContainer(c) {
    var container = docker.getContainer(c.id);
    container.stop();
    containers[c.lang].splice(containers[c.lang].indexOf(c), 1);
    returnPort(c.port);
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
            console.log(e);
        }
        throw new Error('No containers available for that language right now');
    }

    // Update existing containers and start new if less than max
    for(var i = 0; i < containers[lang].length; i++) {
        var c = containers[lang][i];

        if(!c.used && c.ready) {
            c.used = true;

            if(containers[lang].length < config.get('MAX_CONTAINERS_PER_LANG')) {
                try {
                    startContainer(lang);
                } catch(e) {
                    console.log(e);
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
                if(containers[lang].length < config.get('MAX_CONTAINERS_PER_LANG')) {
                    try {
                        startContainer(lang);
                    } catch(e) {
                        console.log(e);
                    }
                }
                stopContainer(c);
            }
        }
    });
}

function stopContainers(cb) {

    // TODO Handle new requests that start new containers when shutdown is being done.
    //      These new containers wont then be shut down and will block ports 
    docker.listContainers(function (err, containers) {
        if(containers.length == 0) {
            cb();
        } else {
            var remaining = containers.length;
            containers.forEach(function (containerInfo) {
                var callback = function(data) {
                    remaining--;
                    if(remaining == 0) {
                        cb();
                    }
                };
                docker.getContainer(containerInfo.Id).stop(callback);
            });
        }
    });
}

exports.getContainer = getContainer;
exports.returnContainer = returnContainer;
exports.containers = containers;
exports.stopContainers = stopContainers;