'use strict';

var request = require('request');
var features = require('../../lib/queries/features');
var errors = require('../../lib/errors.js');
var auth = require('../../lib/authentication.js');
var logger = require('../../logger.js');

module.exports = function(router) {

    router.get('/:course_id/assignments', auth.validateJWTtoken, function (req, res, next) {
        var course_id = req.params.course_id;
        res.send("/courses/" + course_id + "/assignments GET Endpoint");
    });

    router.post('/badge', function (req, res) {
        features.createBadge(req.body).then(function() {
            res.sendStatus(200);
        }).catch(function(err) {
            logger.error(err);
            res.sendStatus(500);
        });
    });

    router.get('/badge/:badge_id', function (req, res) {
        features.getBadge(req.params.badge_id).then(function(badge) {
            res.send(badge);
        });
    });

    router.put('/badge/:badge_id', function(req, res) {
        features.updateBadge(req.params.badge_id, req.body).then(function() {
            res.sendStatus(200);
        }).catch(function(err) {
            logger.error(err);
            res.sendStatus(500);
        });
    });

    router.post('/coursebadge', function(req, res) {
        features.createCourseBadge(req.body).then(function() {
            res.sendStatus(200);
        }).catch(function(err) {
            logger.error(err);
            res.sendStatus(500);
        });
    });

    router.get('/coursebadge/:coursebadge_id', function(req, res) {
        features.getCourseBadge(req.params.coursebadge_id).then(function(courseBadge) {
            res.send(courseBadge);
        });
    });

    router.put('/coursebadge/:coursebadge_id', function(req, res) {
        features.updateCourseBadge(req.params.coursebadge_id, req.body).then(function() {
            res.sendStatus(200);
        }).catch(function(err) {
            logger.error(err);
            res.sendStatus(500);
        });
    });
};
