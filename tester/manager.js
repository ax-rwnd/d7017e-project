/* jshint node: true */
'use strict';

const request = require('request');
const docker = require('./docker.js');
const MAX_EXECUTE_TIME = 10000;

var queue = {};

// Construct queues for each language
docker.LANGS.forEach(function(lang) {
    queue[lang] = [];
});

setInterval(function(){
    docker.LANGS.forEach(function(lang) {
        if(queue[lang].length > 0) {
            var container = docker.getContainer(lang);

            while(container != null && queue[lang].length > 0) {
                var queueItem = queue[lang].shift();
                handleRequest(container, queueItem[0], queueItem[1]);

                if(queue[lang].length > 0) {
                    container = docker.getContainer(lang);
                }
            }
        }//container;
    });
}, 250);

function newRequest(req, res) {
    // Handle request from network interface

    var chunks = [];
    req.on('error', (err) => {
        console.error(err);
        res.sendStatus(400);
    }).on('data', (chunk) => {
        chunks.push(chunk);
    }).on('end', () => {
        try {
            //Convert the array of Buffers to a javascript object
            var body = JSON.parse(Buffer.concat(chunks).toString());

            // Fail softly if the language isn't supported
            if(docker.LANGS.indexOf(body.lang) == -1) {
                console.log('Not a vaild language');
                res.sendStatus(400);
                return;
            }

            // Requests of that lang already queued
            // Put this new request last in queue
            if(queue[body.lang].length > 0) {
                queue[body.lang].push([body, res]);
                return;
            }

            // If there are no available containers add request to queue
            // otherwise, handle the request normally
            var container = docker.getContainer(body.lang);
            if(container == null) {
                queue[body.lang].push([body, res]);
            } else {
                handleRequest(container, body, res);
            }
        } catch (e) {
            console.log(e);
            res.sendStatus(400);
        }
    });
}

function handleRequest(container, body, res) {
    // Start a container to run the test

    // Wait for container to boot, or fail softly
    var timeout = setTimeout(function() {
        if(!res.headersSent) {
            //console.log('Manager\t'+container.id+'\tRequest took too long')
            docker.returnContainer(container.id);
            res.sendStatus(408);
        }
    }, MAX_EXECUTE_TIME);

    // Forward request to node on the container
    request.post({
        url: 'http://localhost:'+container.port+'/',
        headers: {'Content-Type': 'application/json'},
        json: body
    }, function(error, response, body){
        if(error) {
            if(!res.headersSent) {
                //console.log('Manager\t'+container.id+'\tRequest responded with error');
                docker.returnContainer(container.id);
                res.sendStatus(500);
            }
        } else {
            if (body === undefined) {
                docker.returnContainer(container.id);
                res.sendStatus(400);
            } else if(!res.headersSent) {
                //console.log('Manager\t'+container.id+'\tRequest done');
                docker.returnContainer(container.id);
                res.send(JSON.stringify(body.resp));
            }
        }
    });
}

exports.newRequest = newRequest;
exports.queue = queue;
exports.LANGS = docker.LANGS;
exports.containers = docker.containers;
