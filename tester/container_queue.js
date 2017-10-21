/* jshint node: true */
'use strict';

var config = require('config');
const manager = require('./manager.js');

var docker; // Is set in init
var queue = {};

// Construct queues for each language
config.docker.LANGS.forEach(function(lang) {
    queue[lang] = [];
});

function init(d) {
    docker = d;

    // Handle queued up requests
    setInterval(function(){
        config.docker.LANGS.forEach(function(lang) {
            try {
                while(queue[lang].length > 0) {
                    var container = docker.getContainer(lang);
                    var queueItem = queue[lang].shift(); // return [body, res]
                    manager.handleRequest(container, queueItem[0], queueItem[1]);
                }
            } catch (e) {
                // Uncomment if you want wall of text. Mini matrix!
                //console.error(e);
            }
        });
    }, 250);
}

function queueRequest(body, res) {
    if(getTotalLength() < config.manager.MAX_QUEUE_SIZE) {
        queue[body.lang].push([body, res]);
    } else {
        res.sendStatus(503);
    }
}

function getTotalLength() {
    var totalLength = 0;
    config.docker.LANGS.forEach(function(lang) {
        totalLength += getLengthForLanguage(lang);
    });
    return totalLength;
}

function getLengthForLanguage(lang) {
    return queue[lang].length;
}

function emptyQueue() {
    config.docker.LANGS.forEach(function(lang) {
        queue[lang] = [];
    });
}


exports.init = init;
exports.queueRequest = queueRequest;
exports.getLengthForLanguage = getLengthForLanguage;
exports.emptyQueue = emptyQueue;
exports.queue = queue;
