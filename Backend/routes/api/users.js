'use strict';

var request = require('request');
var queries = require('../../lib/queries/queries');
var errors = require('../../lib/errors.js');
var auth = require('express-jwt-token');
var check_access = require('../../lib/access.js');

module.exports = function (router) {

    router.get('/', auth.jwtAuthProtected, check_access, function (req, res) {
        var ids = req.query.ids;
        if (!ids) {
            res.sendStatus(404);
            return;
        }
        res.send("/users?ids=" + ids + " GET Endpoint");
    });


    router.get('/me', auth.jwtAuthProtected, check_access, function (req, res, next) {
        // queries.getUser(req.user._id, "username email courses admin").then(function (user) {
        //     res.json(user);
        // })
        // .catch(function(err) {
        //     next(err);
        // });

        res.json(req.user);
    });

    router.get('/:user_id', auth.jwtAuthProtected, check_access, function (req, res) {
        var user_id = req.params.user_id;
        queries.getUser(user_id, "username email").then(function (user) {
            return res.json(user);
        })
        .catch(function (err) {
            next(err)
        });
    });

    router.delete('/:user_id', auth.jwtAuthProtected, check_access, function (req, res) {
        var user_id = req.params.user_id;
        res.send("/users/" + user_id + " DELETE Endpoint");
    });

    router.post('/register', auth.jwtAuthProtected, check_access, function (req, res) {
        res.send("/users/register POST Endpoint");
    });

    router.get('/:user_id/submissions', auth.jwtAuthProtected, check_access, function (req, res) {
        var user_id = req.params.user_id;
        res.send("/users/" + user_id + "/submissions GET Endpoint");
    });

    router.get('/:user_id/courses', auth.jwtAuthProtected, check_access, function (req, res) {
        var user_id = req.params.user_id;
        queries.getUserCourses(user_id, "name description").then(function (courses) {
            return res.json(courses);
        })
        .catch(function (err) {
            next(err);
        });
    });

    router.post('/:user_id/courses', auth.jwtAuthProtected, check_access, function (req, res) {
        var user_id = req.params.user_id;
        res.send("/users/" + user_id + "/courses POST Endpoint");
    });

    router.get('/:user_id/courses/:course_id/submissions', auth.jwtAuthProtected, check_access, function (req, res) {
        var user_id = req.params.user_id;
        var course_id = req.params.course_id;
        res.send("/users/" + user_id + "/courses/" + course_id + "/submissions GET Endpoint");
    });
};