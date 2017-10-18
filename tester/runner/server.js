/* jshint node: true */
'use strict';

var http = require('http');
var test_runner = require('./test-runner.js');

// Parse port from command line
var port;
var args = process.argv.slice(2);
if (args.length < 1) {
    throw new Error("too few arguments");
} else {
    port = parseInt(args[0]);
}

//consider using express

function handleTest(req, res) {
    const { headers, method, url } = req;

    var body = [];
    req.on('error', (err) => {
        console.error(err);
        res.statusCode = 400;
        res.end();
    }).on('data', (chunk) => {
        body.push(chunk);
    }).on('end', () => {
        try {
            //Convert the array of Buffers to a javascript object
            body = JSON.parse(Buffer.concat(body).toString());
            test_runner.runTests(body)
                .then( (resp) => {
                    const resBody = { headers, method, url, resp };
                    res.writeHead(200, {'Content-Type': 'application/json'});
                    res.write(JSON.stringify(resBody));
                    res.end();
                })
                .catch((e) => {
                    console.log(e);
                    //TODO: handle errors separately
                    res.statusCode = 500;
                    res.end();
                });
        } catch (e) {
            console.log(e);
            res.statusCode = 400;
            res.end();
        }
    });
}

function handlePing(req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end();
}

function handleNotFound(req, res) {
    res.writeHead(404);
    res.end();
}

exports.server = http.createServer(function (req, res) {
    const { headers, method, url } = req;

    if (url === "/") {
        try {
            handleTest(req, res);
        } catch (e) {
            console.log(e);
        }
    } else if (url === "/ping") {
        try {
            handlePing(req, res);
        } catch (e) {
            console.log(e);
        }
    } else {
       handleNotFound(req, res); 
    }
}).listen(port);
