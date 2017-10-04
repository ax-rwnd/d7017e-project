'use strict';

const express = require('express');
const execFile = require('child_process').execFile;
const uuidv4 = require('uuid/v4');
const request = require('request');
const http = require('http');


// Parse port from command line
var port
var args = process.argv.slice(2)
if (args.length < 1) {
    throw new Error("too few arguments")
} else {
    port = parseInt(args[0])
}
const HOST = '0.0.0.0';
const MAX_EXEC_TIME = 10000;

var ports = [16000, 16001, 16002, 16003];
var queue = [];

// App
const app = express();
app.get('/', (req, res) => {
  res.send(ports+'\n'+queue+'\n');
});

app.post('/', (req, res) => {
  var port = ports.shift();

  if(port !== undefined) {
    handleRequest(req, res, port);
  } else {
    queue.push([req, res]);
  }
});

app.get('/status', (req, res) => {
  res.send(ports+'\n'+queue+'\n');
});

app.listen(port, HOST);
console.log(`Running on http://${HOST}:${port}`);

function handleRequest(req, res, port) {
  const UUID = uuidv4();

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

          // Start docker container
          const child = execFile('docker', ['run', '-d', '--rm', '-p', port+':8080', '--name', UUID, 'tester_'+body['lang']], (error, stdout, stderr) => {
            if (error) {
              console.error('stderr', stderr);
              throw error;
            }
            //console.log('stdout', stdout);
          });

          // Terminate if stuff take too long to run inside container
          var max_exec_timeout = setTimeout(function () {
            stopContainer(UUID, port, res, 'Error: Timeout because request took too long.\n');
          }, MAX_EXEC_TIME);

          var callback = function() {
            // Send request to docker containers NodeJS instance when its ready and wait for response.
            request.post({
              url: 'http://localhost:'+port+'/',
              headers: {'Content-Type': 'application/json'},
              json: body
            }, function(error, response, body){
              if(error) {
                clearTimeout(max_exec_timeout);
                stopContainer(UUID, port, res, 'Could not contact NodeJS instance inside Docker container');
              } else {
                clearTimeout(max_exec_timeout);
                stopContainer(UUID, port, res, body['resp']);
              }
            });
          }

          // Wait until nodejs inside container is running
          //ping(port, callback);


          setTimeout(function () {
            request.post({
              url: 'http://localhost:'+port+'/',
              headers: {'Content-Type': 'application/json'},
              json: body
            }, function(error, response, body){
              if(error) {
                clearTimeout(max_exec_timeout);
                stopContainer(UUID, port, res, 'Could not contact NodeJS instance inside Docker container');
              } else {
                clearTimeout(max_exec_timeout);
                stopContainer(UUID, port, res, body['resp']);
              }
            });
          }, 3000);


      } catch (e) {
          console.log(e)
          res.statusCode = 400
          res.end()
      }
  });
}

function ping (port, callback) {
  var sent = false;
  var ping = setInterval(function(){
    http.get({
      host: 'http://localhost',
      port: port,
      path: '/ping'
    }, function(response) {
      response.on('data', function(d) {
        clearInterval(ping);
        if (!sent) {
          sent = !sent;
          callback();
        }
      });
    }).on('error', function(e) {
      console.error(e);
    });
  }, 250);
}

function stopContainer(UUID, port, res, resMessage) {
  const child = execFile('docker', ['stop', UUID], (error, stdout, stderr) => {
    if (error) {
      console.error('stderr', stderr);
      throw error;
    }
    //console.log('stdout', stdout);
    if(!res.headerSent) {
      res.send(resMessage);
    }
    giveBackResources(port);
  });

}

function giveBackResources(port) {
  console.log("giveBackResources for port "+port);
  var request = queue.shift();
  if(request !== undefined) {
    handleRequest(request[0], request[1], port);
  } else {
    ports.push(port)
  }
}
