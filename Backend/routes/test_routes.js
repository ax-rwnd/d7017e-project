'use strict';
/* build testing-routes here. */

var Assignment = require('../models/schemas').Assignment;
var Test = require('../models/schemas').Test;
var request = require('request');
var queries = require('../lib/queries/queries');
var testerCom = require('../lib/tester_communication');
var errors = require('../lib/errors');

const TESTER_IP = 'http://130.240.5.118:9100';

module.exports = function(router) {

    //Retrieve tests from db and send them to tester
    router.post('/test/1', function(req, res) {

        var lang = req.body.lang;
        var code = req.body.code;
        var assignment_id = req.body.assignment_id;

        testerCom.validateCode(lang, code, assignment_id, res);
    });

    router.get('/test/2', function(req, res) {
        queries.getTestsFromAssignment('59e4cb34d679e102ff66b866', function(tests) {
            console.log("/ route retrieved");
            console.log(tests);
            res.send('Hello World');
        });
    });   

    // Test to send easy error messages
    router.get('/errortest', function (req, res) {
        res.status(errors.TEST.code).send(errors.TEST.msg);
    });

};
