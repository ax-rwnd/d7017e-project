'use strict';

var request = require('request');
var queries = require('../../lib/queries/queries');
var errors = require('../../lib/errors.js');
var auth = require('../../lib/authentication.js');

var Assignment = require('../../models/schemas').Assignment;
var Test = require('../../models/schemas').Test;

module.exports = function(router) {

    router.get('/', auth.validateJWTtoken, function (req, res, next) {
        //Need user object from token verify for admin check.
        /*
        if (user.admin) {
            queries.getCourses("name description", user.admin).then(function (courses) {
                return res.json(courses);
            })
            .catch(function (err) {
                next(err);
            });
        }
        */
        queries.getCourses("name description", false).then(function (courses) {
            return res.json(courses);
        })
        .catch(function (err) {
            next(err);
        });
    });

    router.post('/', auth.validateJWTtoken, function (req, res, next) {
        var name = req.body.name;
        var desc = req.body.description;
        var hidden = req.body.hidden;

        queries.createCourse(name, desc, hidden).then(function (course) {
            return res.json(course);
        })
        .catch(function (err) {
            next(err);
        });
    });

    router.get('/me', auth.validateJWTtoken, function (req, res, next) {
        queries.getUserCourses(req.user.id, "name description").then(function (courses) {
            return res.json(courses);
        })
        .catch(function (err) {
            next(err);
        });
    });

    router.get('/:course_id', auth.validateJWTtoken, function (req, res, next) {
        var course_id = req.params.course_id;
        
        queries.getCourse(course_id, "name description teacher assignments").then(function (course) {
            return res.json(course);
        })
        .catch(function (err) {
            next(err);
        });
    });

    router.get('/:course_id/students', auth.validateJWTtoken, function (req, res, next) {
        var course_id = req.params.course_id;

        queries.getCourseStudents(course_id, "username email").then(function (students) {
            return res.json(students);
        })
        .catch(function (err) {
            next(err);
        });
    });

    router.get('/:course_id/teachers', auth.validateJWTtoken, function (req, res, next) {
        var course_id = req.params.course_id;

        queries.getCourseTeachers(course_id, "username email").then(function (teachers) {
            return res.json(teachers);
        })
        .catch(function (err) {
            next(err);
        });
    });

    router.get('/:course_id/assignments', auth.validateJWTtoken, function (req, res, next) {
        var course_id = req.params.course_id;
        
        queries.getCourseAssignments(course_id, "name description hidden languages").then(function (assignments) {
            return res.json(assignments);
        })
        .catch(function (err) {
            next(err);
        });
    });

    router.post('/:course_id/assignments', auth.validateJWTtoken, function (req, res, next) {
        var course_id = req.params.course_id;
        res.send("/courses/" + course_id + "/assignments POST Endpoint");
    });

    router.get('/:course_id/assignments/:assignment_id', auth.validateJWTtoken, function (req, res, next) {
        var course_id = req.params.course_id;
        var assignment_id = req.params.assignment_id;
        res.send("/courses/" + course_id + "/assignments/" + assignment_id + " GET Endpoint");
    });

    router.get('/:course_id/assignments/:assignment_id/tests', auth.validateJWTtoken, function (req, res, next) {
        var course_id = req.params.course_id;
        var assignment_id = req.params.assignment_id;
        res.send("/courses/" + course_id + "/assignments/" + assignment_id + "/tests GET Endpoint");
    });

    router.get('/:course_id/assignments/:assignment_id/tests/:test_id', auth.validateJWTtoken, function (req, res, next) {
        var course_id = req.params.course_id;
        var assignment_id = req.params.assignment_id;
        var test_id = req.params.test_id;
        res.send("/courses/" + course_id + "/assignments/" + assignment_id + "/tests/" + test_id + "GET Endpoint");
    });
};
