'use strict';
var badInput = require('./badInputError.js');
var errors = require('./errors.js');
var constants = require('./constants.js');
var typecheck = require('./typecheck.js');


// GREAT LINKS:
// https://booker.codes/input-validation-in-express-with-express-validator/
// https://github.com/chriso/validator.js#validators

// WHY IS IT DONE?!
// Sending next as parameter does not work. Code will continue to execute in route.
// Therefore calls to input validator will have to be wrapped in try catch block in route.
// Promise creates difficult situations with reaching input in chains sometimes.
// This is not an asynchronus call so therefore promise is not a must.
// If anyone have any idea of solving these problems. Feel free to change.



// Input Validating for POST /api/courses/
function postCourseValidation(req) {
    // required
    var name, enabled_features;

    // optional
    var description, course_code, hidden, autojoin;

    // Required Fields
    req.checkBody("name", "Must contain only letters and numbers").isAscii();
    name = req.body.name;

    // Optional fields
    if (req.body.enabled_features) {
        // TODO: This is an object. How to check this properly?
        //req.checkBody("enabled_features", "Not a bool").isEmpty();
        enabled_features = req.body.enabled_features;
    } else {
        enabled_features = {};
    }

    if (req.body.description) {
        req.checkBody("description", "Must contain only ascii characters").isAscii();
        description = req.body.description;
    } else {
        description = "";
    }

    if (req.body.course_code) {
        req.checkBody("course_code", "Must contain only ascii characters").isAlphanumeric();
        course_code = req.body.course_code;
    } else {
        course_code = "";
    }

    if (req.body.hidden) {
        req.checkBody("hidden", "Must contain true or false").isBoolean();
        hidden = req.body.hidden;
    } else {
        hidden = false;
    }

    // TODO: CANT CHECK BOOL LIKE THIS.
    if (req.body.autojoin) {
        req.checkBody("autojoin", "Must contain true or false").isBoolean();
        autojoin = req.body.autojoin;
    } else {
        autojoin = false;
    }

    // This is the "check". If any errors is found above they will be added to req and found by validationErrors.
    // Must be included.
    var inputError = req.validationErrors();
    if (inputError) {
        // next here seems to not work. Code will continue execute in routes anyways. Even with return.
        throw badInput.BAD_INPUT(inputError);
    }

    // TODO: REMOVE TEACHER IN OBJECT. WHEN TEST FIXED
    var input = {name: name, owner: req.user.id, teachers: [req.user.id], enabled_features: enabled_features, description: description,
                        course_code: course_code, hidden: hidden, autojoin: autojoin};
    return input;
}

// Input Validation for POST /api/courses/:course_id/members/invite
function postMemberInviteValidation(req) {
    // required
    var course_id;

    // optional
    var user_id;

    //req
    req.checkParams("course_id", "Not a valid course id").isMongoId();
    course_id = req.params.course_id;

    //optional
    if (!req.body.user_id) {
        user_id = req.user.id;
    } else {
        req.checkBody("user_id", "Not a valid user id").isMongoId();
        user_id = req.body.user_id;
    }

    var inputError = req.validationErrors();
    if (inputError) {
        throw badInput.BAD_INPUT(inputError);
    }

    var input = {course_id: course_id, user_id: user_id};
    return input;
}

// Input Validation for PUT /api/courses/:course_id/members/invite
function putMembersInviteValidation (req) {
    // required
    var course_id;

    // optional
    var user_id;

    //req
    req.checkParams("course_id", "Not a valid course id").isMongoId();
    course_id = req.params.course_id;

    //optional
    if (!req.body.user_id) {
        user_id = req.user.id;
    } else {
        req.checkBody("user_id", "Not a valid user id").isMongoId();
        user_id = req.body.user_id;
    }

    var inputError = req.validationErrors();
    if (inputError) {
        throw badInput.BAD_INPUT(inputError);
    }

    var input = {course_id: course_id, user_id: user_id};
    return input;
}

// Input Validation for DELETE /api/courses/:course_id/members/invite
function deleteMembersInviteValidation (req) {
    // required
    var course_id;

    // optional
    var user_id;

    //req
    req.checkParams("course_id", "Not a valid course id").isMongoId();
    course_id = req.params.course_id;

    //optional
    if (!req.body.user_id) {
        user_id = req.user.id;
    } else {
        req.checkBody("user_id", "Not a valid user id").isMongoId();
        user_id = req.body.user_id;
    }

    var inputError = req.validationErrors();
    if (inputError) {
        throw badInput.BAD_INPUT(inputError);
    }

    var input = {course_id: course_id, user_id: user_id};
    return input;
}


// Input Validation for GET /api/courses/:course_id/members/invite
function getMembersInviteValidation (req) {
    // required
    var course_id;

    // optional
    var inviteType;

    //req
    req.checkParams("course_id", "Not a valid course id").isMongoId();
    course_id = req.params.course_id;

    //optional
    if (!req.query.type) {
        inviteType = "all";
    } else {
        req.checkQuery("type", "Not a valid invite type").isIn(['invite', 'pending']);

        inviteType = req.query.type;
    }

    var inputError = req.validationErrors();
    if (inputError) {
        throw badInput.BAD_INPUT(inputError);
    }

    var input = {course_id: course_id, inviteType: inviteType};
    return input;
}

// Input Validation for GET /api/courses/:course_id/members
function getMembersValidation (req) {
    // required
    var course_id;

    // optional
    var role;

    //req
    req.checkParams("course_id", "Not a valid course id").isMongoId();
    course_id = req.params.course_id;

    //optional
    if (!req.query.role) {
        role = "all";
    } else {
        req.checkQuery("role", "Not a valid invite type").isIn(['student', 'teacher']);

        role = req.query.role;
    }

    var inputError = req.validationErrors();
    if (inputError) {
        throw badInput.BAD_INPUT(inputError);
    }

    var input = {course_id: course_id, role: role};
    return input;
}

// Input Validation for GET /api/users/me/member
function getMeMemberValidation (req) {
    // optional
    var role;

    //optional
    if (!req.query.role) {
        role = "all";
    } else {
        req.checkQuery("role", "Not a valid invite type").isIn(['student', 'teacher']);
        role = req.query.role;
    }

    var inputError = req.validationErrors();
    if (inputError) {
        throw badInput.BAD_INPUT(inputError);
    }

    var input = {role: role};
    return input;
}

// Input Validation for GET /api/user/me/invites
function getMeInvitesValidation (req) {
    // optional
    var type;

    //optional
    if (!req.query.type) {
        type = "all";
    } else {
        req.checkQuery("type", "Not a valid invite type").isIn(['invite', 'pending']);
        type = req.query.type;
    }

    var inputError = req.validationErrors();
    if (inputError) {
        throw badInput.BAD_INPUT(inputError);
    }

    var input = {type: type};
    return input;
}

// Input Validation for GET /api/users/me/:course_id/status
function getMeStatusValidation (req) {
    // required
    var course_id;

    //req
    req.checkParams("course_id", "Not a valid course id").isMongoId();
    course_id = req.params.course_id;

    var inputError = req.validationErrors();
    if (inputError) {
        throw badInput.BAD_INPUT(inputError);
    }

    var input = {course_id: course_id};
    return input;
}

// Input Validation for checking course_id and assignment_id
function assignmentAndCourseValidation (req) {
    var course_id; // required
    var assignment_id; // required
    
    // req
    req.checkParams("course_id", "Not a valid course id").isMongoId();
    course_id = req.params.course_id;
    req.checkParams("assignment_id", "Not a valid assignment id").isMongoId();
    assignment_id = req.params.assignment_id;

    var inputError = req.validationErrors();
    if (inputError) {
        throw badInput.BAD_INPUT(inputError);
    }

    var input = {course_id: course_id, assignment_id: assignment_id};
    return input;
}

function assignmentgroupValidation(req) {

    let input = {};

    // required
    var name;

    // optional
    var assignments = [];
    var adventuremap = {};

    //req
    req.checkBody("name", "Must contain only ascii characters").isAscii();
    name = req.body.name;

    //optional
    if(req.body.assignments) {
        req.checkBody('assignments')
             .custom((item)=>Array.isArray(item))
             .withMessage( "Must be array");
        assignments = req.body.assignments;
    }
    if(req.body.adventuremap) {
        // TODO Check object
        //req.checkBody("adventuremap", "Not a valid assignments field").isJSON();
        adventuremap = req.body.adventuremap;
    }

    var inputError = req.validationErrors();
    if (inputError) {
        throw badInput.BAD_INPUT(inputError);
    }

    input.name = name;
    input.assignments = assignments;
    input.adventuremap = adventuremap;

    return input;
}

function badgeValidation(req) {

    let input = {};

    // required
    var course_id;
    var icon;
    var title;
    var description;

    // optional
    var goals = {};
    
    //req
    req.checkParams("course_id", "Not a valid course id").isMongoId();
    course_id = req.params.course_id;
    req.checkBody("icon", "Must contain only ascii characters").isAscii();
    icon = req.body.icon;
    req.checkBody("title", "Must contain only ascii characters").isAscii();
    title = req.body.title;
    req.checkBody("description", "Must contain only ascii characters").isAscii();
    description = req.body.description;

    //optional
    if(req.body.goals) {
        // TODO Check object
        /*req.checkBody('assignments')
             .custom((item)=>Array.isArray(item))
             .withMessage( "Must be array");*/
        goals = req.body.goals;
    }

    var inputError = req.validationErrors();
    if (inputError) {
        throw badInput.BAD_INPUT(inputError);
    }

    input.course_id = course_id;
    input.icon = icon;
    input.title = title;
    input.description = description;
    input.goals = goals;

    return input;
}

// checks for a course_id param
function courseIdValidation(req) {
    req.checkParams('course_id', 'Not a valid course id').isMongoId();
    var inputError = req.validationErrors();
    if (inputError) {
        throw badInput.BAD_INPUT(inputError);
    }
    return {course_id: req.params.course_id};
}

// Input validation for PUT /api/courses/:course_id
function putCourseBodyValidation(req) {
    var input = {};

    // Optional fields
    if ('name' in req.body) {
        req.checkBody("name", "Must contain only letters and numbers").isAscii();
        input.name = req.body.name;
    }
    if ('description' in req.body) {
        req.checkBody("description", "Must contain only ascii characters").isAscii();
        input.description = req.body.description;
    }
    if ('course_code' in req.body) {
        req.checkBody("course_code", "Must contain only ascii characters").isAlphanumeric();
        input.course_code = req.body.course_code;
    }
    if ('hidden' in req.body) {
        req.checkBody("hidden", "Must contain true or false").isBoolean();
        input.hidden = req.body.hidden;
    }
    if ('autojoin' in req.body) {
        req.checkBody("autojoin", "Must contain true or false").isBoolean();
        input.autojoin = req.body.autojoin;
    }
    if ('enabled_features' in req.body) {
        // TODO: apply better validation from postCourseValidation when it is implemented
        input.enabled_features = req.body.enabled_features;
    }

    var inputError = req.validationErrors();
    if (inputError) {
        throw badInput.BAD_INPUT(inputError);
    }
    return input;
}

// Input validation for PUT /api/courses/:course_id/assignments/:assignment_id
function putAssignmentBodyValidation(req) {
    var input = {};

    // Optional fields
    if ('name' in req.body) {
        req.checkBody("name", "Must contain only letters and numbers").isAscii();
        input.name = req.body.name;
    }
    if ('description' in req.body) {
        req.checkBody("description", "Must contain only ascii characters").isAscii();
        input.description = req.body.description;
    }
    if ('hidden' in req.body) {
        req.checkBody("hidden", "Must contain true or false").isBoolean();
        input.hidden = req.body.hidden;
    }
    if ('tests' in req.body) {
        if ('lint' in req.body.tests) {
            req.checkBody("tests.lint", "Must contain true or false").isBoolean();
            input.tests.lint = req.body.tests.lint;
        }
    }
    if ('optional_tests' in req.body) {
        if ('lint' in req.body.optional_tests) {
            req.checkBody("optional_tests.lint", "Must contain true or false").isBoolean();
            input.optional_tests.lint = req.body.optional_tests.lint;
        }
    }
    if ('languages' in req.body) {
        req.checkBody("languages", "Must contain only ascii characters").isAscii();
        input.languages = req.body.languages;
    }

    var inputError = req.validationErrors();
    if (inputError) {
        throw badInput.BAD_INPUT(inputError);
    }
    return input;
}

// checks that course_id and assignment_id are valid IDs
function assignmentValidation(req) {
    req.checkParams('course_id', 'Not a valid course id').isMongoId();
    req.checkParams('assignment_id', 'Not a valid assignment id').isMongoId();
    var inputError = req.validationErrors();
    if (inputError) {
        throw badInput.BAD_INPUT(inputError);
    }
    return {course_id: req.params.course_id, assignment_id: req.params.assignment_id};
}

exports.postCourseValidation = postCourseValidation;
exports.putCourseBodyValidation = putCourseBodyValidation;
exports.putMembersInviteValidation = putMembersInviteValidation;
exports.postMemberInviteValidation = postMemberInviteValidation;
exports.assignmentgroupValidation = assignmentgroupValidation;
exports.badgeValidation = badgeValidation;
exports.assignmentAndCourseValidation = assignmentAndCourseValidation;
exports.courseIdValidation = courseIdValidation;
exports.assignmentValidation = assignmentValidation;
exports.putAssignmentBodyValidation = putAssignmentBodyValidation;
exports.getMembersInviteValidation = getMembersInviteValidation;
exports.deleteMembersInviteValidation = deleteMembersInviteValidation;
exports.getMembersValidation = getMembersValidation;
exports.getMeMemberValidation = getMeMemberValidation;
exports.getMeInvitesValidation = getMeInvitesValidation;
exports.getMeStatusValidation = getMeStatusValidation;
