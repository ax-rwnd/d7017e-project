'use strict';
var util = require('util');
// This file defines enums for easy error handling

function APIError(message, httpCode, errorCode) {
    this.name = this.constructor.name;
    this.message = message;
    this. httpCode = httpCode;
    this.errorCode = errorCode;

    //include stack trace in error object
}
util.inherits(APIError, Error);


module.exports = {
    TOKEN_USER_NOT_FOUND: new APIError("Internal Server Error", 500, 7000),
    INVALID_TOKEN: new APIError("Invalid Token", 401, 7001),
    NO_COURSES_EXIST: new APIError("No courses exists", 404, 7002),
    COURSE_DOES_NOT_EXIST: new APIError("Course doesn't exist", 404, 7003),
    BAD_INPUT: new APIError("Wrong input. Read documentation.", 400, 7004),
    NO_STUDENTS_EXIST: new APIError("No students exists", 404, 7005),
    NO_TEACHERS_EXIST: new APIError("No teachers exists", 404, 7006),
    NO_ASSIGNMENTS_EXIST: new APIError("No assignments exists", 404, 7007),
    NOT_FOUND: new APIError("Resource not found", 404, 7008),
    USER_NOT_FOUND: new APIError("User not found", 404, 7009),
    INVALID_ID: new APIError("Invalid ID", 400, 7010),
    ASSIGNMENT_NOT_CREATED: new APIError("Assignment not created", 500, 7011),
    FAILED_TO_UPDATE_COURSE: new APIError("Failed to update course", 500, 7012),
    ASSIGNMENT_DOES_NOT_EXIST: new APIError("Assignment doesn't exist", 404, 7013),
    TEST_DOES_NOT_EXIST: new APIError("Test doesn't exist", 404, 7014)
};
