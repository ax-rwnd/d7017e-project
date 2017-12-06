'use strict';

var request = require('request');
var mongoose = require('mongoose');
var queries = require('../../lib/queries/queries');
var errors = require('../../lib/errors.js');
var auth = require('../../lib/authentication.js');
var constants = require('../../lib/constants.js');
var inputValidation = require('../../lib/inputValidation.js');


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


    // TODO:
    // Tests
    // Documentation
    //
    // User can get BASE_FIELDS of all courses he is a member(student or teacher) of.
    // Query parameter "role" takes either "student" or "teacher" if user only wants one kind of courses.
    router.get('/me/member', function (req, res, next) {
        var input;
        try {
            input = inputValidation.getMeMemberValidation(req);
        }
        catch(error) {
            return next(error);
        }

        var p;
        if (input.role === "teacher") {
            p = queries.getUserTeacherCourses1(req.user.id);
        } else if (input.role === "student") {
            p = queries.getUserStudentCourses1(req.user.id);
        } else {
            p = queries.getUserMemberCourses1(req.user.id);
        }

        p.then(function (courseList) {
            return res.json({courses: courseList});
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

    // TODO:
    // Tests
    // Documentation
    //
    // User can get invites he have recieved and requests he have sent.
    // Query parameter "type" take either "pending" or "invite" if user only wants one type of invites.
    router.get('/me/invites', function (req, res, next) {
        var input;
        try {
            input = inputValidation.getMeInvitesValidation(req);
        }
        catch(error) {
            return next(error);
        }

        var p;
        if (input.type) {
            p = queries.getUserInvites(req.user.id, input.type);
        } else {
            p = queries.getUserInvites(req.user.id);
        }

        p.then(function(inviteArray) {
            return res.json(inviteArray);
        })
        .catch(next);
    });


    // TODO
    // Documentation
    // TESTS
    //
    // User can get his status to :course_id.
    // Status can be owner, teacher, student, invited, pending or nothing.
    router.get('/me/:course_id/status', function (req, res, next) {
        var input;
        try {
            input = inputValidation.getMeStatusValidation(req);
        }
        catch(error) {
            return next(error);
        }

        queries.getUserMemberStatus(input.course_id, req.user.id)
        .then(function (statusObject) {
            if (statusObject.role === "teacher") {
                return queries.getCourseOwner(input.course_id).then(function (course) {
                    if (course.owner === req.user.id) {
                        return "Owner";
                    } else {
                        return "Teacher";
                    }
                });
            } else if (statusObject.role === "student") {
                return "Student";
            }
            return queries.getInvitesCourseUser(req.user.id, input.course_id)
            .then(function (userInvite) {
                if (userInvite.inviteType === "invite") {
                    return "Invited";
                } else if (userInvite.inviteType === "pending") {
                    return "Pending";
                } else {
                    return "Nothing";
                }
            });
        })
        .then(function (status) {
            return res.json({status: status});
        })
        .catch(function (error) {
            return next(error);
        });
    });
};
