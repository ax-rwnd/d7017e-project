'use strict';

const express = require('express');
const execFile = require('child_process').execFile;
const uuidv4 = require('uuid/v4');
const request = require('request');
const http = require('http');

// Constants
const PORT = 8080;
const HOST = '0.0.0.0';
const MAX_EXEC_TIME = 6000;

var ports = [16000, 16001, 16002, 16003];
var queue = [];

// App
const app = express();
app.get('/', (req, res) => {
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

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);

function handleRequest(req, res, port) {
  const UUID = uuidv4();

  var start = new Date().getTime()

  console.log("time 0: " + (new Date().getTime() - start));

  // Start docker container
  const child = execFile('docker', ['run', '-d', '--rm', '-p', port+':8080', '--name', UUID, 'tester_python3'], (error, stdout, stderr) => {
    if (error) {
      console.error('stderr', stderr);
      throw error;
    }
    console.log("docker running: " + (new Date().getTime() - start));
    //console.log('stdout', stdout);
  });

  // Terminate if stuff take too long to run inside container
  var max_exec_timeout = setTimeout(function () {
    stopContainer(UUID, port, res, 'Error: Timeout because request took too long.\n');
  }, MAX_EXEC_TIME);


  // Wait until nodejs inside container is running

  console.log("ping start: " + (new Date().getTime() - start));

  var data = {"key": "value"}
  var callback = function() {

    console.log("ping done: " + (new Date().getTime() - start));
    request.post(
      {url: 'http://localhost:'+port, form: data},
      function(error, response, body){
        if (!error && response.statusCode == 200) {
          clearTimeout(max_exec_timeout);
          stopContainer(UUID, port, res, body);
        } else {
          console.log("error: " + error);
          console.log("response: " + response);
          console.log("body: " + body);
        }
      }
    );
  }
  ping(port, callback);


  /*var sent = false;
  var ping = setInterval(function(){
    http.get({
      host: 'localhost',
      port: port,
      path: '/'
    }, function(response) {
      response.on('data', function(d) {
        clearInterval(ping);
        if (!sent) {
          sent = !sent;
          request.post(
            {url: 'http://localhost:'+port, form: {"key":'value'}},
            function(error, response, body){
              if (!error && response.statusCode == 200) {
                clearTimeout(max_exec_timeout);
                stopContainer(UUID, port, res, body);
              } else {
                console.log("error: " + error);
                console.log("response: " + response);
                console.log("body: " + body);
              }
            }
          );
        }
      });
    }).on('error', function(e) {
      //console.error(e);
    });
  }, 25);*/
}

function ping (port, callback) {
  var sent = false;
  var ping = setInterval(function(){
    http.get({
      host: 'localhost',
      port: port,
      path: '/'
    }, function(response) {
      response.on('data', function(d) {
        clearInterval(ping);
        if (!sent) {
          sent = !sent;
          callback();
        }
      });
    }).on('error', function(e) {
      //console.error(e);
    });
  }, 25);
}

function stopContainer(UUID, port, res, resMessage) {
  const child = execFile('docker', ['stop', UUID], (error, stdout, stderr) => {
    if (error) {
      console.error('stderr', stderr);
      throw error;
    }
    //console.log('stdout', stdout);
    res.send(resMessage);
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
