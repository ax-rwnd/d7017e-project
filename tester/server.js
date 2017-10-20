/* jshint node: true */
'use strict';

var express = require('express');
var execFile = require('child_process').execFile;
var uuidv4 = require('uuid/v4');
var http = require('http');

var config = require('config');
var manager = require('./manager.js');

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

const app = express();
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
var server = app.listen(port, HOST);

var exitMessage = false;
process.on('SIGINT', function() {
    // Graceful shutdown

    if(!exitMessage) {
        exitMessage = true;

        server.close();

        console.log("Empty container queue...");
        manager.emptyQueue();


        console.log('Stopping all running containers... Shutting down shortly...');
        var cb = function() {
            console.log('Containers stopped. Good bye');
            process.exit();
        };
        manager.stopContainers(cb);
    }
});


console.log(`Running on http://${HOST}:${port}`);
