'use strict';

var request = require('request');
var features = require('../../lib/queries/features');
var errors = require('../../lib/errors.js');
var auth = require('../../lib/authentication.js');
var logger = require('../../logger.js');

module.exports = function(router) {

    router.post('/badge', auth.validateJWTtoken, function (req, res) {
        features.createBadge(req.body).then(function() {
            res.sendStatus(200);
        }).catch(function(err) {
            logger.error(err);
            res.sendStatus(500);
        });
    });

    router.get('/badge/:badge_id', auth.validateJWTtoken, function (req, res) {
        features.getBadge(req.params.badge_id).then(function(badge) {
            res.send(badge);
        });
    });

    router.put('/badge/:badge_id', auth.validateJWTtoken, function(req, res) {
        features.updateBadge(req.params.badge_id, req.body).then(function() {
            res.sendStatus(200);
        }).catch(function(err) {
            logger.error(err);
            res.sendStatus(500);
        });
    });

    router.post('/coursebadge', auth.validateJWTtoken, function(req, res) {
        features.createCourseBadge(req.body).then(function() {
            res.sendStatus(200);
        }).catch(function(err) {
            logger.error(err);
            res.sendStatus(500);
        });
    });

    router.get('/coursebadge/:coursebadge_id', auth.validateJWTtoken, function(req, res) {
        features.getCourseBadge(req.params.coursebadge_id).then(function(courseBadge) {
            res.send(courseBadge);
        });
    });

    router.put('/coursebadge/:coursebadge_id', auth.validateJWTtoken, function(req, res) {
        features.updateCourseBadge(req.params.coursebadge_id, req.body).then(function() {
            res.sendStatus(200);
        }).catch(function(err) {
            logger.error(err);
            res.sendStatus(500);
        });
    });

    router.get('/features/:course_id', auth.validateJWTtoken, function(req, res) {
        features.getFeaturesOfCourse(req.params.course_id).then(function(progress) {
            res.send(progress);
        });
    });

    router.get('/feature/:course_id/:user_id', auth.validateJWTtoken, function(req, res) {
        features.getFeatureOfUserID(req.params.course_id, req.params.user_id).then(function(progress) {
            res.send(progress);
        });
    });
};
