const uuidv4 = require('uuid/v4');
const execFile = require('child_process').execFile;
const http = require('http');
const request = require('request');
var locks = require('locks');
var tcpPortUsed = require('tcp-port-used');

const LANGS = ['python27', 'python3', 'java']
const MIN_UNUSED_CONTAINERS_PER_LANG = 1
const MAX_CONTAINERS_PER_LANG = 6
const MAX_GLOABAL_CONTAINERS = 8
const START_PORT = 16000
const IDLE_TIMEOUT = 10000

var mutex = locks.createMutex();
var available_ports = []
var containers = {}

// Remove old docker images running
const child = execFile('docker', ['ps', '-q'], (error, stdout, stderr) => {
  if (error) {
    console.error('stderr', stderr);
    throw error;
  }
  cleanArray(stdout.split('\n')).forEach(function(id) {
    const child = execFile('docker', ['stop', id], (error, stdout, stderr) => {
      if (error) {
        console.error('stderr', stderr);
        throw error;
      }
    });
  })

  setTimeout(function () {
    for (i = 0; i < MAX_GLOABAL_CONTAINERS; i++) {
       available_ports.push(START_PORT+i);
    }

    LANGS.forEach(function(lang) {
      containers[lang] = [];

      for(i = 0; i < MIN_UNUSED_CONTAINERS_PER_LANG; i++) {
        startContainer(lang);
      }
    });
  }, 1000);
});
function cleanArray(actual) {
  var newArray = new Array();
  for (var i = 0; i < actual.length; i++) {
    if (actual[i]) {
      newArray.push(actual[i]);
    }
  }
  return newArray;
}
// END

function getID() {
  return uuidv4();
}

function getPort() {
  if(available_ports.length == 0) {
    return -1;
  } else {
    return available_ports.shift()
  }
}

function returnPort(port) {
  tcpPortUsed.waitUntilFree(port, 250, 10000)
  .then(function() {
      available_ports.push(port)
  }, function(err) {
      console.log('Error:', err.message);
      throw error;
  });
}

function startContainer(lang) {
  var id = getID();
  var port = getPort();

  if(port == -1) {
    return
  }

  var c = {id: id, port: port, used: false, ready: false, time_created: Date.now()};
  index = containers[lang].push(c);

  const child = execFile('docker', ['run', '-d', '--rm', '-p', port+':8080',
      '--name', id, 'tester_'+lang], (error, stdout, stderr) => {
    if (error) {
      returnPort(port)
      r = containers[lang].splice(index-1, 1);

      console.error('stderr', stderr);

      console.log(c);


      var timeout = setTimeout(function() {
        startContainer(lang)
      }, 50)
      //throw error;

      return false;
    }

    //console.log('Docker\tStart\t'+id+'\t'+port);

    // Wait for contianer to get ready
    var ping = waitForContainer(c);

    // Stop container if too many are running and container is not used
    var timeout = setTimeout(function() {
      for(i = 0; i < containers[lang].length; i++) {
        var c2 = containers[lang][i];

        if(c2['id'] == c['id'] && !c2['ready']) {
            console.log(c2);
        }

        if(c2['id'] == c['id'] &&
            containers[lang].length > MIN_UNUSED_CONTAINERS_PER_LANG
            && !c2['used'] || c2['id'] == c['id'] && !c2['ready']) {
          //console.log('Docker\tIdle\t'+id+'\t'+port);
          clearInterval(ping)
          r = containers[lang].splice(i, 1);
          stopContainer(id)
        }
      }
    }, IDLE_TIMEOUT)

    return true;
  });
}

function waitForContainer(c) {
  var sent = false;
  var ping = setInterval(function(){
    request
    .get('http://localhost:'+c['port']+'/ping')
    .on('response', function(response) {
      if(response.statusCode == 200) {
        //console.log('Docker\tReady\t'+c['id']+'\t'+c['port']);

        clearInterval(ping);
        c['ready'] = true;
      }
    }).on('error', function(error) {
    })
  }, 250);

  return ping
}

function stopContainer(id) {
  const child = execFile('docker', ['stop', id], (error, stdout, stderr) => {
    if (error) {
      console.error('stderr', stderr);
      return false;
    }
    return true;
  });
}

function getContainer(lang) {
  // Docker class hasn't been initiated yet
  if (containers[lang] === undefined) {
    return null
  }

  if(containers[lang].length == 0) {
    startContainer(lang)
    return null
  }
  for(i = 0; i < containers[lang].length; i++) {
    var c = containers[lang][i]
    if(!c['used'] && c['ready']) {
      c['used'] = true;

      //console.log('Docker\tUse\t'+c['id']+'\t'+c['port']);

      if(containers[lang].length < MAX_CONTAINERS_PER_LANG) {
        startContainer(lang)
      }
      return {id: c['id'], port: c['port']};
    }
  }

  return null;
}

function returnContainer(id) {
  LANGS.forEach(function(lang) {
    for(i = 0; i < containers[lang].length; i++) {

      var c = containers[lang][i];

      if(c['id']== id) {
        //console.log('Docker\tStop\t'+id+'\t'+c['port']);

        returnPort(c['port'])
        containers[lang].splice(i, 1);

        if(containers[lang].length < MAX_CONTAINERS_PER_LANG) {
          startContainer(lang)
        }

        stopContainer(id)
      }
    }
  })
}

exports.getContainer = getContainer
exports.returnContainer = returnContainer
exports.LANGS = LANGS
exports.containers = containers
