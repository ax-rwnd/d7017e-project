/* jshint node: true */
'use strict';

// Configure and define winston logger
var logger = require('./log.js');
var express = require('express');
var bodyParser = require('body-parser');
var config = require('config');
var manager = require('./manager.js');
var https = require('https');
var fs = require('fs');
var languages = require('./config/languages');

const HOST = '0.0.0.0';
var port;

// Parse port from command line
const args = process.argv.slice(2);
if (args.length < 1) {
    throw new Error("too few arguments");
} else {
    port = parseInt(args[0]);
}

function formatQueues(langs, queues) {
	// Format the queues

	var s = '';
	langs.forEach(function(lang){
		s += 	`<tr>
					<td>${lang}</td>
					<td>${manager.queue[lang].length}</td>
				</tr>`;
	});

	return s;
}

function formatLanguages(langs, containers) {
    // Format the containers for each language into strings

    var formatted = '';
    langs.forEach((lang) => {
        containers[lang].forEach((container) => {
            formatted += formatContainer(lang, container);
        });
    });

    return formatted;
}

function formatContainer(lang, container) {
    // Format the status of a container into a string

    var time_alive = (Date.now()-container.time_created);
    var t = new Date(null);
	t.setSeconds(time_alive/1000); // specify value for SECONDS here
	var aliveString = t.toISOString().substr(11, 8);

    const s = `
        <tr>
            <td>${lang}</td>
            <td>${container.id}</td>
            <td>${container.port}</td>
            <td>${container.used}</td>
            <td>${container.ready}</td>
            <td>${new Date(container.time_created).toString()}</td>
            <td>${aliveString}</td>
        </tr>
    `;

    return s;
}

var app = express();
//app.use(bodyParser.json({ limit: '5mb' }));

app.get('/', (req, res) => {
	// Presents the user with a stat page that details which containers
	// are running.

    const s = `
        <h1>Tester</h1>
            <div style="float: left; width: 70%;">
            <h2>Containers</h2>
            <table style="border-spacing: 20px 0;">
        <tr>
            <th>Language</th>
            <th>ID</th>
            <th>Port</th>
            <th>Used</th>
            <th>Ready</th>
            <th>Time created</th>
            <th>Time alive</th>
        </tr>

        ${formatLanguages(config.get('docker.LANGS'), manager.containers)}

        </table>
        </div>

        <div style="float: right; width: 30%;">
            <h2>Queue</h2>
            <table>
            <tr>
                <th>Language</th>
                <th>#</th>
            </tr>

			${formatQueues(config.get('docker.LANGS'), manager.queue)}
            </table>
        </div>
    `;

    res.send(s);
});

app.post('/', (req, res) => {
    manager.newRequest(req, res);
});

app.get('/languages', (req, res) => {
    res.json({languages: languages.languages});
});

/**
 * Create HTTPS server.
 */

var key = fs.readFileSync('encryption/private.key');
var cert = fs.readFileSync('encryption/server.crt');
var options = {
    key: key,
    cert: cert
};

var server = https.createServer(options, app);
server.listen({
    port: port,
    host: HOST
});

var exitMessage = false;
process.on('SIGINT', function() {
    // Graceful shutdown

    if(!exitMessage) {
        exitMessage = true;

        logger.info('Stopped express. No more requests can be made.');
        server.close();

        logger.info("Empty container queue...");
        manager.emptyQueue();

        logger.info('Waiting for half-started containers to prevent dangling containers...');


        var cb = function() {
            logger.info('Containers stopped. Good bye');
            process.exit();
        };
        setTimeout(function () {
            logger.info('Stopping all running containers... Shutting down shortly...');
            manager.stopContainers(cb);
        }, 5000);
    }
});

logger.info(`Running on ${HOST}:${port}`);
