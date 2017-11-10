'use strict';

var testerCom = require('../../lib/tester_communication');
var errors = require('../../lib/errors');
var request = require('supertest');
var auth = require('../../lib/authentication.js');

module.exports = function(router) {

    //get Tester's supported languages
    router.get('/languages', auth.validateJWTtoken, function(req, res) {
        testerCom.getTesterLanguages().then(function(languages) {
            return res.send(languages);
        }).catch(err => {
            console.log(err);
        });
    });

    // Test to send easy error messages
    router.get('/errortest', function (req, res) {
        res.status(errors.TEST.code).send(errors.TEST.msg);
    });

};
