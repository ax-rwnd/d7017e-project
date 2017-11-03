/* jshint node: true */
'use strict';

var logger = require('winston');
const request = require('request');
const docker = require('./docker.js');
const container_queue = require('./container_queue.js');
var config = require('config');

container_queue.init(docker);
docker.init();

function newRequest(req, res) {
    // Handle request from network interface

    var chunks = [];
    req.on('error', (err) => {
        logger.error(err);
        res.sendStatus(500);
    }).on('data', (chunk) => {
        chunks.push(chunk);
    }).on('end', () => {
        //Convert the array of Buffers to a javascript object
        let body;
        try {
            body = JSON.parse(Buffer.concat(chunks).toString());
        } catch (e) {
            res.sendStatus(400);
            return;
        }


        if(!isValidInput(body)) {
            logger.warn('Not vaild input data');
            res.sendStatus(400);
            return;
        }

        // Requests of that lang already queued
        // Put this new request last in queue
        if(container_queue.getLengthForLanguage(body.lang) > 0) {
            container_queue.queueRequest(body, res);
            return;
        }

        // If there are no available containers add request to queue
        // otherwise, handle the request normally
        try {
            var container = docker.getContainer(body.lang);
            handleRequest(container, body, res);
        } catch (e) {
            container_queue.queueRequest(body, res);
        }
    });
}

function handleRequest(container, body, res) {

    // Send Request Timeout if container takes too long to execute
    var timeout = setTimeout(function() {
        if(!res.headersSent) {
            docker.returnContainer(container.id);
            res.sendStatus(408);
        }
    }, config.get('manager.MAX_EXECUTE_TIME'));

    // Forward request to node on the container
    request.post({
        url: 'http://localhost:'+container.port+'/',
        headers: {'Content-Type': 'application/json'},
        json: body
    }, function(error, response, body){
        if(error) {
            if(!res.headersSent) {
                docker.returnContainer(container.id);
                res.sendStatus(500);
            }
        } else {
            docker.returnContainer(container.id);
            if (body === undefined && !res.headersSent) {
                logger.warn('Request returned undefined');
                res.sendStatus(500);
            } else if(!res.headersSent) {
                res.send(JSON.stringify(body.resp));
            }
        }
    });
}

function isValidInput(input) {
    var valid = true;

    // lang parameter has to be in input data
    if (!('lang' in input)) {
        logger.info('lang parameter has to be in input data');
        valid = false;
    } else {
        // Check so langauge actually is supported by the system
        if('lang' in input &&
                config.get('docker.LANGS').indexOf(input.lang) == -1) {
            logger.info('Langauge actually is not supported by the system.',
                'Got:', input.lang);
            valid = false;
        }
    }

    // code parameter has to be in input data
    if (!('code' in input)) {
        logger.info('code parameter has to be in input data');
        valid = false;
    }

    // tests parameter has to be in input data
    if (!('tests' in input)) {
        logger.info('tests parameter has to be in input data');
        valid = false;
    }

    return valid;
}



exports.handleRequest = handleRequest;
exports.newRequest = newRequest;
exports.queue = container_queue.queue;
exports.containers = docker.containers;

exports.stopContainers = docker.stopContainers;
exports.emptyQueue = container_queue.emptyQueue;
