'use strict';

var request = require('request');
var queries = require('../../lib/queries/queries');
var errors = require('../../lib/errors.js');
var auth = require('express-jwt-token');

module.exports = function(router) {

    router.get('/coursestest', function(req, res) {
        res.send("/coursestest GET Endpoint");
    });

};
