<<<<<<< HEAD
var schemas = require('../../models/schemas.js')

var Assignment = require('../../models/schemas').Assignment;
var Test = require('../../models/schemas').Test;
var Course = require('../../models/schemas').Course;

//get all tests related to a specific assignment. 
function getTestsFromAssignment(assignmentID, callback) {
=======
'use strict';

var schemas = require('../../models/schemas.js');
var Assignment = require('../../models/schemas').Assignment;
var Test = require('../../models/schemas').Test;
var User = require('../../models/schemas').User;

// var Assignment, User, Test = require('../../models/schemas.js');

//get all tests related to a specific assignment. 
function getTestsFromAssignment(assignmentID, callback) {
    console.log(assignmentID);
>>>>>>> 5495243359baaa2eb857d6b21f8aa3c5dfbc9839
    Assignment.findById(assignmentID)
    .populate({
        path: 'tests',
        model: 'Test'
    })
    
    .exec(function(err, assignmentObject) {
        callback(assignmentObject.tests);
    });
}

<<<<<<< HEAD
//get assignments from a course
function getAssignmentsCourse(courseID, callback) {
    getCourse(courseID, function(course) {
        callback(course.assignments);
    });
}

exports.getTestsFromAssignment = getTestsFromAssignment;
=======
function findOrCreateUser(profile) {
    return new Promise(function (resolve, reject) {
        console.log("findUser");
>>>>>>> 5495243359baaa2eb857d6b21f8aa3c5dfbc9839

        var username;
        var email;

        username = profile.user;
        email = profile.attributes.mail;

        console.log(profile);
        console.log(username);
        console.log(email);

        User.findOne({username: username}, function (err, user) {
            console.log("findOne");
            if (err) {
              console.log(err);
              reject(err);
            }
            if (!user) {
                console.log("Creating new user with username " + username);
                var newUser = new User({username: username, email: email, admin: false, courses: []});
                newUser.save(function (err, created) {
                    if (err) {
                        console.log(err);
                        reject(err);
                    }
                    resolve(created);
                });
            } else {
                console.log("Found user " + user);
                resolve(user);
            }
        });
    });
}

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

exports.getTestsFromAssignment = getTestsFromAssignment;
exports.findOrCreateUser = findOrCreateUser;
exports.getUser = getUser;
