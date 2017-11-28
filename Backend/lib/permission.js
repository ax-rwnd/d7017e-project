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


exports.checkIfTeacherOrAdmin = checkIfTeacherOrAdmin;