'use strict';

var request = require('request');
var features = require('../../lib/queries/features');
var errors = require('../../lib/errors.js');
var auth = require('../../lib/authentication.js');
var logger = require('../../lib/logger.js');

module.exports = function(router) {

    router.post('/badge', function (req, res, next) {
        features.createBadge(req.body).then(function(badge) {
            return res.send(badge);
        }).catch(next);
    });

    router.get('/badge/:badge_id', function (req, res, next) {
        features.getBadge(req.params.badge_id).then(function(badge) {
            return res.send(badge);
        }).catch(next);
    });

    router.put('/badge/:badge_id', function(req, res, next) {
        features.updateBadge(req.params.badge_id, req.body).then(function(badge) {
            return res.send(badge);
        }).catch(next);
    });

    router.delete('/badge/:badge_id', function(req, res, next) {
        // TODO
        return res.sendStatus(501);
    });

    router.get('/features/:course_id', function(req, res, next) {
        features.getFeaturesOfCourse(req.params.course_id).then(function(progress) {
            return res.send(progress);
        }).catch(next);
    });

    router.get('/feature/:course_id/me', function(req, res, next) {
        features.getFeatureOfUserID(req.params.course_id, req.user.id).then(function(progress) {
            return res.send(progress);
        }).catch(next);
    });
};
