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

    // Get all courses in db
    // If admin get all
    // If teacher or student get all not hidden courses.
    // Also get hidden courses if teacher/student of it?

    router.get('/', function (req, res, next) {
        var ids = req.query.ids;

        var filter = (req.user.access === constants.ACCESS.ADMIN)
            ? ADMIN_FILTER
            : BASIC_FILTER;

        if (!ids) {
            queries.getCourses(filter, req.user.access).then(function (courses) {
                return res.json({courses: courses});
            })
            .catch(function (err) {
                next(err);
            });
        } else {
            var id_array = ids.split(',');
            queries.getCourses(filter, req.user.access, id_array).then(function (courses) {
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

    // TODO:
    // Tests
    // Documentation
    // Query param to query multiple courses?
    //
    // Returns BASE_FIELDS of every course in db.
    // If course is "hidden" only Admin and members of the course can see it.
/*
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
*/


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
            return res.status(201).json(course);
        })
        .catch(function (err) {
            next(err);
        });
    });


/*
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
                    return queries.saveCourseObject(input);
                });
        } else {
            p = queries.saveCourseObject(input);
        }
        p.then(function (savedCourse) {
            return res.status(201).json(savedCourse);
        })
        .catch(next);
    });
*/

    // SHOULD BE REMOVED
    router.get('/me', function (req, res, next) {
        logger.log('warn', '/api/courses/me is deprecated. Use /api/users/me/courses instead.');
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

    // Deletes course with id :course_id
    // Only admin and teacher of course can delete course
    router.delete('/:course_id', function (req, res, next) {
        var course_id = req.params.course_id;
        if (!mongoose.Types.ObjectId.isValid(course_id)) {
            return next(errors.BAD_INPUT);
        }
        queries.checkIfTeacherOrAdmin(req.user.id, course_id, req.user.access)
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
        let course_id = req.params.course_id;
        if (!mongoose.Types.ObjectId.isValid(course_id)) {
            return next(errors.BAD_INPUT);
        }

        let b = req.body;
        let clean_b = {};
        if (b.hasOwnProperty('course_code')) clean_b.course_code = b.course_code;
        if (b.hasOwnProperty('name')) clean_b.name = b.name;
        if (b.hasOwnProperty('description')) clean_b.description = b.description;
        if (b.hasOwnProperty('hidden')) clean_b.hidden = b.hidden;
        if (b.hasOwnProperty('autojoin')) clean_b.autojoin = b.autojoin;
        // note that ALL fields in enabled_features are allowed
        if (b.hasOwnProperty('enabled_features')) clean_b.enabled_features = b.enabled_features;

        queries.checkIfTeacherOrAdmin(req.user.id, course_id, req.user.access)
        .then(() => {
            return queries.updateCourse(course_id, clean_b);
        }).then(() => {
            // send an empty response
            res.json({});
        }).catch(next);
    });

/*
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
*/

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
            if (req.user.access === constants.ACCESS.ADMIN || userObject.teaching.indexOf(course_id) !== -1) {
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

        queries.checkIfTeacherOrAdmin(req.user.id, course_id, req.user.access)
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
        queries.checkIfTeacherOrAdmin(req.user.id, course_id, req.user.access, "students teachers")
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
            return res.sendStatus(202).json({});
        })
        .catch(function (error) {
            return next(error);
        });
    });

/*
    // TODO:
    // Tests
    // Documentation
    //
    //
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
*/

    // TODO
    // Documentation
    // Test
    //
    // Caller will accept an invite to :course_id.
    // If invite exists user caller will be added as a student in the course.
    router.put('/:course_id/members/invite', function (req, res, next) {
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
            return res.sendStatus(201).json({});
        })
        .catch(function (error) {
            return next(error);
        });
    });


/*
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
*/
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
                return queries.checkIfTeacherOrAdmin(req.user.id, course_id, req.user.access)
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
    // Documentation
    // TESTS
    //
    // Admin and teacher of course can get all current requests to join the course.
    router.get('/:course_id/students/pending', function (req, res, next) {
        var course_id = req.params.course_id;

        if (!mongoose.Types.ObjectId.isValid(course_id)) {
            return next(errors.BAD_INPUT);
        }

        queries.checkIfTeacherOrAdmin(req.user.id, course_id, req.user.access)
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
                    return res.sendStatus(202).json({});
                });
            } else {
                queries.addCourseStudent(course_id, req.user.id)
                .then(function () {
                    return res.sendStatus(201).json({});
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
        queries.checkIfTeacherOrAdmin(req.user.id, course_id, req.user.access)
        .then(function () {
            return queries.findAndRemoveRequest(student_id, course_id, "pending");
        })
        .then(function () {
            return queries.addCourseStudent(course_id, student_id);
        })
        .then(function () {
            return res.sendStatus(200).json({});
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
                    return res.sendStatus(200).json({});
                });
            } else {
                return queries.checkIfTeacherOrAdmin(req.user.id, course_id, req.user.access)
                .then(function () {
                    return queries.findAndRemoveRequest(student_id, course_id, "pending");
                })
                .then(function () {
                    return res.sendStatus(201).json({});
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
                    return res.sendStatus(200).json({});
                });
            } else {
                return queries.checkIfTeacherOrAdmin(req.user.id, course_id, req.user.access)
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


    router.get('/:course_id/teachers', function (req, res, next) {
        var course_id = req.params.course_id;

        queries.getCourseTeachers(course_id, constants.FIELDS.TEACHERS.BASE_FIELDS).then(function (teachers) {
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

        queries.checkIfTeacherOrAdmin(req.user.id, course_id, req.user.access, "students teachers")
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

        queries.checkIfTeacherOrAdmin(req.user.id, course_id, req.user.access)
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

    // Return all assignemnts from a course
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
        var languages = req.body.languages;

        queries.createAssignment(name, desc, hidden, languages, course_id).then(function (assignment) {
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

    router.get('/:course_id/invitelink', function (req, res, next) {
        var course_id = req.params.course_id;

        queries.checkIfTeacherOrAdmin(req.user.id, course_id, req.user.access).then(function () {
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
            res.status(201).json(draft);
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

    // Get tests belonging to a specific assingment
    router.get('/:course_id/assignments/:assignment_id/tests', function (req, res, next) {
        var course_id = req.params.course_id;
        var assignment_id = req.params.assignment_id;

        if (!mongoose.Types.ObjectId.isValid(assignment_id) || !mongoose.Types.ObjectId.isValid(course_id)) {
            return next(errors.BAD_INPUT);
        }

        permission.checkIfTeacherOrAdmin(req.user.id, course_id, req.user.access)
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
        var lint = req.body.lint;

        if (!mongoose.Types.ObjectId.isValid(assignment_id) || !mongoose.Types.ObjectId.isValid(course_id) || !typecheck.isString(stdout) || !typecheck.isString(stdin) || !Array.isArray(args)) {
            return next(errors.BAD_INPUT);
        }

        permission.checkIfTeacherOrAdmin(req.user.id, course_id, req.user.access)
        .then(function () {
            return queries.createTest(stdout, stdin, args, lint, assignment_id);
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

        permission.checkIfTeacherOrAdmin(req.user.id, course_id, req.user.access)
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

        permission.checkIfTeacherOrAdmin(req.user.id, course_id, req.user.access)
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
        .then(res.json)
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
        .then(res.json)
        .catch(next);
    });

    // Create badge
    router.post('/:course_id/badges', function (req, res, next) {

        var course_id = req.params.course_id;

        if (!mongoose.Types.ObjectId.isValid(course_id)) {
            return next(errors.BAD_INPUT);
        }

        req.body.course_id = course_id;

        return features.createBadge(req.body)
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

        // TODO
        return res.sendStatus(501);
    });

    // Get all assignmentgroups of a course
    router.get('/:course_id/assignmentgroups', function(req, res, next) {

        var course_id = req.params.course_id;

        if (!mongoose.Types.ObjectId.isValid(course_id)) {
            return next(errors.BAD_INPUT);
        }

    });

    // Create an assignment group
    router.post('/:course_id/assignmentgroups', function(req, res, next) {

        var course_id = req.params.course_id;

        if (!mongoose.Types.ObjectId.isValid(course_id)) {
            return next(errors.BAD_INPUT);
        }

    });

    // Return an assignment group
    router.get('/:course_id/assignmentgroups/:assignmentgroup_id', function(req, res, next) {

        var course_id = req.params.course_id;
        var assignmentgroup_id = req.params.assignmentgroup_id;

        if (!mongoose.Types.ObjectId.isValid(course_id) || !mongoose.Types.ObjectId.isValid(course_id)) {
            return next(errors.BAD_INPUT);
        }

    });

    // Update an assignment group
    router.put('/:course_id/assignmentgroups/:assignmentgroup_id', function(req, res, next) {

        var course_id = req.params.course_id;
        var assignmentgroup_id = req.params.assignmentgroup_id;

        if (!mongoose.Types.ObjectId.isValid(course_id) || !mongoose.Types.ObjectId.isValid(course_id)) {
            return next(errors.BAD_INPUT);
        }

    });

    // Delete an assignment group
    router.delete('/:course_id/assignmentgroups/:assignmentgroup_id', function(req, res, next) {

        var course_id = req.params.course_id;
        var assignmentgroup_id = req.params.assignmentgroup_id;

        if (!mongoose.Types.ObjectId.isValid(course_id) || !mongoose.Types.ObjectId.isValid(course_id)) {
            return next(errors.BAD_INPUT);
        }

    });
};
