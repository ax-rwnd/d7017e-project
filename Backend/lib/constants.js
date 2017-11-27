'use strict';

const ACCESS = {
    ADMIN: 'admin',
    ADVANCED: 'advanced',
    BASIC: 'basic'
}

const FIELDS = {
    USER : {
        MODEL: require('../models/schemas').User,
        BASE_FIELDS: "username email admin access courses teaching providers",
        ADMIN: "username email admin access courses teaching providers",
        TEACHER: "username email admin access courses teaching providers",
        STUDENT: "username email admin access courses teaching providers",
        POPULATE_FIELDS: "courses teaching"
    },
    COURSE: {
        MODEL: require('../models/schemas').Course,
        BASE_FIELDS: "name description course_code",
        ADMIN: "course_code name description autojoin teachers students invited pending assignments",
        TEACHER: "course_code name description autojoin teachers students invited pending assignments",
        STUDENT: "course_code name description assignments",
        POPULATE_FIELDS: "teachers students assignments"
    },
    TEACHERS: {
        BASE_FIELDS: "username email"
    },
    ASSIGNMENTS: {
        MODEL: require('../models/schemas').Assignment,
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
        MODEL: require('../models/schemas').Test,
        BASE_FIELDS: "stdout stdin args",
        POPULATE_FIELDS: ""
    },
    'OPTIONAL_TESTS.IO': {
        MODEL: require('../models/schemas').Test,
        BASE_FIELDS: "stdout stdin args",
        POPULATE_FIELDS: ""
    },
    TEACHING: {
        BASE_FIELDS: "course_code name description"
    },
    COURSES: {
        BASE_FIELDS: "course_code name description"
    }
}

exports.ACCESS = ACCESS;
exports.FIELDS = FIELDS;