'use strict';

var testerCom = require('../../lib/tester_communication');
var errors = require('../../lib/errors');
var request = require('supertest');
var auth = require('../../lib/authentication.js');
var logger = require('../../logger.js');

module.exports = function(router) {

    //get Tester's supported languages
    router.get('/languages', auth.validateJWTtoken, function(req, res) {
        testerCom.getTesterLanguages().then(function(languages) {
            res.setHeader('Content-Type', 'application/json');
            return res.send(languages);
        }).catch(err => {
            logger.error(err);
        });
    });

};
