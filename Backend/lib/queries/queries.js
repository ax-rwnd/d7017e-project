'use strict';

var schemas = require('../../models/schemas.js');
var Assignment = require('../../models/schemas').Assignment;
var Course = require('../../models/schemas').Course;
var Test = require('../../models/schemas').Test;
var User = require('../../models/schemas').User;
var Draft = require('../../models/schemas').Draft;
var errors = require('../errors.js');
var mongoose = require('mongoose');
var logger = require('../../logger.js');
var jwt = require('jsonwebtoken');
var config = require('config');


const FIELDS = {
    COURSE: {
        MODEL: require('../../models/schemas').Course,
        BASE_FIELDS: "course_code name description",
        ADMIN: "course_code name description teachers students assignments",
        TEACHER: "course_code name description students assignments",
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
    }
};

// var Assignment, User, Test = require('../../models/schemas.js');

//get all tests related to a specific assignment.
function getTestsFromAssignment(assignmentID, callback) {
    console.log(assignmentID);
    Assignment.findById(assignmentID)
    .populate({
        path: 'tests.io',
        model: 'Test'
    }).populate({
        path: 'optional_tests.io',
        model: 'Test'
    }).lean().exec(function (err, assignmentObject) {
        let json = {};
        json.tests = assignmentObject.tests;
        json.optional_tests = assignmentObject.optional_tests;
        callback(json);
    });
}




function getUser(id, fields) {
    var wantedFields = fields || "username email admin tokens courses teaching providers";
    // Check validity of id
    if (!mongoose.Types.ObjectId.isValid(id)) {
            throw errors.INVALID_ID;
    }
    return User.findById(id, wantedFields).then(function (user) {
        if (!user) {
            console.log("User not found");
            throw errors.USER_NOT_FOUND;
        }
        return user;
    });
}

function getUsers(id_array, fields) {
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
                console.log("User not found");
                throw errors.USER_NOT_FOUND;
            }
            return user;
        });
        promises.push(temp); // Gather all promises in an array
    }
    return Promise.all(promises);
}

function deleteUser(id) {
    return User.findById(id).then(function (user) {
        if (!user) {
            console.log("deleteUser: User not found");
            throw errors.USER_NOT_FOUND;
        }
        User.deleteOne(user, function (err) {
            return err;
        });
    });
}

function setRefreshToken(userObject, token) {
    // Iterate through refresh token array and expired tokens
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
    return User.findOne({username: username}).then(function (user) {
        if (!user) {
            var newUser = new User({username: username, email: email, admin: admin, courses: [], tokens: []});
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

function getCourses(fields, admin, id_array) {
    var wantedFields = fields || "name description hidden teachers students assignments";
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

function createCourse(name, description, hidden, course_code, enabled_features) {
    course_code = course_code || '';
    enabled_features = enabled_features || {};
    var newCourse = new Course({name: name, description: description, course_code: course_code, hidden: hidden, teachers: [], students: [], assignments: [], features: [], enabled_features: enabled_features});
    return newCourse.save().then(function (createdCourse) {
        if (!createdCourse) {
            console.log("Error: Course not created");
            //ERROR?!
        }
        return createdCourse;
    });
}

function getUserCourses(id, fields) {
    var wantedFields = fields || "name description hidden teachers students assignments course_code";

    return User.findById(id, "courses").populate("courses", wantedFields).then(function (courseList) {
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
            // TODO: make it an APIError
            throw new Error('Course does not exist');
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
    var wantedFields = fields || FIELDS.ASSIGNMENTS[roll.toUpperCase()];
    wantedFields = wantedFields.replace(/,/g, " ");

    return Assignment.findById(assignment_id, wantedFields)
    .then(function (assignment) {
        if (!assignment) {
            throw errors.ASSIGNMENT_DOES_NOT_EXIST;
        }
        console.log(assignment);

        console.log(wantedFields);
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

function getTest(id, fields) {
    var wantedFields = fields || "stdout stdin args";

    return Test.findById(id, fields).then(function (test) {
        if (!test) {
            throw errors.TEST_DOES_NOT_EXIST;
        }
        return test;
    });
}

function createAssignment(name, description, hidden, languages, course_id) {
    var newAssignment = new Assignment({name: name, description: description, hidden: hidden, tests: {io: [], lint: false}, optionaal_tests: {io: [], lint: false}, languages: languages});
    return newAssignment.save().then(function (createdAssignment) {
        if (!createdAssignment) {
            console.log("Error: Assignment not created");
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

function createTest(stdout, stdin, args, lint, assignment_id) {
    var newTest = new Test({stdout: stdout, stdin: stdin, args: args});
    return newTest.save().then(function (createdTest) {
        if (!createdTest) {
            console.log("Error: Test not created");
            throw errors.TEST_NOT_CREATED;
        }
        //Push createdAssignment _id into course_id's assignments
        return Assignment.findById(assignment_id).then( function (assignment) {
            if (!assignment) {
                throw errors.ASSINGMENT_DOES_NOT_EXIST;
            }
            return Assignment.update(
                { _id: assignment_id },
                { $push: { 'tests.io': createdTest._id }, $set: { 'tests.lint': lint } }
            ).then( function (v) {
                return createdTest;
            });
        });
    });
}


// Should be able to check permissions for all collections. As long FIELDS value is added.
function checkPermission(wantedFields, collection, roll) {
    var permissionFields = FIELDS[collection.toUpperCase()][roll.toUpperCase()];
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
    console.log(mongooseObject);
    console.log(schema);
    console.log(wantedFields);
    var fieldsToPopulateArray = FIELDS[schema.toUpperCase()].POPULATE_FIELDS.split(" ");
    var populatePromises = [];
    var model = FIELDS[schema.toUpperCase()].MODEL;
    fieldsToPopulateArray.forEach(function(element) {
        console.log("LOOP");
        if (wantedFields.indexOf(element) !== -1) {
            console.log(element);
            populatePromises.push(model.populate(mongooseObject, {path: element, select: FIELDS[element.toUpperCase()].BASE_FIELDS}));
        }
    });
    console.log(populatePromises);
    if (populatePromises.length === 0) {
        return new Promise((resolve, reject) => {
            resolve([mongooseObject]);
        });
    } else {
        return Promise.all(populatePromises);
    }
}

function getCourse(courseid, roll, fields) {
    var wantedFields = fields || FIELDS.COURSE[roll.toUpperCase()];
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
    return getAssignmentIDsByUser(user_id).then(assignment_ids => {

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
    return Course.find({$text: {$search: query}, 'students': user_id, 'hidden': false}, {score: {$meta: "textScore"}})
        .select('-__v -hidden -features -assignments -students -enabled_features')
        .sort({score: {$meta: "textScore"}})
        .limit(20).then(docs => {
            return {'courses': docs};
        }).catch(err => {
            logger.error(err);
        });
}

function searchDBAssignments(query, assignment_ids) {
    return Assignment.find({$text: {$search: query}, '_id': assignment_ids, 'hidden': false}, {score: {$meta: "textScore"}})
        .select('-__v -tests -optional_tests -hidden -languages')
        .sort({score: {$meta: "textScore"}})
        .limit(20).then(docs => {
            return {'assignments': docs};
        }).catch(err => {
            logger.error(err);
        });
}

function searchDBUsers(query) {
    return User.find({$text: {$search: query}}, {score: {$meta: "textScore"}})
        .select('-__v -tokens -providers')
        .sort({score: {$meta: "textScore"}})
        .limit(20).then(docs => {
            return {'users': docs};
        }).catch(err => {
            logger.error(err);
        });
}

// Helper function for searchDB()
function getAssignmentIDsByUser(user_id) {
    return getUserCourses(user_id, '_id').then(function(courses) {

        // Get IDs of courses user is in
        let ids = [];
        for(let course of courses.courses) {
            ids.push(course._id);
        }

        // Get assignemnts from courses
        let assignment_promises = [];
        for(let id of ids) {
            assignment_promises.push(getCourseAssignments(id, 'assignments').then(assignment => {
                return assignment;
            }));
        }

        // Get assignment IDs from assignments
        let assignment_ids = [];
        return Promise.all(assignment_promises).then(course => {
            for(let assignments of course) {
                for(let assignment of assignments.assignments) {
                    assignment_ids.push(assignment._id);
                }
            }
            return assignment_ids;
        });
    });
}

exports.getTestsFromAssignment = getTestsFromAssignment;
exports.findOrCreateUser = findOrCreateUser;
exports.getUser = getUser;
exports.getUsers = getUsers;
exports.deleteUser = deleteUser;
exports.getCourses = getCourses;
exports.createCourse = createCourse;
exports.getUserCourses = getUserCourses;
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
