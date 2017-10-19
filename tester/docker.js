/* jshint node: true */
'use strict';

var uuidv4 = require('uuid/v4');
var execFile = require('child_process').execFile;
var http = require('http');
var request = require('request');
var locks = require('locks');
var tcpPortUsed = require('tcp-port-used');

//TODO: move this into the config file
const LANGS = ['python27', 'python3', 'java'];
const MIN_UNUSED_CONTAINERS_PER_LANG = 1;
const MAX_CONTAINERS_PER_LANG = 6;
const MAX_GLOABAL_CONTAINERS = 8;
const START_PORT = 16000;
const IDLE_TIMEOUT = 10000;

var mutex = locks.createMutex();
var available_ports = [];
var containers = {};

// Remove old docker images that are still running
const child = execFile('docker', ['ps', '-q'], (error, stdout, stderr) => {
    if (error) {
        console.error('stderr', stderr);
        throw error;
    }

    // Stop containers
    // TODO: shouldn't this be done using stopContainer(id)?
    cleanArray(stdout.split('\n')).forEach(function(id) {
        const child = execFile('docker', ['stop', id], (error, stdout, stderr) => {
            if (error) {
                console.error('stderr', stderr);
                throw error;
            }
        });
    });

    // Pool maintenance
    setTimeout(function () {
        for (var i = 0; i < MAX_GLOABAL_CONTAINERS; i++) {
            available_ports.push(START_PORT+i);
        }

        LANGS.forEach(function(lang) {
            containers[lang] = [];

            // Start containers to maintain pool
            for(i = 0; i < MIN_UNUSED_CONTAINERS_PER_LANG; i++) {
                startContainer(lang);
            }
        });
    }, 1000);
});

function cleanArray(actual) {
    // Remove false elements from an array
    
    var newArray = [];
    for (var i = 0; i < actual.length; i++) {
        if (actual[i]) {
            newArray.push(actual[i]);
        }
    }

    return newArray;
}

function getID() {
    return uuidv4();
}

function getPort() {
    // Get one of the available ports

    if(available_ports.length == 0) {
        return -1; //TODO: can we handle errors better?
    } else {
        return available_ports.shift();
    }
}

function returnPort(port) {
    // Return port to pool

    tcpPortUsed.waitUntilFree(port, 250, 10000)
        .then(function() {
            available_ports.push(port);
        }, function(err) {
            console.log('Error:', err.message);
            throw err;
        });
}

function startContainer(lang) {
    var id = getID();
    var port = getPort();
    //var timeout;

    //TODO: can we handle this any better?
    if(port == -1) {
        return;
    }

    var c = {
        id: id,
        port: port,
        used: false,
        ready: false,
        time_created: Date.now()
    };
    var index = containers[lang].push(c);

    const child = execFile('docker', ['run', '-d', '--rm', '-p',
            port+':8080', '--name', id, 'tester_'+lang],
            (error, stdout, stderr) => {

        if (error) {
            returnPort(port);
            var r = containers[lang].splice(index-1, 1);

            console.error('stderr', stderr);
            console.log(c);

            //var timeout = setTimeout(function() {
            setTimeout(function() {
                startContainer(lang);
            }, 50);

            return false;
        }

    // Wait for contianer to get ready
    var ping = waitForContainer(c);

    // Stop container if too many are running and container is not used
    //timeout = setTimeout(function() {
    setTimeout(function() {
        for(var i = 0; i < containers[lang].length; i++) {
            var c2 = containers[lang][i];

            if(c2.id == c.id && !c2.ready) {
                console.log(c2);
            }

            if(c2.id == c.id &&
            containers[lang].length > MIN_UNUSED_CONTAINERS_PER_LANG &&
            !c2.used || c2.id == c.id && !c2.ready) {
                //console.log('Docker\tIdle\t'+id+'\t'+port);
                clearInterval(ping);
                r = containers[lang].splice(i, 1);
                stopContainer(id);
            }
        }
    }, IDLE_TIMEOUT);

    return true;
    });
}

function waitForContainer(c) {
    // Marks a container as ready

    var ping = setInterval(function(){
        request
            .get('http://localhost:'+c.port+'/ping')
            .on('response', function(response) {

            if(response.statusCode == 200) {
                clearInterval(ping);
                c.ready = true;
            }
            }).on('error', function(error) {
                //TODO: Handle errors?
            });
    }, 250);

    return ping;
}

function stopContainer(id) {
    // Stop a container by id, returns whether or not it was removed
     
    const child = execFile('docker', ['stop', id], (error, stdout, stderr) => {
        if (error) {
            console.error('stderr', stderr);
            return false;
        } else {
            return true;
        }
    });
}

function getContainer(lang) {
    // Helper function to setup containers

    // Docker class hasn't been initiated yet
    if (containers[lang] === undefined) {
        throw new Error('docker is not initialized');
    }

    if(containers[lang].length == 0) {
        startContainer(lang);
        //TODO: shouldn't this return info for the new container?
        return null;
    }

    // Update existing containers and start new if less than max
    for(var i = 0; i < containers[lang].length; i++) {
        var c = containers[lang][i];

        if(!c.used && c.ready) {
            c.used = true;

            if(containers[lang].length < MAX_CONTAINERS_PER_LANG) {
                startContainer(lang);
            }

            return {id: c.id, port: c.port};
        }
    }

    return null;
}

function returnContainer(id) {
    // Destroys or recycles a container

    LANGS.forEach((lang) => {
        for(var i = 0; i < containers[lang].length; i++) {
            var c = containers[lang][i];

            // Container found recycle it
            if(c.id === id) {
                returnPort(c.port);
                containers[lang].splice(i, 1);

                // Start a new container to replace the one returned
                if(containers[lang].length < MAX_CONTAINERS_PER_LANG) {
                    startContainer(lang);
                }

                stopContainer(id);
            }
        }
    });
}

exports.getContainer = getContainer;
exports.returnContainer = returnContainer;
exports.LANGS = LANGS;
exports.containers = containers;
