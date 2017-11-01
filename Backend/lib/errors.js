'use strict';
const errors = require('throw.js');
// This file defines enums for easy error handling

module.exports = {
    TEST: {code: 666, msg:"This is a test error"},
    TOKEN_USER_NOT_FOUND: new errors.CustomError("User not found", "Internal Server Error", 500, 7000),
    INVALID_TOKEN: new errors.CustomError("Invalid Token Error", "Invalid Token", 401, 7001),
    NO_COURSES_EXIST: new errors.CustomError("Course Error", "No courses exists", 404, 7002),
    COURSE_DO_NOT_EXIST: new errors.CustomError("Course Error", "Course doesn't exist", 404, 7003)
};
