'use strict';

var request = require('request');
var mongoose = require('mongoose');
var queries = require('../../lib/queries/queries');
var errors = require('../../lib/errors.js');
var permission = require('../../lib/permission.js');
var inputValidation = require('../../lib/inputValidation.js');
var badInput = require('../../lib/badInputError.js');
var typecheck = require('../../lib/typecheck.js');
var auth = require('../../lib/authentication.js');
var testerCom = require('../../lib/tester_communication');
var logger = require('../../lib/logger');
var features = require('../../lib/queries/features');

var Assignment = require('../../models/schemas').Assignment;
var Test = require('../../models/schemas').Test;
var constants = require('../../lib/constants.js');

// CHANGE THIS TO USE THE CONSTANTS.JS INSTEAD
const BASIC_FILTER = "name description course_code enabled_features";
const ADMIN_FILTER = "name description course_code teachers students assignments features enabled_features hidden";

module.exports = function(router) {

    // TODO:
    // Tests
    // Documentation
    // Query param to query multiple courses?
    //
    // Returns BASE_FIELDS of every course in db.
    // If course is "hidden" only Admin and members of the course can see it.

    router.get('/', function (req, res, next) {

        var p;
        if (req.user.access === "admin") {
            p = queries.getAllCourses();
        } else {
            p = queries.getCourses1().then(function (courseArray) {
                    return queries.getUsersHiddenCourses(req.user.id).then(function (hiddenCourses) {
                        return courseArray.concat(hiddenCourses);
                    });
                });
        }

        p.then(function (courseArray) {
            return res.json({courses: courseArray});
        })
        .catch(next);
    });


    // TODO:
    // Tests
    // Documentation
    //
    // Create new course
    // Admin/teachers can create unlimited courses
    // Students limited to 3 courses?
    router.post('/', function (req, res, next) {
        var input;
        try {
            input = inputValidation.postCourseValidation(req);
        }
        catch(error) {
            return next(error);
        }

        var p;
        if (req.user.access === "basic") {
            p = queries.countOwnedCourses(req.user.id)
                .then(function () {
                    return queries.saveCourseObject(req.user.id, input);
                });
        } else {
            p = queries.saveCourseObject(req.user.id, input);
        }
        p.then(function (savedCourse) {
            return res.status(201).json(savedCourse);
        })
        .catch(next);
    });



    // Get course with id :course_id
    // Different information depending on user roll.
    // What should be given for each roll?
    /*
    router.get('/:course_id', function (req, res, next) {
        var roll;
        var course_id = req.params.course_id;
        var wantedFields = req.query.fields || null;

        queries.getUser(req.user.id, "teaching").then(function (userObject) {
            if (userObject.teaching.indexOf(course_id) !== -1) {
                roll = "teacher";
            } else if (req.user.access === constants.ACCESS.ADMIN) {
                roll = "admin";
            } else {
                roll = "student";
            }
            if (!queries.checkPermission(wantedFields, "course", roll)) {
                return next(errors.INSUFFICIENT_PERMISSION);
            }

            queries.getCourse(course_id, roll, wantedFields).then(function (course) {
                return queries.getCourseMembers1(course_id).then(function(courseMembers) {
                    var courseObject = course.toObject();
                    courseObject.members = courseMembers;
                    console.log(courseObject);
                    return res.json(courseObject);
                });
            });
        })
        .catch(function(err) {
            next(err);
        });
    });
*/

    router.get('/:course_id', function (req, res, next) {
        var roll;
        var course_id = req.params.course_id;
        var wantedFields = req.query.fields || null;
        queries.getCourse(course_id, roll, wantedFields).then(function (course) {
            return queries.getCourseMembers1(course_id).then(function(courseMembers) {
                var courseObject = course.toObject();
                courseObject.members = courseMembers;
                console.log(courseObject);
                return res.json(courseObject);
            });
        })
        .catch(next);
    });

    // Deletes course with id :course_id
    // Only admin and teacher of course can delete course
    router.delete('/:course_id', function (req, res, next) {
        let {course_id} = inputValidation.courseIdValidation(req);
        permission.checkIfTeacherOrAdmin(req.user.id, course_id, req.user.access)
        .then(() => {
            return queries.deleteCourse(course_id);
        }).then(() => {
            // respond with empty body
            res.json({});
        }).catch(next);
    });

    // Modify course with id :course_id
    // Must be teacher or higher
    router.put('/:course_id', function (req, res, next) {
        let {course_id} = inputValidation.courseIdValidation(req);
        let body = inputValidation.putCourseBodyValidation(req);
        permission.checkIfTeacherOrAdmin(req.user.id, course_id, req.user.access)
        .then(() => {
            return queries.updateCourse(course_id, body);
        }).then(() => {
            // send an empty response
            res.json({});
        }).catch(next);
    });


    router.get('/:course_id/members', function (req, res, next) {
        var course_id = req.params.course_id;
        var query = req.query.role;

        var p;
        if (query === "teacher") {
            p = queries.getCourseTeachers1(course_id);
        } else if (query === "student") {
            p = queries.getCourseStudents1(course_id);
        } else {
            p = queries.getCourseMembers1(course_id);
        }

        p.then(function (memberArray) {
            return res.json({members: memberArray});
        })
        .catch(next);
    });




    // TODO
    // Documentation
    // TESTS
    //
    // Admin and teacher of course can get all current outstanding invites to the course.
    router.get('/:course_id/students/invite', function (req, res, next) {
        var course_id = req.params.course_id;

        if (!mongoose.Types.ObjectId.isValid(course_id)) {
            return next(errors.BAD_INPUT);
        }

        permission.checkIfTeacherOrAdmin(req.user.id, course_id, req.user.access)
        .then(function () {
            return queries.getCourseInvites(course_id, "invite");
        })
        .then(function (courseInvites) {
            return res.json(courseInvites);
        })
        .catch(function (error) {
            return next(error);
        });
    });


    // TODO:
    // Tests
    // Documentation
    //
    //

    // NOT DONE
    router.post('/:course_id/members/invite', function (req, res, next) {
        try {
            var input = inputValidation.putMembersInviteValidation(req);
        }
        catch(error) {
            return next(error);
        }

        var p;
        if (input.user_id === req.user.id) {
            p = permission.checkUserNotInCourse(input.user_id, input.course_id).then(function () {
                    return permission.checkIfAlreadyInvited(input.user_id, input.course_id).then(function () {

                    })
                })
                .then(function () {

                })
        }

    });


    // TODO:
    // Tests
    // Documentation
    //
    //
    router.put('/:course_id/members/invite', function (req, res, next) {
        try {
            var input = inputValidation.putMembersInviteValidation(req);
        }
        catch(error) {
            return next(error);
        }
        var p;
        if (input.user_id === req.user.id) {
            p = queries.acceptInviteToCourse(input.user_id, input.course_id);
        } else {
            p = permission.checkIfTeacherOrAdmin(input.user_id, input.course_id, req.user.access).then(function () {
                        return queries.addMemberToCourse(input.user_id, input.course_id);
                });
        }
        p.then(function () {
            return res.status(201).json({});
        })
        .catch(next);
    });

    // TODO
    // Documentation
    // Test
    //
    // Admin and teacher of course can remove an already made invite.
    // User can decline (remove) an recieved invite to :course_id.
    router.delete('/:course_id/students/invite', function (req, res, next) {
        var course_id = req.params.course_id;
        var student_id = req.body.student_id;

        if (!student_id) {
            student_id = req.user.id;
        }

        if (!mongoose.Types.ObjectId.isValid(student_id) || !mongoose.Types.ObjectId.isValid(course_id)) {
            return next(errors.BAD_INPUT);
        }

        // First check if deleting own invitation then
        // Remove invitation if own. If not own check if admin/teacher of course then
        // remove invitation
        // Thrown errors will halt execution
        queries.returnPromiseForChainStart()
        .then(function () {
            if (student_id === req.user.id) {
                return queries.findAndRemoveRequest(student_id, course_id, "invite");
            } else {
                return permission.checkIfTeacherOrAdmin(req.user.id, course_id, req.user.access)
                .then(function () {
                  return queries.findAndRemoveRequest(student_id, course_id, "invite");
                });
            }
        })
        .then(function () {
            return res.sendStatus(200).json({});
        })
        .catch(function (error) {
            return next(error);
        });
    });


    // TODO
    // Documenetation
    // TESTS
    //
    // Admin and teacher of course can remove a student from the course.
    // User can leave course.
    router.delete('/:course_id/students', function (req, res, next) {
        var course_id = req.params.course_id;
        var student_id = req.body.student_id;

        if (!student_id) {
            student_id = req.user.id;
        }

        if (!mongoose.Types.ObjectId.isValid(student_id) || !mongoose.Types.ObjectId.isValid(course_id)) {
            return next(errors.BAD_INPUT);
        }

        // If leaving course then
        // Remove student from course
        //
        // If kicked out of course then
        // Check if admin/teacher then
        // Remove student from course
        queries.returnPromiseForChainStart()
        .then(function () {
            if (student_id === req.user.id) {
                return queries.removeStudentFromCourse(student_id, course_id)
                .then(function () {
                    return res.sendStatus(200).json({});
                });
            } else {
                return permission.checkIfTeacherOrAdmin(req.user.id, course_id, req.user.access)
                .then(function () {
                    return queries.removeStudentFromCourse(student_id, course_id);
                })
                .then(function () {
                    return res.sendStatus(200).json({});
                });
            }
        })
        .catch(function (error) {
            return next(error);
        });
    });


    router.put('/:course_id/members', function (req, res, next) {
        return res.json({fail: "bosse"});
    });
/*
    // TODO
    // Documentation
    // TESTS
    //
    // Admin and teachers of course can promote a student to teacher of course.
    router.put('/:course_id/teachers', function (req, res, next) {
        var course_id = req.params.course_id;
        var teacher_id = req.body.teacher_id;

        if (!mongoose.Types.ObjectId.isValid(teacher_id) || !mongoose.Types.ObjectId.isValid(course_id)) {
            return next(errors.BAD_INPUT);
        }

        permission.checkIfTeacherOrAdmin(req.user.id, course_id, req.user.access, "students teachers")
        .then(function (courseObject) {
            return queries.checkIfUserInCourseAndNotTeacherObject(teacher_id, courseObject);
        })
        .then(function () {
            return queries.addTeacherToCourse(teacher_id, course_id);
        })
        .then(function () {
            return res.sendStatus(201).json({});
        })
        .catch(function (error) {
            return next(error);
        });
    });
*/
    router.delete('/:course_id/members', function (req, res, next) {
        return res.json({fail: "Bosse"})
    });


/*
    // TODO
    // Documentation
    // TESTS
    //
    // Admin and teacher of course can demote a teacher of the course. He will then become a student of the course.
    router.delete('/:course_id/teachers', function (req, res, next) {
        var course_id = req.params.course_id;
        var teacher_id = req.body.teacher_id;

        if (!mongoose.Types.ObjectId.isValid(teacher_id) || !mongoose.Types.ObjectId.isValid(course_id)) {
            return next(errors.BAD_INPUT);
        }

        permission.checkIfTeacherOrAdmin(req.user.id, course_id, req.user.access)
        .then(function (courseObject) {
            return queries.checkIfUserIsTeacherObject(teacher_id, courseObject);
        })
        .then(function () {
            return queries.removeTeacherFromCourse(teacher_id, course_id);
        })
        .then (function () {
            return res.sendStatus(200).json({});
        })
        .catch(function (error) {
            return next(error);
        });
    });
*/

    // Return all assignmnts from a course
    router.get('/:course_id/assignments', function (req, res, next) {
        var course_id = req.params.course_id;

        queries.getCourseAssignments(course_id, "name description hidden languages").then(function (assignments) {
            return res.json(assignments);
        })
        .catch(function (err) {
            next(err);
        });
    });

    // Creates an assignment for a course
    router.post('/:course_id/assignments', function (req, res, next) {
        var course_id = req.params.course_id;
        var name = req.body.name;
        var desc = req.body.description;
        var hidden = req.body.hidden;
        var lint = req.body.lint;
        var languages = req.body.languages;

        queries.createAssignment(name, desc, hidden, lint, languages, course_id).then(function (assignment) {
            return res.status(201).json(assignment);
        })
        .catch(function (err) {
            next(err);
        });
    });

    // Return assignment bases on permissions
    router.get('/:course_id/assignments/:assignment_id', function (req, res, next) {
        var roll;
        var course_id = req.params.course_id;
        var assignment_id = req.params.assignment_id;
        var wantedFields = req.query.fields || null;

        if (!mongoose.Types.ObjectId.isValid(course_id) || !mongoose.Types.ObjectId.isValid(assignment_id)) {
            return next(errors.BAD_INPUT);
        }

        queries.getUser(req.user.id, "teaching").then(function (userObject) {
            if (userObject.teaching.indexOf(course_id) !== -1) {
                roll = "teacher";
            } else if (req.user.access === constants.ACCESS.ADMIN) {
                roll = "admin";
            } else {
                roll = "student";
            }
            if (!queries.checkPermission(wantedFields, "assignments", roll)) {
                throw errors.INSUFFICIENT_PERMISSION;
            }
            return queries.getAssignment(assignment_id, roll, wantedFields)
            .then(function (assignmentObject) {
                return res.json(assignmentObject);
            });
        }).catch(next);
    });

    // Update an assignment
    router.put('/:course_id/assignments/:assignment_id', function (req, res, next) {

        // TODO

        return res.json({});
    });

    // Delete an assignment
    router.delete('/:course_id/assignments/:assignment_id', function (req, res, next) {
        let {course_id, assignment_id} = inputValidation.assignmentValidation(req);
        permission.checkIfTeacherOrAdmin(req.user.id, course_id, req.user.access)
        .then(() => permission.checkIfAssignmentInCourse(course_id, assignment_id))
        .then(() => queries.deleteAssignment(assignment_id))
        .then(() => {
            // respond with empty body
            res.json({});
        }).catch(next);
    });

    router.get('/:course_id/invitelink', function (req, res, next) {
        var course_id = req.params.course_id;

        permission.checkIfTeacherOrAdmin(req.user.id, course_id, req.user.access).then(function () {
            return queries.generateInviteLink(course_id).then(function (obj) {
                res.status(201).json({course: obj.course, code: obj.code});
            });
        })
        .catch(function (err) {
            next(err);
        });
    });

    router.get('/join/:code', function (req, res, next) {
        var code = req.params.code;

        queries.validateInviteLink(code, req.user.id).then(function (result) {
            res.json({success: true});
        })
        .catch(function (err) {
            next(err);
        });
    });

/*
    //TODO: It is currently not checked if the requested assignment actually belongs to the specified course
    router.get('/:course_id/assignments/:assignment_id', function (req, res, next) {
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

    //submit user code to Tester service for code validation
    router.post('/:course_id/assignments/:assignment_id/submit', function(req, res, next) {
        var lang = req.body.lang;
        var code = req.body.code;
        var assignment_id = req.params.assignment_id;
        var course_id = req.params.course_id;
        
        /*if (!mongoose.Types.ObjectId.isValid(assignment_id) || !mongoose.Types.ObjectId.isValid(course_id)) {
            return next(errors.BAD_INPUT);
        }*/

        var input;
        try {
            input = inputValidation.submitCodeValidation(req);
        } catch(error) {
            return next(error);
        }

        return testerCom.validateCode(req.user.id, lang, code, assignment_id)
        .then(function (testerResponse) {
            console.log(testerResponse);
            return res.json(testerResponse);
        })
        .catch(function (err) {
            next(err);
        });
        //testerCom.validateCode(req.user.id, lang, code, assignment_id);
    });

    // TODO: SHOULD BE REMOVED ONCE NEW ROUTE PATH IS USED BY FRONTEND
    // Save draft to assignment
    // course_id not used, should route be changed? Implement some check?
    router.post('/:course_id/assignments/:assignment_id/save', function (req, res, next) {
        var assignment_id = req.params.assignment_id;
        var code = req.body.code || "";
        var lang = req.body.lang || "";

        queries.saveCode(req.user.id, assignment_id, code, lang).then(function (draft) {
            res.status(201).json(draft);
        })
        .catch(function (err) {
            next(err);
        });
    });

    // save a user-draft (code) for an assignment
    router.post('/:course_id/assignments/:assignment_id/draft', function (req, res, next) {
        var assignment_id = req.params.assignment_id;
        var course_id = req.params.course_id;
        var code = req.body.code || "";
        var lang = req.body.lang || "";

        if (!mongoose.Types.ObjectId.isValid(assignment_id) || !mongoose.Types.ObjectId.isValid(course_id)) {
            return next(errors.BAD_INPUT);
        }

        queries.checkIfAssignmentInCourse(assignment_id, course_id).then(function () {
            queries.saveCode(req.user.id, assignment_id, code, lang).then(function (draft) {
                return res.status(201).json(draft);
            });
        })
        .catch(function (err) {
            next(err);
        });
    });

    // Retrieve the saved assignment draft, will create and return an empty draft if it doesn't already exist.
    router.get('/:course_id/assignments/:assignment_id/draft', function (req, res, next) {
        var assignment_id = req.params.assignment_id;
        var course_id = req.params.course_id;

        if (!mongoose.Types.ObjectId.isValid(assignment_id) || !mongoose.Types.ObjectId.isValid(course_id)) {
            return next(errors.BAD_INPUT);
        }

        /*queries.checkIfAssignmentInCourse(assignment_id, course_id).then(function () {
            queries.getCode(req.user.id, assignment_id).then(function (draft) {
                return res.json(draft);
            });
        })
        .catch(function (err) {
            next(err);
        });*/
        queries.checkIfAssignmentInCourse(assignment_id, course_id).then(function () {
            queries.getCode(req.user.id, assignment_id).then(function (draft) {
                return res.json(draft);
            });
        })
        .catch(function (err) {
            next(err);
        });
    });

    // Get tests belonging to a specific assingment
    router.get('/:course_id/assignments/:assignment_id/tests', function (req, res, next) {
        var course_id = req.params.course_id;
        var assignment_id = req.params.assignment_id;

        if (!mongoose.Types.ObjectId.isValid(assignment_id) || !mongoose.Types.ObjectId.isValid(course_id)) {
            return next(errors.BAD_INPUT);
        }

        permission.checkIfAssignmentInCourse(course_id, assignment_id)
        .then(function () {
            return permission.checkIfTeacherOrAdmin(req.user.id, course_id, req.user.access);
        })
        .then(function () {
            return queries.getAssignmentTests(course_id, assignment_id);
        })
        .then(function (assignmentTests) {
            return res.json(assignmentTests);
        })
        .catch(function (error) {
            return next(error);
        });
    });

    // Post test to a specified assignment
    router.post('/:course_id/assignments/:assignment_id/tests', function (req, res, next) {
        var course_id = req.params.course_id;
        var assignment_id = req.params.assignment_id;
        var stdout = req.body.stdout;
        var stdin = req.body.stdin;
        var args = req.body.args;

        if (!mongoose.Types.ObjectId.isValid(assignment_id) || !mongoose.Types.ObjectId.isValid(course_id) || !typecheck.isString(stdout) || !typecheck.isString(stdin) || !Array.isArray(args)) {
            return next(errors.BAD_INPUT);
        }

        permission.checkIfAssignmentInCourse(course_id, assignment_id)
        .then(function () {
            return permission.checkIfTeacherOrAdmin(req.user.id, course_id, req.user.access);
        })
        .then(function () {
            return queries.createTest(stdout, stdin, args, assignment_id);
        })
        .then(function (test) {
            return res.status(201).json(test);
        })
        .catch(function (err) {
            next(err);
        });
    });

    // Get specified test
    router.get('/:course_id/assignments/:assignment_id/tests/:test_id', function (req, res, next) {
        var course_id = req.params.course_id;
        var assignment_id = req.params.assignment_id;
        var test_id = req.params.test_id;

        if (!mongoose.Types.ObjectId.isValid(assignment_id) || !mongoose.Types.ObjectId.isValid(course_id) || !mongoose.Types.ObjectId.isValid(test_id)) {
            return next(errors.BAD_INPUT);
        }

        permission.checkIfTestInAssignment(assignment_id, test_id)
        .then(function () {
            return permission.checkIfAssignmentInCourse(course_id, assignment_id);
        })
        .then(function () {
            return permission.checkIfTeacherOrAdmin(req.user.id, course_id, req.user.access);
        })
        .then(function () {
            return queries.getTest(test_id, "stdout stdin args");
        })
        .then(function (test) {
            return res.json(test);
        })
        .catch(function (err) {
            next(err);
        });
    });

    // Delete specified test
    router.delete('/:course_id/assignments/:assignment_id/tests/:test_id', function (req, res, next) {
        var course_id = req.params.course_id;
        var assignment_id = req.params.assignment_id;
        var test_id = req.params.test_id;

        if (!mongoose.Types.ObjectId.isValid(assignment_id) || !mongoose.Types.ObjectId.isValid(course_id) || !mongoose.Types.ObjectId.isValid(test_id)) {
            return next(errors.BAD_INPUT);
        }

        permission.checkIfTestInAssignment(assignment_id, test_id)
        .then(function () {
            return permission.checkIfAssignmentInCourse(course_id, assignment_id);
        })
        .then(function () {
            return permission.checkIfTeacherOrAdmin(req.user.id, course_id, req.user.access);
        })
        .then(function () {
            return queries.deleteTest(test_id, assignment_id);
        })
        .then(function () {
            return res.json({});
        })
        .catch(function (err) {
            next(err);
        });
    });

    // Update specified test
    router.put('/:course_id/assignments/:assignment_id/tests/:test_id', function (req, res, next) {
        var course_id = req.params.course_id;
        var assignment_id = req.params.assignment_id;
        var test_id = req.params.test_id;

        if (!mongoose.Types.ObjectId.isValid(assignment_id) || !mongoose.Types.ObjectId.isValid(course_id) || !mongoose.Types.ObjectId.isValid(test_id)) {
            return next(errors.BAD_INPUT);
        }

        let b = req.body;
        let clean_b = {};
        if (b.hasOwnProperty('stdout')) {
            if (typecheck.isString(b.stdout)) {
                clean_b.stdout = b.stdout;
            } else {
                return next(errors.BAD_INPUT);
            }
        }
        if (b.hasOwnProperty('stdin')) {
            if (typecheck.isString(b.stdin)) {
                clean_b.stdin = b.stdin;
            } else {
                return next(errors.BAD_INPUT);
            }
        }
        if (b.hasOwnProperty('args')) {
            if (Array.isArray(b.args)) {
                clean_b.args = b.args;
            } else {
                return next(errors.BAD_INPUT);
            }
        }

        permission.checkIfTestInAssignment(assignment_id, test_id)
        .then(function () {
            return permission.checkIfAssignmentInCourse(course_id, assignment_id);
        })
        .then(function () {
            return permission.checkIfTeacherOrAdmin(req.user.id, course_id, req.user.access);
        })
        .then(function () {
            return queries.updateTest(test_id, clean_b);
        })
        .then(function () {
            return res.json({});
        })
        .catch(function (err) {
            next(err);
        });
    });

    // Return enabled_features of a course
    router.get('/:course_id/enabled_features', function(req, res, next) {

        var course_id = req.params.course_id;

        if (!mongoose.Types.ObjectId.isValid(course_id)) {
            return next(errors.BAD_INPUT);
        }

        return queries.getCoursesEnabledFeatures(course_id)
        .then(enabled_features => res.json(enabled_features))
        .catch(next);
    });

    // Return all features of a course
    router.get('/:course_id/features', function(req, res, next) {

        var course_id = req.params.course_id;

        if (!mongoose.Types.ObjectId.isValid(course_id)) {
            return next(errors.BAD_INPUT);
        }

        features.getFeaturesOfCourse(course_id)
        .then(features => res.json({features: features}))
        .catch(next);
    });

    // Return feature of user in a course
    router.get('/:course_id/features/me', function(req, res, next) {

        var course_id = req.params.course_id;
        var user_id = req.user.id;

        if (!mongoose.Types.ObjectId.isValid(course_id) || !mongoose.Types.ObjectId.isValid(user_id)) {
            return next(errors.BAD_INPUT);
        }

        features.getFeatureOfUserID(course_id, user_id)
        .then(res.json)
        .catch(next);
    });

    // Get all badges in a course
    router.get('/:course_id/badges', function(req, res, next) {

        var course_id = req.params.course_id;

        if (!mongoose.Types.ObjectId.isValid(course_id)) {
            return next(errors.BAD_INPUT);
        }

        return features.getBadgeByCourseID(course_id)
        .then(badges => res.json({badges: badges}))
        .catch(next);
    });

    // Create badge
    router.post('/:course_id/badges', function (req, res, next) {

        var course_id = req.params.course_id;

        if (!mongoose.Types.ObjectId.isValid(course_id)) {
            return next(errors.BAD_INPUT);
        }

        var input;
        try {
            input = inputValidation.badgeValidation(req);
        } catch(error) {
            return next(error);
        }

        return permission.checkIfTeacherOrAdmin(req.user.id, course_id, req.user.access)
        .then(function() {
            return features.createBadge(input);
        })
        .then(function(badge) {
            return res.json(badge);
        })
        .catch(next);
    });

    // Get a badge by id
    router.get('/:course_id/badges/:badge_id', function (req, res, next) {

        var course_id = req.params.course_id;
        var badge_id = req.params.badge_id;

        if (!mongoose.Types.ObjectId.isValid(course_id) || !mongoose.Types.ObjectId.isValid(badge_id)) {
            return next(errors.BAD_INPUT);
        }

        features.getBadge(badge_id)
        .then(function(badge) {
            return res.json(badge);
        })
        .catch(next);
    });

    // Update a badge by id
    router.put('/:course_id/badges/:badge_id', function(req, res, next) {

        var course_id = req.params.course_id;
        var badge_id = req.params.badge_id;

        if (!mongoose.Types.ObjectId.isValid(course_id) || !mongoose.Types.ObjectId.isValid(badge_id)) {
            return next(errors.BAD_INPUT);
        }

        req.body.course_id = course_id;

        return features.updateBadge(badge_id, req.body)
        .then(function(badge) {
            return res.json(badge);
        })
        .catch(next);
    });

    // Delete a badge by id
    router.delete('/:course_id/badges/:badge_id', function(req, res, next) {

        var course_id = req.params.course_id;
        var badge_id = req.params.badge_id;

        if (!mongoose.Types.ObjectId.isValid(course_id) || !mongoose.Types.ObjectId.isValid(badge_id)) {
            return next(errors.BAD_INPUT);
        }

        return permission.checkIfTeacherOrAdmin(req.user.id, course_id, req.user.access)
        .then(function() {
            return features.deleteBadge(badge_id);
        })
        .then(function(result) {
            return res.json({});
        })
        .catch(next);
    });

    // Get all assignmentgroups of a course
    router.get('/:course_id/assignmentgroups', function(req, res, next) {

        var course_id = req.params.course_id;

        if (!mongoose.Types.ObjectId.isValid(course_id)) {
            return next(errors.BAD_INPUT);
        }

        queries.getAssignmentgroupsByCourseID(course_id)
        .then(assignmentgroups => res.json(assignmentgroups))
        .catch(next);
    });

    // Create an assignment group
    router.post('/:course_id/assignmentgroups', function(req, res, next) {

        var course_id = req.params.course_id;

        if (!mongoose.Types.ObjectId.isValid(course_id)) {
            return next(errors.BAD_INPUT);
        }

        var input;
        try {
            input = inputValidation.assignmentgroupValidation(req);
        } catch(error) {
            return next(error);
        }

        return permission.checkIfTeacherOrAdmin(req.user.id, course_id, req.user.access)
        .then(function() {
            return queries.createAssignmentgroup(input, course_id);
        })
        .then(function(assignmentgroup) {
            return res.json(assignmentgroup);
        })
        .catch(next);
    });

    // Return an assignment group
    router.get('/:course_id/assignmentgroups/:assignmentgroup_id', function(req, res, next) {

        var course_id = req.params.course_id;
        var assignmentgroup_id = req.params.assignmentgroup_id;

        if (!mongoose.Types.ObjectId.isValid(course_id) || !mongoose.Types.ObjectId.isValid(assignmentgroup_id)) {
            return next(errors.BAD_INPUT);
        }

        queries.getAssignmentgroupByID(assignmentgroup_id)
        .then(function(assignmentgroup) {
            return res.json(assignmentgroup);
        })
        .catch(next);
    });

    // Update an assignment group
    router.put('/:course_id/assignmentgroups/:assignmentgroup_id', function(req, res, next) {

        var course_id = req.params.course_id;
        var assignmentgroup_id = req.params.assignmentgroup_id;

        if (!mongoose.Types.ObjectId.isValid(course_id) || !mongoose.Types.ObjectId.isValid(assignmentgroup_id)) {
            return next(errors.BAD_INPUT);
        }

        var input;
        try {
            input = inputValidation.assignmentgroupValidation(req);
        } catch(error) {
            return next(error);
        }

        permission.checkIfTeacherOrAdmin(req.user.id, course_id, req.user.access)
        .then(function() {
            queries.updateAssignmentgroup(input, assignmentgroup_id)
            .then(function(assignmentgroup) {
                return res.json(assignmentgroup);
            });
        })
        .catch(next);
    });

    // Delete an assignment group
    router.delete('/:course_id/assignmentgroups/:assignmentgroup_id', function(req, res, next) {

        var course_id = req.params.course_id;
        var assignmentgroup_id = req.params.assignmentgroup_id;

        if (!mongoose.Types.ObjectId.isValid(course_id) || !mongoose.Types.ObjectId.isValid(assignmentgroup_id)) {
            return next(errors.BAD_INPUT);
        }

        return permission.checkIfTeacherOrAdmin(req.user.id, course_id, req.user.access)
        .then(function() {
            return queries.deleteAssignmentgroup(assignmentgroup_id, course_id);
        })
        .then(function(result) {
            return res.json({});
        })
        .catch(next);
    });
};
