'use strict';

var request = require('request');
var queries = require('../../lib/queries/queries');
var errors = require('../../lib/errors.js');
var auth = require('../../lib/authentication.js');
var testerCom = require('../../lib/tester_communication');

var Assignment = require('../../models/schemas').Assignment;
var Test = require('../../models/schemas').Test;

const BASIC_FILTER = "name description course_code enabled_features";
const ADMIN_FILTER = "name description course_code teachers students assignments features enabled_features hidden";

module.exports = function(router) {
    // Get all courses in db
    // If admin get all
    // If teacher or student get all not hidden courses.
    // Also get hidden courses if teacher/student of it?
    router.get('/', auth.validateJWTtoken, function (req, res, next) {
        var ids = req.query.ids;

        var filter = (req.user.admin === true)
            ? ADMIN_FILTER
            : BASIC_FILTER;

        if (!ids) {
            queries.getCourses(filter, req.user.admin).then(function (courses) {
                return res.json({courses: courses});
            })
            .catch(function (err) {
                next(err);
            });
        } else {
            var id_array = ids.split(',');
            queries.getCourses(filter, req.user.admin, id_array).then(function (courses) {
                return res.json({courses: courses});
            })
            .catch(function (err) {
                next(err);
            });
        }

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
    });


    // Create new course
    // Admin/teachers can create unlimited courses
    // Students limited to 3 courses?
    router.post('/', auth.validateJWTtoken, function (req, res, next) {
        var name = req.body.name;
        var desc = req.body.description;
        var hidden = req.body.hidden;
        var course_code = req.body.course_code;
        var enabled_features = req.body.enabled_features;
        // TODO: validate input
        // TODO: check permissions

        queries.createCourse(name, desc, hidden, course_code, enabled_features).then(function (course) {
            return res.json(course);
        })
        .catch(function (err) {
            next(err);
        });
    });



    // Should be user/:userid/courses ?
    // Would force frontend to send userid. courses/me takes user id from token.
    // Frontend is most likely in possesion of userid. Therefore both is possible.
    router.get('/me', auth.validateJWTtoken, function (req, res, next) {
        queries.getUserCourses(req.user.id, "name description course_code").then(function (courses) {
            return res.json(courses);
        })
        .catch(function (err) {
            next(err);
        });
    });


    // Get course with id :course_id
    // Different information depending on user roll.
    // What should be given for each roll?
    router.get('/:course_id', auth.validateJWTtoken, function (req, res, next) {
        var roll;
        var course_id = req.params.course_id;
        var wantedFields = req.query.fields || null;

        queries.getUser(req.user.id, "teaching").then(function (userObject) {
            if (userObject.teaching.indexOf(course_id) !== -1) {
                roll = "teacher";
            } else if (req.user.admin) {
                roll = "admin";
            } else {
                roll = "student";
            }
            if (!queries.checkPermission(wantedFields, "course", roll)) {
                return next(errors.INSUFFICIENT_PERMISSION);
            }

            queries.getCourse(course_id, roll, wantedFields).then(function (course) {
                return res.json(course);
            });
        })
        .catch(function(err) {
            next(err);
        });
    });



    // Deletes course with id :course_id
    // Only admin and teacher of course can delete course
    router.delete('/:course_id', auth.validateJWTtoken, function (req, res, next) {

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

    router.put('/:course_id/students', auth.validateJWTtoken, function (req, res, next) {
        var course_id = req.params.course_id;
        var student_id = req.body.student_id;
        queries.getUser(req.user.id, "teaching")
        .then(function (userObject) {
            // admins and teachers can invite students
            if (req.user.admin || userObject.teaching.indexOf(course_id) !== -1) {
                return queries.addCourseStudent(course_id, student_id);
            } else {
                // TODO: use a better error
                next(errors.INSUFFICIENT_PERMISSION);
            }
        }).then(function () {
            res.sendStatus(200);
        }).catch(err => {
            console.log(err);
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
        var name = req.body.name;
        var desc = req.body.description;
        var hidden = req.body.hidden;
        var languages = req.body.languages;

        queries.createAssignment(name, desc, hidden, languages, course_id).then(function (assignment) {
            return res.json(assignment);
        })
        .catch(function (err) {
            next(err);
        });
    });

    router.get('/:course_id/assignments/:assignment_id', auth.validateJWTtoken, function (req, res, next) {
        var roll;
        var course_id = req.params.course_id;
        var assignment_id = req.params.assignment_id;
        var wantedFields = req.query.fields || null;

        queries.getUser(req.user.id, "teaching").then(function (userObject) {
            if (userObject.teaching.indexOf(course_id) !== -1) {
                roll = "teacher";
            } else if (req.user.admin) {
                roll = "admin";
            } else {
                roll = "student";
            }
            if (!queries.checkPermission(wantedFields, "assignments", roll)) {
                return next(errors.INSUFFICIENT_PERMISSION);
            }
            queries.getAssignment(assignment_id, roll, wantedFields).then(function (assignmentObject) {
                return res.json(assignmentObject);
            });
        })
        .catch(function (err) {
            next(err);
        });
    });

/*
    //TODO: It is currently not checked if the requested assignment actually belongs to the specified course
    router.get('/:course_id/assignments/:assignment_id', auth.validateJWTtoken, function (req, res, next) {
        var course_id = req.params.course_id;
        var assignment_id = req.params.assignment_id;

        queries.getAssignment(assignment_id, "name description hidden languages").then(function (assignment) {
            return res.json(assignment);
        })
        .catch(function (err) {
            next(err);
        });
    });
*/

    //Submit code to tester
    router.post('/:course_id/assignments/:assignment_id/submit', auth.validateJWTtoken, function(req, res) {

        var lang = req.body.lang;
        var code = req.body.code;
        var assignment_id = req.params.assignment_id;

        testerCom.validateCode(req.user.id, lang, code, assignment_id, res);
    });

    // Save draft to assignment
    // course_id not used, should route be changed? Implement some check?
    router.post('/:course_id/assignments/:assignment_id/save', auth.validateJWTtoken, function (req, res, next) {
        var assignment_id = req.params.assignment_id;
        var code = req.body.code || "";
        var lang = req.body.lang || "";

        queries.saveCode(req.user.id, assignment_id, code, lang).then(function (draft) {
            res.json(draft);
        })
        .catch(function (err) {
            next(err);
        });
    });

    // Retrieve the saved assignment draft, will create and return an empty draft if it doesn't already exist.
    router.get('/:course_id/assignments/:assignment_id/draft', auth.validateJWTtoken, function (req, res, next) {
        var assignment_id = req.params.assignment_id;

        queries.getCode(req.user.id, assignment_id).then(function (draft) {
            res.json(draft);
        })
        .catch(function (err) {
            next(err);
        });
    });

    router.get('/:course_id/assignments/:assignment_id/tests', auth.validateJWTtoken, function (req, res, next) {
        var course_id = req.params.course_id;
        var assignment_id = req.params.assignment_id;
        res.send("/courses/" + course_id + "/assignments/" + assignment_id + "/tests GET Endpoint");
    });

    router.post('/:course_id/assignments/:assignment_id/tests', auth.validateJWTtoken, function (req, res, next) {
        var course_id = req.params.course_id;
        var assignment_id = req.params.assignment_id;
        var stdout = req.body.stdout;
        var stdin = req.body.stdin;
        var args = req.body.args;
        var lint = req.body.lint;

        queries.createTest(stdout, stdin, args, lint, assignment_id).then(function (test) {
            return res.json(test);
        })
        .catch(function (err) {
            next(err);
        });
    });

    router.get('/:course_id/assignments/:assignment_id/tests/:test_id', auth.validateJWTtoken, function (req, res, next) {
        var course_id = req.params.course_id;
        var assignment_id = req.params.assignment_id;
        var test_id = req.params.test_id;

        queries.getTest(test_id, "stdout stdin args").then(function (test) {
            return res.json(test);
        })
        .catch(function (err) {
            next(err);
        });
    });

    router.get('/:course_id/enabled_features', auth.validateJWTtoken, function(req, res, next) {
        queries.getCoursesEnabledFeatures(req.params.course_id).then(function (enabled_features) {
            res.json(enabled_features);
        }).catch(next);
    });
};
