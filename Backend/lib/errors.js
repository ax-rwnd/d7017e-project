'use strict';
var util = require('util');
// This file defines enums for easy error handling
var config = require('config');

function APIError(message, httpCode, errorCode) {
    this.name = this.constructor.name;
    this.message = message;
    this.httpCode = httpCode;
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
    TEST_DOES_NOT_EXIST: new APIError("Test doesn't exist", 404, 7014),
    INSUFFICIENT_PERMISSION: new APIError("You don't have the required permissions for this request.", 403, 7015),
    DRAFT_NOT_SAVED: new APIError("Draft not saved", 500, 7016),
    BADGE_DO_NOT_EXIST: new APIError("Badge doesn't exist", 404, 7017),
    // 7018
    FEATURE_DO_NOT_EXIST: new APIError("Course doesn't exist", 404, 7019),
    TEST_NOT_CREATED: new APIError("Assignment not created", 500, 7020),
    BAD_QUERY_STRUCTURE: new APIError('Bad input. Expected: "?query=XYZ"', 400, 7021),
    TOO_SHORT_QUERY: new APIError('Bad input. Expected query with length atleast 3', 400, 7022),
    USER_ALREADY_IN_COURSE: new APIError('User is already a member of this course', 400, 7023),
    INVITE_ALREADY_SENT: new APIError("Invite is already sent to this user", 400, 7024),
    NO_INVITE_FOUND: new APIError("No invite found", 404, 7025),
    USER_IS_ALREADY_TEACHER: new APIError("User is already teacher of course", 400, 7026),
    USER_NOT_IN_COURSE: new APIError("User is not a member of this course", 400, 7027),
    USER_IS_NOT_TEACHER: new APIError("User is not teacher of course", 400, 7028),
    USER_IS_NOT_STUDENT: new APIError("User is not student in this course", 400, 7029),
    COURSE_NOT_CREATED: new APIError("Course not created", 500, 7030),
    MAXIMUM_AMOUNT_OF_COURSES: new APIError("You can't create more courses. Delete one or contact system admin", 403, 7031),
    REQUEST_ALREADY_SENT: new APIError("A request to join this course have already been made.", 403, 7032)
    INVALID_LINK: new APIError("Invalid invite link", 401, 7032),
    EXPIRED_LINK: new APIError("Invite link has expired", 401, 7033)
};
