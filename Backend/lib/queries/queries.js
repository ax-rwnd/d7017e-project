'use strict';

var schemas = require('../../models/schemas.js');
var Assignment = require('../../models/schemas').Assignment;
var Course = require('../../models/schemas').Course;
var CourseMember = require('../../models/schemas').CourseMembers;
var Test = require('../../models/schemas').Test;
var User = require('../../models/schemas').User;
var Draft = require('../../models/schemas').Draft;
var JoinRequest = require('../../models/schemas').JoinRequests;
var Badge = require('../../models/schemas').Badge;
var Feature = require('../../models/schemas').Features;
var InviteLink = require('../../models/schemas').InviteLinks;
var Features = require('./features.js');
var Assignmentgroup = require('../../models/schemas').Assignmentgroup;

var errors = require('../errors.js');
var mongoose = require('mongoose');
var logger = require('../logger.js');
var jwt = require('jsonwebtoken');
var config = require('config');
var constants = require('../constants.js');
var randomstring = require('randomstring');
var features = require('./features.js');

/* MOVED TO LIB/CONSTANTS.JS
const FIELDS = {
    USER: {
        MODEL: require('../../models/schemas').User,
        BASE_FIELDS: "username email admin access courses teaching providers",
        ADMIN: "username email admin access courses teaching providers",
        TEACHER: "username email admin access courses teaching providers",
        STUDENT: "username email admin access courses teaching providers",
        POPULATE_FIELDS: "courses teaching"
    },
    COURSE: {
        MODEL: require('../../models/schemas').Course,
        BASE_FIELDS: "course_code name description",
        ADMIN: "course_code name description autojoin teachers students invited pending assignments",
        TEACHER: "course_code name description autojoin teachers students invited pending assignments",
        STUDENT: "course_code name description assignments",
        POPULATE_FIELDS: "teachers students assignments"
    },
    TEACHERS: {
        BASE_FIELDS: "username email"
    },
    ASSIGNMENTS: {
        MODEL: require('../../models/schemas').Assignment,
        BASE_FIELDS: "name description",
        ADMIN: "name description tests optional_tests languages",
        TEACHER: "name description tests tests.io tests.lint optional_tests optional_tests.io optional_tests.lint languages",
        STUDENT: "name description languages",
        POPULATE_FIELDS: "tests.io optional_tests.io"
    },
    STUDENTS: {
        BASE_FIELDS: "username description"
    },
    'TESTS.IO': {
        MODEL: require('../../models/schemas').Test,
        BASE_FIELDS: "stdout stdin args",
        POPULATE_FIELDS: ""
    },
    'OPTIONAL_TESTS.IO': {
        MODEL: require('../../models/schemas').Test,
        BASE_FIELDS: "stdout stdin args",
        POPULATE_FIELDS: ""
    },
    TEACHING: {
        BASE_FIELDS: "course_code name description"
    },
    COURSES: {
        BASE_FIELDS: "course_code name description"
    }
};*/

// var Assignment, User, Test = require('../../models/schemas.js');

//get all tests related to a specific assignment.
function getTestsFromAssignment(assignmentID) {
    return Assignment.findById(assignmentID, "tests")
    .populate({
        path: 'tests.io',
        model: 'Test'
    }).populate({
        path: 'optional_tests.io',
        model: 'Test'
    })
    .lean()
    .then(function (assignment) {
        if (!assignment) {
            throw errors.ASSIGNMENT_DOES_NOT_EXIST;
        }
        var tests = {'tests':assignment.tests, 'optional_tests':assignment.optional_tests};
        return tests;
    });


}

function getUser(id, fields) {
    // CHANGE TO USE CONSTANTS.JS INSTEAD
    var wantedFields = fields || "username email admin tokens courses teaching providers";
    // Check validity of id
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw errors.INVALID_ID;
    }
    return User.findById(id, wantedFields).then(function (user) {
        if (!user) {
            logger.log("User not found");
            throw errors.USER_NOT_FOUND;
        }
        return user;
    });
}

function getUserPopulated(user_id, roll, fields) {
    var wantedFields = fields || constants.FIELDS.USER[roll.toUpperCase()];
    wantedFields = wantedFields.replace(/,/g, " ");

    return User.findById(user_id, wantedFields)
    .then(function (userObject) {
        if (!userObject) {
            throw errors.USER_NOT_FOUND;
        }
        return populateObject(userObject, "user", wantedFields)
        .then(function(populatedUser) {
            return populatedUser[0];
        });
    });
}

function getUsers(id_array, fields) {
    // CHANGE TO USE CONSTANTS.JS INSTEAD
    var wantedFields = fields || "username email admin tokens courses teaching providers";
    var promises = [];
    for (var i = 0; i < id_array.length; i++) {
        // Check validity of id
        if (!mongoose.Types.ObjectId.isValid(id_array[i])) {
            throw errors.INVALID_ID;
        }
        // Make a promise for each id
        var temp = User.findById(id_array[i], wantedFields).then(function (user) {
            if (!user) {
                throw errors.USER_NOT_FOUND;
            }
            return user;
        });
        promises.push(temp); // Gather all promises in an array
    }
    return Promise.all(promises);
}

function deleteUser(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
            throw errors.INVALID_ID;
    }
    return User.findById(id).then(function (user) {
        if (!user) {
            throw errors.USER_NOT_FOUND;
        }
        User.deleteOne(user, function (err) {
            return err;
        });
    });
}

function setRefreshToken(userObject, token) {
    // Iterate through refresh token array and remove expired tokens
    var i = userObject.tokens.length;
    while (i--) {
        jwt.verify(userObject.tokens[i], config.get('App.secret'), function(err, payload) {
            if (err) {
                if (err.name === "TokenExpiredError") {
                    userObject.tokens.splice(i, 1);
                }
            }
        });
    }

    userObject.tokens.push(token);
    userObject.save().then(function (updatedUser) {
        console.log("Ref token saved");
    });
}

function removeRefreshToken(userid, token) {
    getUser(userid, "tokens").then(function (userObject) {
        var index = userObject.tokens.indexOf(token);
        if (index > -1) {
            userObject.tokens.splice(index, 1);
            userObject.save().then(function (updatedUser) {
                console.log("Token removed");
            });
        }
    });
}

/*
function getUser(id) {
    return new Promise(function (resolve, reject) {
        User.findById(id, "username email courses admin", function (err, user) {
            if (err) {
                reject(err);
            }
            if (!user) {
                reject("User doesn't exist");
            } else {
                console.log("Found user " + user);
                resolve(user);
            }
        });
    });
}
*/

function findOrCreateUser(profile) {
    var username = profile.username;
    var email = profile.email || "";
    var admin = profile.admin || false;
    var access = profile.access || "basic";
    return User.findOne({username: username}).then(function (user) {
        if (!user) {
            var newUser = new User({username: username, email: email, admin: admin, access: access, courses: [], tokens: []});
            return newUser.save().then(function (createdUser) {
                if (!createdUser) {
                    console.log("Error: User not created");
                }
                return createdUser;
            });
        }
        return user;
    });
}



function getCourses(fields, access, id_array) {
    // CHANGE TO USE CONSTANTS.JS INSTEAD
    var wantedFields = fields || "name description hidden teachers students assignments";
    var admin = (access === constants.ACCESS.ADMIN);
    if (!id_array){
       if (admin) {
            return Course.find({}, wantedFields).then(function (courseList) {
                if (!courseList) {
                    throw errors.NO_COURSES_EXISTS;
                }
                return courseList;
            });
        } else {
            return Course.find({'hidden': false}, wantedFields).then(function (courseList) {
                if (!courseList) {
                    throw errors.NO_COURSES_EXISTS;
                }
                return courseList;
            });
        }
    } else {
        var promises = [];
        var query = (admin === true)
            ? {}
            : {hidden: false};

        for (var i = 0; i < id_array.length; i++) {
            // Check validity of id
            if (!mongoose.Types.ObjectId.isValid(id_array[i])) {
                throw errors.INVALID_ID;
            }
            query._id = id_array[i];
            var temp = Course.findOne(query, wantedFields).then(function (course) {
                if (!course) {
                    throw errors.COURSE_DOES_NOT_EXIST;
                }
                return course;
            });
            promises.push(temp); // Gather all promises in an array
        }
        return Promise.all(promises);
    }
}

function checkIfUserExist(user_id) {
    if (!mongoose.Types.ObjectId.isValid(user_id)) {
            throw errors.INVALID_ID;
    }
    return User.count({_id: user_id})
    .then(function(count) {
        if (count === 0) {
            throw errors.USER_NOT_FOUND;
        }
    });
}

// Checks if user_id is teacher in course_id.
// If user is teacher of course, will return courseobject with teachers field and all optionalCourseFields
function checkIfTeacherOrAdmin(user_id, course_id, access, optionalCourseFieldsToReturn) {
    var admin = (access === constants.ACCESS.ADMIN);
    return Course.findById(course_id, "teachers" + ("" || " " + optionalCourseFieldsToReturn))
    .then(function (courseObject) {
        if (!courseObject) {
            throw errors.COURSE_DOES_NOT_EXIST;
        }
        if (!(courseObject.teachers.indexOf(user_id) !== -1 || admin)) {
            throw errors.INSUFFICIENT_PERMISSION;
        }
        return courseObject;
    });
}

// Checks if user_id is already enrolled in a course(student or teacher).
// If user already in course will throw error.
function checkIfUserAlreadyInCourseObject(user_id, courseObject) {
    if (courseObject.students.indexOf(user_id) !== -1
    || courseObject.teachers.indexOf(user_id) !== -1) {
        throw errors.USER_ALREADY_IN_COURSE;
    }
}

// Same as checkIfUserNotInCourseObject but queries the course fields Teachers and Students.
function checkIfUserAlreadyInCourse(user_id, course_id, optionalCourseFieldsToReturn) {
    return Course.findById(course_id, "teachers students" + ("" || " " + optionalCourseFieldsToReturn))
    .then(function (courseObject) {
        if (courseObject.students.indexOf(user_id) !== -1
        || courseObject.teachers.indexOf(user_id) !== -1) {
            throw errors.USER_ALREADY_IN_COURSE;
        }
        return courseObject;
    });
}

function checkIfRequestAlreadySent(user_id, course_id, type) {
    return JoinRequest.count({inviteType: type, user: user_id, course: course_id})
    .then(function (count) {
        if (count !== 0) {
            throw errors.INVITE_ALREADY_SENT;
        }
    });
}

function createRequestToCourse(user_id, course_id, type) {
    var invite = new JoinRequest({inviteType: type, user: user_id, course: course_id});
    return invite.save();
}

function findAndRemoveRequest(user_id, course_id, type) {
    return JoinRequest.findOneAndRemove({inviteType: type, user: user_id, course: course_id})
    .then(function(deletedInvite) {
        if (!deletedInvite) {
            throw errors.NO_INVITE_FOUND;
        }
    });
}

function checkIfUserInCourseAndNotTeacherObject(user_id, courseObject) {
    if (courseObject.teachers.indexOf(user_id) !== -1) {
        throw errors.USER_IS_ALREADY_TEACHER;
    }
    if (courseObject.students.indexOf(user_id) === -1) {
        throw errors.USER_NOT_IN_COURSE;
    }
}

function checkIfUserIsTeacherObject(user_id, courseObject) {
    if (courseObject.teachers.indexOf(user_id) === -1) {
        throw errors.USER_IS_NOT_TEACHER;
    }
}

function addTeacherToCourse(user_id, course_id) {
    return Course.update(
        {_id: course_id},
        {$addToSet: {teachers: user_id}, $pull: {students: user_id}},
        {runValidators: true}
    )
    .then(function() {
        return User.update(
            {_id: user_id},
            {$addToSet: {teaching: course_id}, $pull: {courses: course_id}},
            {runValidators: true}
        );
    });
}

function removeTeacherFromCourse(user_id, course_id) {
    return Course.update(
        {_id: course_id},
        {$addToSet: {students: user_id}, $pull: {teachers: user_id}},
        {runValidators: true}
    )
    .then(function() {
        return User.update(
            {_id: user_id},
            {$addToSet: {courses: course_id}, $pull: {teaching: course_id}},
            {runValidators: true}
        );
    });
}

function removeStudentFromCourse(user_id, course_id) {
    return Course.update(
        {_id: course_id},
        {$pull: {students: user_id}},
        {runValidators: true}
    ).then(function (updated) {
        if (updated.nModified === 0) {
            throw errors.USER_IS_NOT_STUDENT;
        }
        return User.update(
            {_id: user_id},
            {$pull: {courses: course_id}},
            {runValidators: true}
        );
    });
}

function deleteTest(test_id, assignment_id) {
    return Assignment.update(
        {_id: assignment_id},
        {$pull: {'tests.io': test_id}},
        {runValidators: true}
    ).then(function (updated) {
        if (updated.nModified === 0) {
            throw errors.TEST_NOT_IN_ASSIGNMENT;
        }
        return Test.findOneAndRemove({_id: test_id})
        .then(function(test) {
            if (!test) {
                throw errors.TEST_DOES_NOT_EXIST;
            }
            return test;
        });
    });
}


function getCourseInvites(course_id, type) {
    if (type) {
        return JoinRequest.find({inviteType: type, course: course_id}, "inviteType user -_id").populate("user", "username email");
    } else {
        return JoinRequest.find({course: course_id}, "inviteType user -_id").populate("user", "username email");
    }
}

function getUserInvites(user_id, type) {
    if (type) {
        return JoinRequest.find({inviteType: type, user: user_id}, "inviteType course -_id").populate("course", "name course_code");
    } else {
        return JoinRequest.find({user: user_id}, "inviteType course -_id").populate("course", "name course_code");

    }
}

function getInvitesCourseUser(user_id, course_id) {
    return JoinRequest.find({user: user_id, course: course_id});
}

function returnPromiseForChainStart() {
    return new Promise(function (resolve) {
        resolve();
    });
}

function createCourse(name, description, hidden, course_code, enabled_features, autojoin, teacher) {
    course_code = course_code || '';
    enabled_features = enabled_features || {};
    autojoin = autojoin || false;
    var teachers = [teacher];
    var newCourse = new Course({name: name, description: description, course_code: course_code, hidden: hidden, autojoin: autojoin, teachers: teachers, students: [], assignments: [], features: [], enabled_features: enabled_features});
    return newCourse.save().then(function (createdCourse) {
        if (!createdCourse) {
            throw errors.COURSE_NOT_CREATED;
        }
        return User.update(
            {_id: teacher},
            {$addToSet: {teaching: createdCourse._id}},
            {runValidators: true}
        ).then(_ => createdCourse);
    });
}

function updateCourse(id, set_props) {
    return Course.findById(id, "course_code name description hidden autojoin enabled_features").then(function (course) {
        if (!course) {
            throw errors.COURSE_DOES_NOT_EXIST;
        }

        return Course.update(
            {_id: id},
            {$set: set_props},
            {runValidators: true}
        ).then(raw => {
            // check if the course update was ok
            if (raw.ok !== 1) {
                throw errors.FAILED_TO_UPDATE_COURSE;
            // check if the course existed
            } else if (raw.n === 0) {
                throw errors.COURSE_DOES_NOT_EXIST;
            }
        });
    });
}

function deleteCourse(id) {
    return Course.findOneAndRemove({_id: id})
    .then(course => {
        if (!course) {
            throw errors.COURSE_DOES_NOT_EXIST;
        }

        // assignments
        let promises = course.assignments
            .map(aid => {
                return deleteAssignment(aid)
                // ignore error when assignment doesn't exist
                .catch(()=>{});
            });
        // assignmentgroups
        promises.push(course.assignmentgroups
            .map(aid => {
                return deleteAssignmentgroup(aid, course._id)
                // ignore error when assignment doesn't exist
                .catch(()=>{});
            }));
        // members
        promises.push(deleteCourseMembers(course._id));
        // join requests
        promises.push(JoinRequest.remove({course: course._id}));
        // invite links
        promises.push(InviteLink.remove({course: course._id}));
        // badges
        promises.push(Badge.remove({course_id: course._id}));

        return Promise.all(promises);
    });
}

function deleteCourseMembers(course_id) {
    return CourseMember.find({course: course_id})
    .then(members => {
        let p = members.map(m => Feature.remove({_id: m.features}));
        p.concat(members.map(m => m.remove()));
        return Promise.all(p);
    });
}

function deleteAssignment(assignment_id, course_id) {
    return Assignment.findOneAndRemove({_id: assignment_id})
    .then(ass => {
        if (!ass) {
            throw errors.ASSIGNMENT_DOES_NOT_EXIST;
        }
        // tests
        let allTests = ass.tests.io.concat(ass.optional_tests.io);
        let del_tests = Test.remove({_id: {$in: allTests}});
        // drafts
        let del_drafts = Draft.remove({assignment: ass._id});
        // assignmentgroups
        let del_fromAssignmentgroups = Course.findById(course_id, 'assignmentgroups')
        .populate({path: 'assignmentgroups', model: 'Assignmentgroup'})
        .then(function(course) {
            for(let assignmentgroup of course.assignmentgroups) {
                assignmentgroup.assignments = assignmentgroup.assignments.filter(assignment => assignment.assignment != assignment_id);
                return assignmentgroup.save();
            }
        });

        return Promise.all([del_tests, del_drafts, del_fromAssignmentgroups]);
    });
}

function getUserTeacherCourses(id, fields) {
    var wantedFields = fields || "name description hidden teachers students assignments course_code";

    return User.findById(id, "teaching").populate("teaching", wantedFields).then(function (courseList) {
        if (!courseList) {
            throw errors.NO_COURSES_EXISTS;
        }
        return courseList;
    });
}

function getCourseStudents(id, fields) {
    var wantedFields = fields || "username email admin courses providers";

    return Course.findById(id, "students").populate("students", wantedFields).then(function (studentList) {
        if (!studentList) {
            throw errors.NO_STUDENTS_EXISTS;
        }
        return studentList;
    });
}

// Adds a student to a course. Because of the database schema,
// the user document receives a reference to the course AND
// the course document receives a reference to the user.
// In Mongo, we get per-document atomicity.
function addCourseStudent(course_id, student_id) {
    return User.count({_id: student_id})
    .then(count => {
        if (count === 0) {
            // TODO use an APIError
            throw new Error('No such student');
        }
        return Course.update(
            {_id: course_id},
            {$addToSet: {students: student_id}},
            {runValidators: true}
        );
    }).then(function (raw) {
        // check if the course update was ok
        if (raw.ok !== 1) {
            // TODO: make a real error message!
            throw new Error('Mongo error: failed to add to user.courses');
        // check if the course existed
        } else if (raw.n === 0) {
            throw errors.COURSE_DOES_NOT_EXIST;
        }
        return User.update(
            {_id: student_id},
            {$addToSet: {courses: course_id}},
            {runValidators: true}
        );
    }).then(function(raw) {
        // check if the user update was ok
        if (raw.ok === 1) {
            return true;
        } else {
            // TODO: make a real error message!
            throw new Error('Mongo error: failed to add to user.courses');
        }
    });
}

function getCourseTeachers(id, fields) {
    var wantedFields = fields || "username email admin courses providers";

    return Course.findById(id, "teachers").populate("teachers", wantedFields).then(function (teacherList) {
        if (!teacherList) {
            throw errors.NO_TEACHERS_EXISTS;
        }
        return teacherList;
    });
}

function getCourseAssignments(id, fields) {
    var wantedFields = fields || "name description hidden tests optional_tests languages";

    return Course.findById(id, "assignments").populate("assignments", wantedFields).then(function (assignmentList) {
        if (!assignmentList) {
            throw errors.NO_ASSINGMENTS_EXISTS;
        }
        return assignmentList;
    });
}

function getAssignment(assignment_id, roll, fields) {
    var wantedFields = fields || constants.FIELDS.ASSIGNMENTS[roll.toUpperCase()];
    wantedFields = wantedFields.replace(/,/g, " ");

    return Assignment.findById(assignment_id, wantedFields)
    .then(function (assignment) {
        if (!assignment) {
            throw errors.ASSIGNMENT_DOES_NOT_EXIST;
        }

        return populateObject(assignment, "assignments", wantedFields)
        .then(function(populatedAssignment) {
            return populatedAssignment[0];
        });
    });
}


/*
function getAssignment(id, fields) {
    var wantedFields = fields || "name description hidden tests optional_tests languages";

    return Assignment.findById(id, fields).then(function (assignment) {
        if (!assignment) {
            throw errors.ASSIGNMENT_DOES_NOT_EXIST;
        }
        return assignment;
    });
}
*/

function updateAssignment(id, set_props) {
    return Assignment.findById(id, "name description hidden languages").then(function (assignment) {
        if (!assignment) {
            throw errors.ASSIGNMENT_DOES_NOT_EXIST;
        }

        return Assignment.update(
            {_id: id},
            {$set: set_props},
            {runValidators: true}
        ).then(raw => {
            // check if the assignemt update was ok
            if (raw.ok !== 1) {
                throw errors.FAILED_TO_UPDATE_ASSIGNMENT;
            // check if the assignment existed
            } else if (raw.n === 0) {
                throw errors.ASSIGNMENTT_DOES_NOT_EXIST;
            }
        });
    });
}

function getTest(id, fields) {
    var wantedFields = fields || "stdout stdin args";

    return Test.findById(id, fields).then(function (test) {
        if (!test) {
            throw errors.TEST_DOES_NOT_EXIST;
        }
        return test;
    });
}

function updateTest(id, set_props) {
    return Test.findById(id, "stdout stdin args").then(function (test) {
        if (!test) {
            throw errors.TEST_DOES_NOT_EXIST;
        }

        return Test.update(
            {_id: id},
            {$set: set_props},
            {runValidators: true}
        ).then(raw => {
            // check if the test update was ok
            if (raw.ok !== 1) {
                throw errors.FAILED_TO_UPDATE_TEST;
            // check if the test existed
            } else if (raw.n === 0) {
                throw errors.TEST_DOES_NOT_EXIST;
            }
        });
    });
}

function getAssignmentTests(course_id, assignment_id) {
    return Assignment.findById(assignment_id, "tests").populate("tests.io")
    .then(function (assignmentObject) {
        if (!assignmentObject) {
            throw errors.ASSIGNMENT_DOES_NOT_EXIST;
        }
        return assignmentObject;
    });
}

function createAssignment(course_id, props) {
    var newAssignment = new Assignment({
        name: props.name,
        description: props.description,
        hidden: props.hidden, tests: {
            io: props.tests.io,
            lint: props.tests.lint
        },
        optional_tests: {
            io: props.optional_tests.io,
            lint: props.optional_tests.lint
        },
        languages: props.languages
    });
    return newAssignment.save().then(function (createdAssignment) {
        if (!createdAssignment) {
            throw errors.ASSINGMENT_NOT_CREATED;
        }
        //Push createdAssignment _id into course_id's assignments
        return Course.findById(course_id).then( function (course) {
            if (!course) {
                throw errors.COURSE_DOES_NOT_EXIST;
            }
            return Course.update(
                { _id: course_id },
                { $push: { assignments: createdAssignment._id } }
            ).then( function (v) {
                return createdAssignment;
            });
        });
    });
}

function createTest(stdout, stdin, args, assignment_id) {
    var newTest = new Test({stdout: stdout, stdin: stdin, args: args});

    return newTest.save().then(function (createdTest) {
        if (!createdTest) {
            throw errors.TEST_NOT_CREATED;
        }
        //Push createdAssignment _id into course_id's assignments
        return Assignment.findById(assignment_id).then( function (assignment) {
            if (!assignment) {
                throw errors.ASSINGMENT_DOES_NOT_EXIST;
            }
            return Assignment.update(
                { _id: assignment_id },
                { $push: { 'tests.io': createdTest._id }}
            ).then( function (v) {
                return createdTest;
            });
        });
    });
}


// Should be able to check permissions for all collections. As long FIELDS value is added.
function checkPermission(wantedFields, collection, roll) {
    var permissionFields = constants.FIELDS[collection.toUpperCase()][roll.toUpperCase()];
    if (wantedFields) {
        wantedFields = wantedFields.split(",");
        wantedFields.forEach(function(element) {
            if (permissionFields.indexOf(element.toString()) < 0) {
                throw errors.INSUFFICIENT_PERMISSION;
            }
        });
    }
    return true;
}

// Populates all wanted fields which is a Ref.
// Needs to be specified in FIELDS
function populateObject(mongooseObject, schema, wantedFields) {
    var fieldsToPopulateArray = constants.FIELDS[schema.toUpperCase()].POPULATE_FIELDS.split(" ");
    var populatePromises = [];
    var model = constants.FIELDS[schema.toUpperCase()].MODEL;
    fieldsToPopulateArray.forEach(function(element) {
        if (wantedFields.indexOf(element) !== -1) {
            populatePromises.push(model.populate(mongooseObject, {path: element, select: constants.FIELDS[element.toUpperCase()].BASE_FIELDS}));
        }
    });
    if (populatePromises.length === 0) {
        return new Promise((resolve, reject) => {
            resolve([mongooseObject]);
        });
    } else {
        return Promise.all(populatePromises);
    }
}

// TODO fix this
function getCourse(course_id) {
    return Course.findById(course_id);
}

/*
function getCourse(courseid, roll, fields) {
    var wantedFields = fields || constants.FIELDS.COURSE[roll.toUpperCase()];
    wantedFields = wantedFields.replace(/,/g, " ");

    return Course.findById(courseid, wantedFields)
    .then(function (course) {
        if (!course) {
            throw errors.COURSE_DOES_NOT_EXIST;
        }

        return populateObject(course, "course", wantedFields)
        .then(function(populatedCourse) {
            return populatedCourse[0];
        });
    });
}
*/

function saveCode(userID, assignmentID, code, lang) {
    // new: true - Creates a new document if it doesn't find one
    // upsert: true - Returns the updated document
    var options = {new: true, upsert: true, fields: "user assignment code lang", runValidators: true};
    return Draft.findOneAndUpdate({user: userID, assignment: assignmentID}, {code: code, lang: lang}, options).then(function (draft) {
        if (!draft) {
            throw errors.DRAFT_NOT_SAVED;
        }
        return draft;
    });
}

function getCode(userID, assignmentID) {
    return Draft.findOne({user: userID, assignment: assignmentID}, "user assignment code lang").then(function (draft) {
        if (!draft) {
            var newDraft = new Draft({user: userID, assignment: assignmentID, code: "", lang: ""});
            return newDraft.save().then(function (createdDraft) {
                if (!createdDraft) {
                    console.log("Error: Draft not created");
                }
                // Don't want to return __v field, maybe there is a better way to do this
                createdDraft.__v = undefined;
                return createdDraft;
            });
        }
        return draft;
    });
}


function getCoursesEnabledFeatures(course_id) {
    return Course.findById(course_id).then(function(course) {
        if(course === null)
            throw errors.COURSE_DO_NOT_EXIST;
        return course.enabled_features;
    });
}

function searchDB(query, categories, user_id) {

    console.log(1);
    return getAssignmentIDsByUser(user_id)
    .then(assignment_ids => {

        console.log(2);

        let promises = [];
        let json = {
            courses: [],
            assignments: [],
            users: []
        };

        if(categories) {
            categories = categories.split(',');

            if (categories.indexOf('courses') !== -1) {
                promises.push(searchDBCourses(query, user_id));
            }
            if (categories.indexOf('assignments') !== -1) {
                promises.push(searchDBAssignments(query, assignment_ids));
            }
            if (categories.indexOf('users') !== -1) {
                promises.push(searchDBUsers(query));
            }
        } else {
            promises.push(searchDBCourses(query, user_id));
            promises.push(searchDBAssignments(query, assignment_ids));
            promises.push(searchDBUsers(query));
        }

        return Promise.all(promises).then(function(results) {

            for(let result of results) {
                for(var key in result) json[key] = result[key];
            }

            return json;
        });
    });
}

function searchDBCourses(query, user_id) {
    return Course.find({$text: {$search: '\"'+query+'\"'}, 'students': user_id, 'hidden': false}, {score: {$meta: "textScore"}})
        .select('-__v -hidden -features -assignments -students -enabled_features')
        .sort({score: {$meta: "textScore"}})
        .limit(20).then(docs => {
            return {'courses': docs};
        }).catch(err => {
            logger.log("error",err);
        });
}

function searchDBAssignments(query, assignment_ids) {
    return Assignment.find({$text: {$search: '\"'+query+'\"'}, '_id': assignment_ids, 'hidden': false}, {score: {$meta: "textScore"}})
        .select('-__v -tests -optional_tests -hidden -languages')
        .sort({score: {$meta: "textScore"}})
        .limit(20).then(docs => {
            return {'assignments': docs};
        }).catch(err => {
            logger.log("error",err);
        });
}

function searchDBUsers(query) {
    return User.find({$text: {$search: '\"'+query+'\"'}}, {score: {$meta: "textScore"}})
        .select('-__v -tokens -providers')
        .sort({score: {$meta: "textScore"}})
        .limit(20).then(docs => {
            return {'users': docs};
        }).catch(err => {
            logger.log("error",err);
        });
}

// Helper function for searchDB()
function getAssignmentIDsByUser(user_id) {
    return getUserCourses(user_id, '_id')
    .then(function(courses) {

        // Get IDs of courses user is in
        let ids = [];
        for(let course of courses.courses) {
            ids.push(course._id);
        }

        // Get assignemnts from courses
        let assignment_promises = [];
        for(let id of ids) {
            assignment_promises.push(getCourseAssignments(id, 'assignments')
            .then(assignment => {
                return assignment;
            }));
        }

        // Get assignment IDs from assignments
        let assignment_ids = [];
        return Promise.all(assignment_promises)
        .then(course => {
            for(let assignments of course) {
                for(let assignment of assignments.assignments) {
                    assignment_ids.push(assignment._id);
                }
            }
            return assignment_ids;
        });
    });
}

// TODO: WILL BE AFFECTED BY NEW MEMBER SYSTEM
// returns "teacher", "admin" or "student": the highest access level for a course
function getHighestPermissionCourse(course_id, user_id) {
    getUser(user_id, "teaching").then(function (userObject) {
        var role = "";
        if (userObject.teaching.indexOf(course_id) !== -1) {
            role = "teacher";
        } else if (userObject.access === constants.ACCESS.ADMIN) {
            role = "admin";
        } else {
            role = "student";
        }
        return role;
    });
}

function getUserCourses(user_id) {
    return CourseMember.find({user: user_id}).distinct('course');
}

function getCourses1() {
    return Course.find({hidden: false}, constants.FIELDS.COURSE.BASE_FIELDS);
}

function getUsersHiddenCourses (user_id) {
    return CourseMember.find({user: user_id}).distinct('course')
    .then(function (idArray) {
        return Course.find({_id: {$in: idArray}, hidden: true}, constants.FIELDS.COURSE.BASE_FIELDS);
    });
}

function getAllCourses () {
    return Course.find({}, constants.FIELDS.COURSE.BASE_FIELDS);
}

function tempSaveMember (user_id, course_id) {
    var member = new CourseMember({role: "teacher", user: user_id, course: course_id});
    return member.save();
}

function saveCourseObject(user_id, courseObject) {
    var course = new Course(courseObject);
    return course.save().then(function (savedCourse) {
        return Features.createFeature(user_id, savedCourse._id).then(function (featureObject) {
            // TODO: FIX FEATURE FIELD. WHAT SHOULD IT ADD?
            var memberObject = new CourseMember({role: "teacher", course: savedCourse._id, user: savedCourse.owner, features: featureObject._id});
            return memberObject.save().then(function () {
                return savedCourse;
            });
        });
    });
}

function countOwnedCourses(user_id) {
    return Course.count({owner: user_id}).then(function (count) {
        if (count > 2) {
            throw errors.MAXIMUM_AMOUNT_OF_COURSES;
        }
    });
}

function acceptInviteToCourse(user_id, course_id) {
    return JoinRequest.findOneAndRemove({inviteType: "invite", user: user_id, course: course_id})
    .then(function(deletedInvite) {
        if (!deletedInvite) {
            throw errors.NO_INVITE_FOUND;
        }
        return Features.createFeature(user_id, course_id).then(function (featureObject) {
            var memberObject = new CourseMember({role: "student", course: course_id, user: user_id, features: featureObject._id});
            return memberObject.save();
        });
    });
}

function acceptPendingToCourse(user_id, course_id) {
    return JoinRequest.findOneAndRemove({inviteType: "pending", user: user_id, course: course_id})
    .then(function(deletedInvite) {
        if (!deletedInvite) {
            throw errors.NO_INVITE_FOUND;
        }
        return Features.createFeature(user_id, course_id).then(function (featureObject) {
            var memberObject = new CourseMember({role: "student", course: course_id, user: user_id, features: featureObject._id});
            return memberObject.save();
        });
    });
}

function addMemberToCourse(user_id, course_id) {
    return Features.createFeature(user_id, course_id).then(function (featureObject) {
        var memberObject = new CourseMember({role: "student", course: course_id, user: user_id, features: featureObject._id});
        return memberObject.save();
    });
}

function removeInviteOrPendingToCourse (user_id, course_id) {
    return JoinRequest.findOneAndRemove({user:user_id, course: course_id}).then(function(inviteObject) {
        if (!inviteObject) {
            throw errors.NO_INVITE_FOUND;
        }
    })
}

function getCourseMembers1(course_id) {
    return CourseMember.find({course: course_id}, "role user -_id").populate("user", "username email");
}

function getCourseTeachers1(course_id) {
    return CourseMember.find({role: "teacher", course: course_id}, "role user -_id").populate("user", "username email");
}

function getCourseStudents1(course_id) {
    return CourseMember.find({role: "student", course: course_id}, "role user -_id").populate("user", "username email");
}

function getUserTeacherCourses1(user_id) {
    return CourseMember.find({user: user_id, role: "teacher"}, "role course -_id").populate("course", constants.FIELDS.COURSE.BASE_FIELDS);
}
function getUserStudentCourses1(user_id) {
    return CourseMember.find({user: user_id, role: "student"}, "role course -_id").populate("course", constants.FIELDS.COURSE.BASE_FIELDS);
}
function getUserMemberCourses1(user_id) {
    return CourseMember.find({user: user_id}, "role course -_id").populate("course", constants.FIELDS.COURSE.BASE_FIELDS);
}

function getUserMemberStatus(course_id, user_id) {
    return CourseMember.findOne({user: user_id, course: course_id}, "role");
}

function getCourseAutoJoin(course_id) {
    return Course.findById(course_id, "autojoin -_id");
}

function addPendingToCourse(user_id, course_id) {
    var pendingObject = new JoinRequest({user: user_id, course: course_id, inviteType: "pending"});
    return pendingObject.save();
}

function addInviteToCourse(user_id, course_id) {
    var inviteObject = new JoinRequest({user: user_id, course: course_id, inviteType: "invite"});
    return inviteObject.save();
}

function generateInviteLink(course_id, expiresIn) {
    var code = randomstring.generate();
    var exp = Date.now() + (expiresIn || config.get("Courses.invite_link_ttl"));

    if (!mongoose.Types.ObjectId.isValid(course_id)) {
            throw errors.INVALID_ID;
    }
    var newLink = new InviteLink({code: code, course: course_id, expiresAt: exp});
    return newLink.save().then(function (obj) {
        return obj;
    });
}

function validateInviteLink(code, user_id) {
    return InviteLink.findOne({code: code}).then(function (obj) {
        if (!obj) {
            throw errors.INVALID_LINK;
        }
        if (obj.expiresAt < Date.now()) {
            return InviteLink.deleteOne({code: code}).then(function () {
                throw errors.EXPIRED_LINK;
            });
        }

        return CourseMember.findOne({user: user_id, course: obj.course}).then(function (res) {
            if (!res) {
                return Features.createFeature(user_id, obj.course).then(function (featureObject) {
                    // Add student to course
                    var memberObject = new CourseMember({role: "student", course: obj.course, user: user_id, features: featureObject._id});
                    return memberObject.save();
                });
            } else {
                throw errors.USER_ALREADY_IN_COURSE;
            }
        });


    });
}

function getAssignmentgroupsByCourseID(course_id) {
    return Course.findById(course_id, 'assignmentgroups');
}

function createAssignmentgroup(assignmentgroupObject, course_id) {
    let assignmentgroup = new Assignmentgroup(assignmentgroupObject);
    return assignmentgroup.save()
    .then(assignmentgroup => {
        return Course.update({'_id': course_id, $isolated: 1}, {$push: { assignmentgroups: assignmentgroup._id}})
        .then(function(course) {
            return assignmentgroup;
        });
    });
}

function getAssignmentgroupByID(assignmentgroup_id) {
    return Assignmentgroup.findById(assignmentgroup_id)
    .populate({path: 'assignments.assignment', model: 'Assignment'})
    .then(function(assignmentgroup) {
        if(assignmentgroup === null)
            throw errors.ASSIGNMENTGROUP_DO_NOT_EXIST;
        return assignmentgroup;
    });
}

function updateAssignmentgroup(assignmentgroupObject, assignmentgroup_id) {
    return Assignmentgroup.findOneAndUpdate({"_id": assignmentgroup_id}, assignmentgroupObject, { runValidators: true, new: true})
    .then(function(assignmentgroup) {
        if(assignmentgroup === null)
            throw errors.ASSIGNMENTGROUP_DO_NOT_EXIST;
        return assignmentgroup;
    });
}

function deleteAssignmentgroup(assignmentgroup_id, course_id) {

    return Assignmentgroup.findOneAndRemove({_id: assignmentgroup_id})
    .then(assignmentgroup => {
        if (!assignmentgroup) {
            throw errors.ASSIGNMENTGROUP_DO_NOT_EXIST;
        }

        return Course.update({_id: course_id}, {$pull: { assignmentgroups: assignmentgroup_id}});
    })
    .then(function(result) {
        return result;
    });
}

exports.getUserCourses = getUserCourses;
exports.getCourses1 = getCourses1;
exports.tempSaveMember = tempSaveMember;
exports.getAllCourses = getAllCourses;
exports.getUsersHiddenCourses = getUsersHiddenCourses;
exports.saveCourseObject = saveCourseObject;
exports.countOwnedCourses = countOwnedCourses;
exports.acceptInviteToCourse = acceptInviteToCourse;
exports.addMemberToCourse = addMemberToCourse;
exports.getCourseMembers1 = getCourseMembers1;
exports.getCourseTeachers1 = getCourseTeachers1;
exports.getCourseStudents1 = getCourseStudents1;
exports.getUserTeacherCourses1 = getUserTeacherCourses1;
exports.getUserStudentCourses1 = getUserStudentCourses1;
exports.getUserMemberCourses1 = getUserMemberCourses1;
exports.getUserMemberStatus = getUserMemberStatus;
exports.getCourseAutoJoin = getCourseAutoJoin;
exports.acceptPendingToCourse = acceptPendingToCourse;
exports.addInviteToCourse = addInviteToCourse;
exports.addPendingToCourse = addPendingToCourse;
exports.removeInviteOrPendingToCourse = removeInviteOrPendingToCourse;

exports.getTestsFromAssignment = getTestsFromAssignment;
exports.findOrCreateUser = findOrCreateUser;
exports.getUser = getUser;
exports.getUsers = getUsers;
exports.deleteUser = deleteUser;
exports.getCourses = getCourses;
exports.createCourse = createCourse;
exports.getUserCourses = getUserCourses;
exports.getUserTeacherCourses = getUserTeacherCourses;
exports.getCourseStudents = getCourseStudents;
exports.addCourseStudent = addCourseStudent;
exports.getCourseTeachers = getCourseTeachers;
exports.getCourseAssignments = getCourseAssignments;
exports.setRefreshToken = setRefreshToken;
exports.removeRefreshToken = removeRefreshToken;
exports.createAssignment = createAssignment;
exports.createTest = createTest;
exports.getAssignment = getAssignment;
exports.getTest = getTest;
exports.getCourse = getCourse;
exports.checkPermission = checkPermission;
exports.saveCode = saveCode;
exports.getCode = getCode;
exports.getCoursesEnabledFeatures = getCoursesEnabledFeatures;
exports.searchDB = searchDB;
exports.checkIfTeacherOrAdmin = checkIfTeacherOrAdmin;
exports.checkIfUserAlreadyInCourseObject = checkIfUserAlreadyInCourseObject;
exports.checkIfUserAlreadyInCourse = checkIfUserAlreadyInCourse;
exports.checkIfRequestAlreadySent = checkIfRequestAlreadySent;
exports.createRequestToCourse = createRequestToCourse;
exports.checkIfUserExist = checkIfUserExist;
exports.findAndRemoveRequest = findAndRemoveRequest;
exports.returnPromiseForChainStart = returnPromiseForChainStart;
exports.checkIfUserInCourseAndNotTeacherObject = checkIfUserInCourseAndNotTeacherObject;
exports.addTeacherToCourse = addTeacherToCourse;
exports.removeTeacherFromCourse = removeTeacherFromCourse;
exports.removeStudentFromCourse = removeStudentFromCourse;
exports.checkIfUserIsTeacherObject = checkIfUserIsTeacherObject;
exports.getCourseInvites = getCourseInvites;
exports.getUserInvites = getUserInvites;
exports.getInvitesCourseUser = getInvitesCourseUser;
exports.getAssignmentTests = getAssignmentTests;
exports.getUserPopulated = getUserPopulated;
exports.updateCourse = updateCourse;
exports.updateTest = updateTest;
exports.deleteTest = deleteTest;
exports.deleteCourse = deleteCourse;
exports.deleteAssignment = deleteAssignment;
exports.generateInviteLink = generateInviteLink;
exports.validateInviteLink = validateInviteLink;
exports.getAssignmentgroupsByCourseID = getAssignmentgroupsByCourseID;
exports.createAssignmentgroup = createAssignmentgroup;
exports.getAssignmentgroupByID = getAssignmentgroupByID;
exports.updateAssignmentgroup = updateAssignmentgroup;
exports.deleteAssignmentgroup = deleteAssignmentgroup;
exports.updateAssignment = updateAssignment;
