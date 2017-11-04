'use strict';

var request = require('request');
var features = require('../../lib/queries/features');
var errors = require('../../lib/errors.js');
var auth = require('../../lib/authentication.js');

module.exports = function(router) {

    router.get('/:course_id/assignments', auth.validateJWTtoken, function (req, res, next) {
        var course_id = req.params.course_id;
        res.send("/courses/" + course_id + "/assignments GET Endpoint");
    });

    // /api/features/badge
    router.post('/badge', function (req, res) {
        features.createBadge(req.body, res);
    });
};
