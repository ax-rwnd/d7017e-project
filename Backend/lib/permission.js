'use strict';

var schemas = require('../models/schemas.js');
var Assignment = require('../models/schemas').Assignment;
var Course = require('../models/schemas').Course;
var CourseMember = require('../models/schemas').CourseMembers;
var Test = require('../models/schemas').Test;
var User = require('../models/schemas').User;
var Draft = require('../models/schemas').Draft;
var JoinRequests = require('../models/schemas').JoinRequests;
var errors = require('./errors.js');
var mongoose = require('mongoose');
var logger = require('./logger.js');
var jwt = require('jsonwebtoken');
var config = require('config');
var constants = require('./constants.js');


function checkIfTeacherOrAdmin(user_id, course_id, access) {
    return CourseMember.count({role: "teacher", user: user_id, course: course_id}).then(function (count) {
        if (count === 0 && access !== "admin") {
            throw errors.INSUFFICIENT_PERMISSION;
        }
    });
}

function checkIfTeacher(user_id, course_id) {
    return CourseMember.count({role: "teacher", user: user_id, course: course_id}).then(function (count) {
        if (count === 0) {
            throw errors.INSUFFICIENT_PERMISSION;
        }
    });
}

function checkUserNotInCourse(user_id, course_id) {
    return CourseMember.count({user:user_id, course: course_id}).then(function (count) {
        if (count !== 0) {
            throw errors.USER_ALREADY_IN_COURSE;
        }
    });
}

function checkIfAlreadyInvited(user_id, course_id) {
    return JoinRequests.count({inviteType: 'invite', user: user_id, course: course_id}).then(function (count) {
        if (count !== 0) {
            throw errors.INVITE_ALREADY_SENT;
        }
    });
}

function checkIfAlreadyRequested(user_id, course_id) {
    return JoinRequests.count({inviteType: 'pending', user: user_id, course: course_id}).then(function (count) {
        if (count !== 0) {
            throw errors.REQUEST_ALREADY_SENT;
        }
    });
}

function checkIfAssignmentInCourse(course_id, assignment_id) {
    return Course.find({ _id: course_id, assignments: {$in: [assignment_id]} }).count().then(function (count) {
        if (count === 0) {
            throw errors.ASSIGNMENT_NOT_IN_COURSE;
        }
    });
}

exports.checkIfTeacherOrAdmin = checkIfTeacherOrAdmin;
exports.checkIfTeacher = checkIfTeacher;
exports.checkUserNotInCourse = checkUserNotInCourse;
exports.checkIfAlreadyInvited = checkIfAlreadyInvited;
exports.checkIfAlreadyRequested = checkIfAlreadyRequested;
exports.checkIfAssignmentInCourse = checkIfAssignmentInCourse;
