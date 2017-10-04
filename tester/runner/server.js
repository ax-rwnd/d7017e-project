#!/usr/bin/env node

var http = require('http');
const test_runner = require('./test-runner.js')

// Parse port from command line
var port
var args = process.argv.slice(2)
if (args.length < 1) {
    throw new Error("too few arguments")
} else {
    port = parseInt(args[0])
}

//consider using express

http.createServer(function (req, res) {
    const { headers, method, url } = req

    var body = []
    req.on('error', (err) => {
        console.error(err)
        res.statusCode = 400
        res.end()
    }).on('data', (chunk) => {
        body.push(chunk)
    }).on('end', () => {
        try {
            //Convert the array of Buffers to a javascript object
            body = JSON.parse(Buffer.concat(body).toString())
            let response = test_runner.runTests(body).then( (resp) => {
                const resBody = { headers, method, url, resp }
                res.writeHead(200, {'Content-Type': 'application/json'})
                res.write(JSON.stringify(resBody))
                res.end()
            })
        } catch (e) {
            console.log(e)
            res.statusCode = 400
            res.end()
        }
    });
}).listen(port)
