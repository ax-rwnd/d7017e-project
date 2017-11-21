'use strict';

var request = require('request');
var mongoose = require('mongoose');
var queries = require('../../lib/queries/queries');
var errors = require('../../lib/errors.js');
var auth = require('../../lib/authentication.js');

const BASIC_FILTER = "username email";
const PRIVILEGED_FILTER = "username email courses admin";
const ADMIN_FILTER = "username email admin tokens courses";


module.exports = function (router) {
    router.get('/', function (req, res, next) {
        var ids = req.query.ids;
        if (!ids) {
            res.sendStatus(404);
            return;
        }

        var id_array = ids.split(',');
        var filter = (req.user.access === "admin")
            ? ADMIN_FILTER
            : BASIC_FILTER;

        queries.getUsers(id_array, filter).then(function (users) {
            res.json({users: users});
        })
        .catch(function (err) {
            next(err);
        });
    });


    router.get('/me', function (req, res, next) {
        queries.getUser(req.user.id, PRIVILEGED_FILTER).then(function (user) {
            res.json(user);
        })
        .catch(function(err) {
            next(err);
        });
    });

    router.get('/me/courses', function (req, res, next) {
        queries.getUserCourses(req.user.id, "name description course_code").then(function (courses) {
            return res.json(courses);
        })
        .catch(next);
    });

    router.get('/me/teaching', function (req, res, next) {
        queries.getUserTeacherCourses(req.user.id, "name description course_code").then(function (courses) {
            return res.json(courses);
        })
        .catch(next);
    });

    router.get('/:user_id', function (req, res, next) {
        var user_id = req.params.user_id;
        var filter = (req.user.access === "admin")
            ? ADMIN_FILTER
            : BASIC_FILTER;

        queries.getUser(user_id, filter).then(function (user) {
            return res.json(user);
        })
        .catch(function (err) {
            next(err);
        });
    });

    router.delete('/:user_id', function (req, res, next) {
        var user_id = req.params.user_id;
        console.log(req.user.access);
        if (req.user.access === "admin"){
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

    router.get('/:user_id/submissions', function (req, res, next) {
        var user_id = req.params.user_id;
        res.send("/users/" + user_id + "/submissions GET Endpoint");
    });

    router.get('/:user_id/courses', function (req, res, next) {
        var user_id = req.params.user_id;
        queries.getUserCourses(user_id, "name description").then(function (courses) {
            return res.json(courses);
        })
        .catch(function (err) {
            next(err);
        });
    });

    router.post('/:user_id/courses', function (req, res, next) {
        var user_id = req.params.user_id;
        res.send("/users/" + user_id + "/courses POST Endpoint");
    });


    // TODO
    // Documentation
    // TESTS
    //
    // User can get all invites he currently got to courses.
    router.get('/courses/invite', function (req, res, next) {
        queries.getUserInvites(req.user.id, "invite")
        .then(function (userInvites) {
            return res.json(userInvites);
        })
        .catch(function (error) {
            return next(error);
        });
    });

    // TODO
    // Documentation
    // TESTS
    //
    // User can get all courses he's asked to join.
    router.get('/courses/pending', function (req, res, next) {
        queries.getUserInvites(req.user.id, "pending")
        .then(function (userInvites) {
            return res.json(userInvites);
        })
        .catch(function (error) {
            return next(error);
        });
    });

    // TODO
    // Documentation
    // TESTS
    //
    // User can get his status to :course_id.
    // Status can be teacher, student, invited, pending or nothing.
    router.get('/courses/:course_id/status', function (req, res, next) {
        var course_id = req.params.course_id;

        if (!mongoose.Types.ObjectId.isValid(course_id)) {
            return next(errors.BAD_INPUT);
        }

        queries.getUser(req.user.id, "teaching courses")
        .then(function (userObject) {
            if (userObject.teaching.indexOf(course_id) !== -1) {
                return "Teacher";
            }
            if (userObject.courses.indexOf(course_id) !== -1) {
                return "Student";
            }
            return queries.getInvitesCourseUser(req.user.id, course_id)
            .then(function (userInvites) {
                if (userInvites.length === 2) {
                    return "Invited";
                }
                if (userInvites.length === 1) {
                    if (userInvites[0].inviteType === "invite") {
                        return "Invited";
                    }
                    return "Pending";
                }
                return "Nothing";
            });
        })
        .then(function (status) {
            return res.json({status: status});
        })
        .catch(function (error) {
            return next(error);
        });
    });

    router.get('/:user_id/courses/:course_id/submissions', function (req, res, next) {
        var user_id = req.params.user_id;
        var course_id = req.params.course_id;
        res.send("/users/" + user_id + "/courses/" + course_id + "/submissions GET Endpoint");
    });
};
