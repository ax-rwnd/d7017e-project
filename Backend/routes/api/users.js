'use strict';

var request = require('request');
var mongoose = require('mongoose');
var queries = require('../../lib/queries/queries');
var errors = require('../../lib/errors.js');
var auth = require('../../lib/authentication.js');
var constants = require('../../lib/constants.js');

module.exports = function (router) {
    // required query parameter `ids`:
    // only get users whose ids appear in the comma separated string
    router.get('/', function (req, res, next) {
        var ids = req.query.ids;
        if (!ids) {
            res.sendStatus(404);
            return;
        }
        var id_array = ids.split(',');
        for (let id of id_array) {
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return next(errors.BAD_INPUT);
            }
        }

        var filter = (req.user.access === constants.ACCESS.ADMIN)
            ? constants.FIELDS.USER.ADMIN
            : constants.FIELDS.USER.BASE_FIELDS;

        queries.getUsers(id_array, filter)
        .then(function (users) {
            res.json({users: users});
        }).catch(next);
    });

    // returns the user object for the user that is currently logged in
    router.get('/me', function (req, res, next) {
        queries.getUserPopulated(req.user.id, "Admin")
        .then(user => {
            res.json(user);
        }).catch(next);
    });

    router.get('/me/member/', function (req, res, next) {
        var user_id = req.user.id;
        var specificRole = req.query.role;

        var p;
        if (specificRole === "teacher") {  
            p = queries.getUserTeacherCourses1(user_id);

        } else if (specificRole === "student") {
            p = queries.getUserStudentCourses1(user_id);
        } else {
            p = queries.getUserMemberCourses1(user_id);
        }

        p.then(function (courseList) {
            return res.json({courses: courseList});
        })
        .catch(next);
    });


    router.get('/me/courses', function (req, res, next) {
        queries.getUserCourses(req.user.id, constants.FIELDS.COURSE.BASE_FIELDS).then(function (courses) {
            return res.json(courses);
        })
        .catch(next);
    });

    router.get('/me/teaching', function (req, res, next) {
        queries.getUserTeacherCourses(req.user.id, constants.FIELDS.COURSE.BASE_FIELDS).then(function (courses) {
            return res.json(courses);
        })
        .catch(next);
    });


    router.get('/:user_id', function (req, res, next) {
        var user_id = req.params.user_id;
        var filter = (req.user.access === constants.ACCESS.ADMIN)
            ? constants.FIELDS.USER.ADMIN
            : constants.FIELDS.USER.BASE_FIELDS;

        queries.getUser(user_id, filter).then(function (user) {
            return queries.getUserMemberCourses1(user_id).then(function(userCourses) {
                console.log(userCourses);
                    var userObject = user.toObject();
                    userObject.courses = userCourses;
                    return res.json(userObject); 
                });
        })
        .catch(function (err) {
            next(err);
        });
    });

    router.delete('/:user_id', function (req, res, next) {
        var user_id = req.params.user_id;
        if (req.user.access === constants.ACCESS.ADMIN){
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

    router.get('/:user_id/courses', function (req, res, next) {
        var user_id = req.params.user_id;
        queries.getUserCourses(user_id, constants.FIELDS.COURSE.BASE_FIELDS).then(function (courses) {
            return res.json(courses);
        })
        .catch(function (err) {
            next(err);
        });
    });


    router.get('/me/invite', function (req, res, next) {
        var query = req.query.type;

        var p;
        if (req.query.type) {
            p = queries.getUserInvites(req.user.id, query);
        } else {
            p = queries.getUserInvites(req.user.id);
        }

        p.then(function(inviteArray) {
            return res.json(inviteArray);
        })
        .catch(function (error) {
            return next(error);
        });
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

        queries.getUserMemberStatus(course_id, req.user.id)
        .then(function (statusObject) {
            console.log(statusObject.role);
            if (statusObject.role === "teacher") {
                return "Teacher";
            }
            if (statusObject.role === "student") {
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
            console.log(status);
            return res.json({status: status});
        })
        .catch(function (error) {
            return next(error);
        });
    });
};
