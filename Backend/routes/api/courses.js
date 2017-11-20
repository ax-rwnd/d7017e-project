'use strict';

var request = require('request');
var mongoose = require('mongoose');
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
    router.get('/', function (req, res, next) {
        var ids = req.query.ids;

        var filter = (req.user.access === "admin")
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
    router.post('/', function (req, res, next) {
        var name = req.body.name;
        var desc = req.body.description;
        var hidden = req.body.hidden;
        var course_code = req.body.course_code;
        var enabled_features = req.body.enabled_features;
        var autojoin = req.body.autojoin;
        var teacher = req.user.id;

        // TODO: validate input
        // TODO: check permissions

        queries.createCourse(name, desc, hidden, course_code, enabled_features, autojoin, teacher).then(function (course) {
            return res.json(course);
        })
        .catch(function (err) {
            next(err);
        });
    });



    // Should be user/:userid/courses ?
    // Would force frontend to send userid. courses/me takes user id from token.
    // Frontend is most likely in possesion of userid. Therefore both is possible.
    router.get('/me', function (req, res, next) {
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
    router.get('/:course_id', function (req, res, next) {
        var roll;
        var course_id = req.params.course_id;
        var wantedFields = req.query.fields || null;

        queries.getUser(req.user.id, "teaching").then(function (userObject) {
            if (userObject.teaching.indexOf(course_id) !== -1) {
                roll = "teacher";
            } else if (req.user.access === "admin") {
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
    router.delete('/:course_id', function (req, res, next) {

    });



    router.get('/:course_id/students', function (req, res, next) {
        var course_id = req.params.course_id;

        queries.getCourseStudents(course_id, "username email").then(function (students) {
            return res.json(students);
        })
        .catch(function (err) {
            next(err);
        });
    });


    // SHOULD PROBABLY BE REMOVED
    router.put('/:course_id/students', function (req, res, next) {
        var course_id = req.params.course_id;
        var student_id = req.body.student_id;
        queries.getUser(req.user.id, "teaching")
        .then(function (userObject) {
            // admins and teachers can invite students
            if (req.user.access === "admin" || userObject.teaching.indexOf(course_id) !== -1) {
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

        queries.checkIfTeacherOrAdmin(req.user.id, course_id, req.user.admin)
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


    // TODO
    // Documentation
    // Test
    // Not accepting already pending students to course.
    // Doesn't even flag if the user have already requested to join. Intended behaviour?
    //
    // Admin or teacher of course can invite users which is not already a member of the course.
    router.post('/:course_id/students/invite', function (req, res, next) {
        var course_id = req.params.course_id;
        var student_id = req.body.student_id;

        if (!mongoose.Types.ObjectId.isValid(student_id) || !mongoose.Types.ObjectId.isValid(course_id)) {
            return next(errors.BAD_INPUT);
        }

        // First role check then
        // Already member check then
        // User exist check then
        // Invite already sent check then
        // Create Invite and add to db
        // Thrown errors will halt execution.
        queries.checkIfTeacherOrAdmin(req.user.id, course_id, req.user.admin, "students teachers")
        .then(function (courseObject) {
            return queries.checkIfUserAlreadyInCourseObject(student_id, courseObject);
        })
        .then(function () {
            return queries.checkIfUserExist(student_id);
        })
        .then(function () {
            return queries.checkIfRequestAlreadySent(student_id, course_id, "invite");
        })
        .then(function () {
            return queries.createRequestToCourse(student_id, course_id, "invite");
        })
        .then(function (inviteObject) {
            return res.sendStatus(202);
        })
        .catch(function (error) {
            return next(error);
        });
    });


    // TODO
    // Documentation
    // Test
    //
    // Caller will accept an invite to :course_id.
    // If invite exists user caller will be added as a student in the course.
    router.put('/:course_id/students/invite', function (req, res, next) {
        var course_id = req.params.course_id;


        if (!mongoose.Types.ObjectId.isValid(course_id)) {
            return next(errors.BAD_INPUT);
        }

        // First find and remove invite if it exists then
        // Add student to course
        // Thrown errors will halt execution.
        queries.findAndRemoveRequest(req.user.id, course_id, "invite")
        .then(function () {
            return queries.addCourseStudent(course_id, req.user.id);
        })
        .then(function () {
            return res.sendStatus(201);
        })
        .catch(function (error) {
            return next(error);
        });
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
                return queries.checkIfTeacherOrAdmin(req.user.id, course_id, req.user.admin)
                .then(function () {
                  return queries.findAndRemoveRequest(student_id, course_id, "invite");
                });
            }
        })
        .then(function () {
            return res.sendStatus(200);
        })
        .catch(function (error) {
            return next(error);
        });
    });
    

    // TODO
    // Documentation
    // TESTS
    //
    // Admin and teacher of course can get all current requests to join the course.
    router.get('/:course_id/students/pending', function (req, res, next) {
        var course_id = req.params.course_id;

        if (!mongoose.Types.ObjectId.isValid(course_id)) {
            return next(errors.BAD_INPUT);
        }

        queries.checkIfTeacherOrAdmin(req.user.id, course_id, req.user.admin)
        .then(function () {
            return queries.getCourseInvites(course_id, "pending");
        })
        .then(function (courseInvites) {
            return res.json(courseInvites);
        })
        .catch(function (error) {
            return next(error);
        });
    });    


    // TODO
    // Documentation
    // TEST
    //
    // A student asks to join a course. If the course got autojoin he will be added as a student to the course.
    // If course does not have autojoin a request to join will be created. 
    router.post('/:course_id/students/pending', function (req, res, next) {
        var course_id = req.params.course_id;

        if (!mongoose.Types.ObjectId.isValid(course_id)) {
            return next(errors.BAD_INPUT);
        }

        // First check if user already in course then
        // Check if course got autojoin
        // If autojoin add student to course
        // If not autojoin then
        // Check if already asked to join then
        // Create join request
        // Thrown errors will halt execution
        queries.checkIfUserAlreadyInCourse(req.user.id, course_id, "autojoin")
        .then(function (courseObject) {
            if (!courseObject.autojoin) {
                return queries.checkIfRequestAlreadySent(req.user.id, course_id, "pending")
                .then(function () {
                    return queries.createRequestToCourse(req.user.id, course_id, "pending");
                })
                .then(function () {
                    return res.sendStatus(202);
                });
            } else {
                queries.addCourseStudent(course_id, req.user.id)
                .then(function () {
                    res.sendStatus(201);
                });
            }
        })
        .catch(function (error) {
            return next(error);
        });
    });


    // TODO
    // Documentation
    // TEST
    //
    // Admin or teacher can accept an request to join the course.
    router.put('/:course_id/students/pending', function (req, res, next) {
        var course_id = req.params.course_id;
        var student_id = req.body.student_id;

        if (!mongoose.Types.ObjectId.isValid(student_id) || !mongoose.Types.ObjectId.isValid(course_id)) {
            return next(errors.BAD_INPUT);
        }

        // First check if admin or teacher then
        // Check if request exists if so remove it then
        // Add user to course
        // Thrown errors will halt execution
        queries.checkIfTeacherOrAdmin(req.user.id, course_id, req.user.admin)
        .then(function () {
            return queries.findAndRemoveRequest(student_id, course_id, "pending");
        })
        .then(function () {
            return queries.addCourseStudent(course_id, student_id);
        })
        .then(function () {
            return res.sendStatus(200);
        })
        .catch(function (error) {
            return next(error);
        });
    });


    // TODO
    // Documentation
    // TESTS
    //
    // User can revoke his request to join the course.
    // Admin and teachers of course can decline a request.
    router.delete('/:course_id/students/pending', function (req, res, next) {
        var course_id = req.params.course_id;
        var student_id = req.body.student_id;

        if (!student_id) {
            student_id = req.user.id;
        }
        if (!mongoose.Types.ObjectId.isValid(student_id) || !mongoose.Types.ObjectId.isValid(course_id)) {
            return next(errors.BAD_INPUT);
        }

        // If revoking own request then
        // Remove request
        //
        // If decline request then
        // Check if admin or teacher then
        // Find and remove request.
        queries.returnPromiseForChainStart()
        .then(function () {
            if (student_id === req.user.id) {
                return queries.findAndRemoveRequest(student_id, course_id, "pending")
                .then(function () {
                    return res.sendStatus(200);
                });
            } else {
                return queries.checkIfTeacherOrAdmin(req.user.id, course_id, req.user.admin)
                .then(function () {
                    return queries.findAndRemoveRequest(student_id, course_id, "pending");
                })
                .then(function () {
                    return res.sendStatus(201);
                });
            }
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
                    return res.sendStatus(200);
                });
            } else {
                return queries.checkIfTeacherOrAdmin(req.user.id, course_id, req.user.admin)
                .then(function () {
                    return queries.removeStudentFromCourse(student_id, course_id);
                })
                .then(function () {
                    return res.sendStatus(200);
                });
            }
        })
        .catch(function (error) {
            return next(error);
        });
    });


    router.get('/:course_id/teachers', function (req, res, next) {
        var course_id = req.params.course_id;

        queries.getCourseTeachers(course_id, "username email").then(function (teachers) {
            return res.json(teachers);
        })
        .catch(function (err) {
            next(err);
        });
    });


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

        queries.checkIfTeacherOrAdmin(req.user.id, course_id, req.user.admin, "students teachers")
        .then(function (courseObject) {
            return queries.checkIfUserInCourseAndNotTeacherObject(teacher_id, courseObject);
        })
        .then(function () {
            return queries.addTeacherToCourse(teacher_id, course_id);
        })
        .then(function () {
            return res.sendStatus(201);
        })
        .catch(function (error) {
            return next(error);
        });
    });

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

        queries.checkIfTeacherOrAdmin(req.user.id, course_id, req.user.admin)
        .then(function (courseObject) {
            return queries.checkIfUserIsTeacherObject(teacher_id, courseObject);
        })
        .then(function () {
            return queries.removeTeacherFromCourse(teacher_id, course_id);
        })
        .then (function () {
            return res.sendStatus(200);
        })
        .catch(function (error) {
            return next(error);
        });
    });


    router.get('/:course_id/assignments', function (req, res, next) {
        var course_id = req.params.course_id;

        queries.getCourseAssignments(course_id, "name description hidden languages").then(function (assignments) {
            return res.json(assignments);
        })
        .catch(function (err) {
            next(err);
        });
    });

    router.post('/:course_id/assignments', function (req, res, next) {
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

    router.get('/:course_id/assignments/:assignment_id', function (req, res, next) {
        var roll;
        var course_id = req.params.course_id;
        var assignment_id = req.params.assignment_id;
        var wantedFields = req.query.fields || null;

        queries.getUser(req.user.id, "teaching").then(function (userObject) {
            if (userObject.teaching.indexOf(course_id) !== -1) {
                roll = "teacher";
            } else if (req.user.access === "admin") {
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

    //Submit code to tester
    router.post('/:course_id/assignments/:assignment_id/submit', function(req, res) {

        var lang = req.body.lang;
        var code = req.body.code;
        var assignment_id = req.params.assignment_id;

        testerCom.validateCode(req.user.id, lang, code, assignment_id, res);
    });

    // Save draft to assignment
    // course_id not used, should route be changed? Implement some check?
    router.post('/:course_id/assignments/:assignment_id/save', function (req, res, next) {
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
    router.get('/:course_id/assignments/:assignment_id/draft', function (req, res, next) {
        var assignment_id = req.params.assignment_id;

        queries.getCode(req.user.id, assignment_id).then(function (draft) {
            res.json(draft);
        })
        .catch(function (err) {
            next(err);
        });
    });

    router.get('/:course_id/assignments/:assignment_id/tests', function (req, res, next) {
        var course_id = req.params.course_id;
        var assignment_id = req.params.assignment_id;
        res.send("/courses/" + course_id + "/assignments/" + assignment_id + "/tests GET Endpoint");
    });

    router.post('/:course_id/assignments/:assignment_id/tests', function (req, res, next) {
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

    router.get('/:course_id/assignments/:assignment_id/tests/:test_id', function (req, res, next) {
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

    router.get('/:course_id/enabled_features', function(req, res, next) {
        queries.getCoursesEnabledFeatures(req.params.course_id).then(function (enabled_features) {
            res.json(enabled_features);
        }).catch(next);
    });
};
