var express = require('express');
var app = express();

app.get('/', function (req, res) {
   console.log("/ route retrieved")
   res.send('Hello World');
})

var server = app.listen(2223, function () {
   var host = server.address().address
   var port = server.address().port
   
   console.log("Example app listening at http://%s:%s", host, port)
})
