'use strict';

var request = require('request');
var queries = require('../../lib/queries/queries');
var errors = require('../../lib/errors.js');
var auth = require('../../lib/authentication.js');

const BASIC_FILTER = "username email";
const PRIVILEGED_FILTER = "username email courses admin";
const ADMIN_FILTER = "username email admin tokens courses";


module.exports = function (router) {
    router.get('/', auth.validateJWTtoken, function (req, res, next) {
        var ids = req.query.ids;
        if (!ids) {
            res.sendStatus(404);
            return;
        }

        var id_array = ids.split(',');
        var filter = (req.user.admin === true)
            ? ADMIN_FILTER
            : BASIC_FILTER;

        queries.getUsers(id_array, filter).then(function (users) {
            res.json({users: users});
        })
        .catch(function (err) {
            next(err);
        });
    });


    router.get('/me', auth.validateJWTtoken, function (req, res, next) {
        queries.getUser(req.user.id, PRIVILEGED_FILTER).then(function (user) {
            res.json(user);
        })
        .catch(function(err) {
            next(err);
        });
    });

    router.get('/:user_id', auth.validateJWTtoken, function (req, res, next) {
        var user_id = req.params.user_id;
        var filter = (req.user.admin === true)
            ? ADMIN_FILTER
            : BASIC_FILTER;

        queries.getUser(user_id, filter).then(function (user) {
            return res.json(user);
        })
        .catch(function (err) {
            next(err);
        });
    });

    router.delete('/:user_id', auth.validateJWTtoken, function (req, res, next) {
        var user_id = req.params.user_id;
        console.log(req.user.admin);
        if (req.user.admin === true){
            queries.deleteUser(user_id).then(function (err) {
                if (err) {
                    next(err);
                } else {
                    res.status(200).send("User deleted successfully");
                }
            })
            .catch(function (err) {
                next(err);
            });
        } else {
            res.status(403).send("ERROR: Admin only");
        }
    });

    router.get('/:user_id/submissions', auth.validateJWTtoken, function (req, res, next) {
        var user_id = req.params.user_id;
        res.send("/users/" + user_id + "/submissions GET Endpoint");
    });

    router.get('/:user_id/courses', auth.validateJWTtoken, function (req, res, next) {
        var user_id = req.params.user_id;
        queries.getUserCourses(user_id, "name description").then(function (courses) {
            return res.json(courses);
        })
        .catch(function (err) {
            next(err);
        });
    });

    router.post('/:user_id/courses', auth.validateJWTtoken, function (req, res, next) {
        var user_id = req.params.user_id;
        res.send("/users/" + user_id + "/courses POST Endpoint");
    });

    router.get('/:user_id/courses/:course_id/submissions', auth.validateJWTtoken, function (req, res, next) {
        var user_id = req.params.user_id;
        var course_id = req.params.course_id;
        res.send("/users/" + user_id + "/courses/" + course_id + "/submissions GET Endpoint");
    });
};
