'use strict';

const express = require('express');
const execFile = require('child_process').execFile;
const uuidv4 = require('uuid/v4');
const http = require('http');

const manager = require('./manager.js')

// Parse port from command line
var port
var args = process.argv.slice(2)
if (args.length < 1) {
    throw new Error("too few arguments")
} else {
    port = parseInt(args[0])
}
const HOST = '0.0.0.0';

// App
const app = express();
app.get('/', (req, res) => {

  var now = Date.now()

  var s = ''

  s += '<h1>Tester</h1>'

  s += '<div style="float: left; width: 70%;">'
  s += '<h2>Containers</h2>'
  s += '<table style="border-spacing: 20px 0;">'
  s += '<tr><th>Language</th><th>ID</th><th>Port</th><th>Used</th>'+
    '<th>Ready</th><th>Time created</th><th>Time alive</th></tr>'
  manager.LANGS.forEach(function(lang) {
    for(var i = 0; i < manager.containers[lang].length; i++) {
      var container = manager.containers[lang][i]

      var time_alive = (now-container['time_created'])/1000

      var days    = Math.floor(time_alive/(60*60*24))
      time_alive  = time_alive%(60*60*24)
      var hours   = Math.floor(time_alive/(60*60))
      time_alive  = time_alive%(60*60)
      var minutes = Math.floor(time_alive/(60))
      time_alive  = time_alive%(60)
      var seconds = Math.floor(time_alive)

      time_alive = ""
      if(days > 0) {
        time_alive += days+"d"
      }
      if(hours > 0) {
        time_alive += hours+"h"
      }
      if(minutes > 0) {
        time_alive += minutes+"m"
      }
      time_alive += seconds+"s"


      if(time_alive < 60) {
        time_alive = Math.floor(time_alive) + "s"
      } else if(time_alive > 60) {
        time_alive = Math.floor(time_alive/60) + "m"
      } else if(time_alive > 60*60) {
        time_alive = Math.floor(time_alive/(60*60)) + "h"
      } else if(time_alive > 60*60*24) {
        time_alive = Math.floor(time_alive/(60*60*24)) + "d"
      }

      s += '<tr><td>'+lang+'</td><td>'+container['id']+'</td>'+
        '<td>'+container['port']+'</td><td>'+container['used']+'</td>'+
        '<td>'+container['ready']+'</td>'+
        '<td>'+new Date(container['time_created']).toString()+'</td>'+
        '<td>'+time_alive+'</td></tr>'
    }
  })
  s += '</table>'
  s += '</div>'

  s += '<div style="float: right; width: 30%;">'
  s += '<h2>Queue</h2>'
  s += '<table>'
  s += '<tr><th>Language</th><th>#</th></tr>'
  manager.LANGS.forEach(function(lang) {
    s += '<tr><td>'+lang+'</td><td>'+manager.queue[lang].length+'</td></tr>'
  })
  s += '</table>'
  s += '</div>'

  res.send(s);
});

app.post('/', (req, res) => {
  manager.newRequest(req, res);
});

app.listen(port, HOST);
console.log(`Running on http://${HOST}:${port}`);
