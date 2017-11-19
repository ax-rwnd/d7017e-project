'use strict';

var request = require('request');
var features = require('../../lib/queries/features');
var errors = require('../../lib/errors.js');
var auth = require('../../lib/authentication.js');
var logger = require('../../lib/logger.js');

module.exports = function(router) {

    router.post('/badge', auth.validateJWTtoken, function (req, res, next) {
        features.createBadge(req.body).then(function() {
            res.sendStatus(200);
        }).catch(next);
    });

    router.get('/badge/:badge_id', auth.validateJWTtoken, function (req, res, next) {
        features.getBadge(req.params.badge_id).then(function(badge) {
            res.send(badge);
        }).catch(next);
    });

    router.put('/badge/:badge_id', auth.validateJWTtoken, function(req, res, next) {
        features.updateBadge(req.params.badge_id, req.body).then(function() {
            res.sendStatus(200);
        }).catch(next);
    });

    router.post('/coursebadge', auth.validateJWTtoken, function(req, res, next) {
        features.createCourseBadge(req.body).then(function() {
            res.sendStatus(200);
        }).catch(next);
    });

    router.get('/coursebadge/:coursebadge_id', auth.validateJWTtoken, function(req, res, next) {
        features.getCourseBadge(req.params.coursebadge_id).then(function(courseBadge) {
            res.send(courseBadge);
        }).catch(next);
    });

    router.put('/coursebadge/:coursebadge_id', auth.validateJWTtoken, function(req, res, next) {
        features.updateCourseBadge(req.params.coursebadge_id, req.body).then(function() {
            res.sendStatus(200);
        }).catch(next);
    });

    router.get('/features/:course_id', auth.validateJWTtoken, function(req, res, next) {
        features.getFeaturesOfCourse(req.params.course_id).then(function(progress) {
            res.send(progress);
        }).catch(next);
    });

    router.get('/feature/:course_id/:user_id', auth.validateJWTtoken, function(req, res, next) {
        features.getFeatureOfUserID(req.params.course_id, req.params.user_id).then(function(progress) {
            res.send(progress);
        }).catch(next);
    });
};
