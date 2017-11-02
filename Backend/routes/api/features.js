'use strict';

var request = require('request');
var features = require('../../lib/queries/features');
var errors = require('../../lib/errors.js');
var auth = require('express-jwt-token');
var check_access = require('../../lib/access.js');

module.exports = function(router) {

    router.get('/:course_id/assignments', auth.jwtAuthProtected, function (req, res) {
        var course_id = req.params.course_id;
        res.send("/courses/" + course_id + "/assignments GET Endpoint");
    });

    // /api/features/badge
    router.post('/badge', function (req, res) {
        features.createBadge(req.body, res);
    });
};
