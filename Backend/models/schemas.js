'use strict';
//Mongoose schemas.

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/*
* Base schemas
*/
var assignmentSchema = new Schema({
    name: {type: String, required: true},
    description: String,
    hidden: { type: Boolean, required: true },
    tests: {
        io: [{ type: Schema.Types.ObjectId, ref: 'Test', required: true }],
        lint: Boolean
    },
    optional_tests: {
        io: [{ type: Schema.Types.ObjectId, ref: 'Test', required: false }],
        lint: Boolean
    },
    languages: [String]
});

var testSchema = new Schema({
    stdout: {type: String, required: true},
    stdin: String,
    args: [String]
});

var userSchema = new Schema({
	username: {type: String, required: true},
    email: {type: String, required: false},
    admin: {type: Boolean, required: true},
    tokens: [{type: String, required: false}],
    courses: [{type: Schema.Types.ObjectId, ref: 'Course', required: false}],
    teaching: [{type: Schema.Types.ObjectId, ref: 'Course', required: false}],
    providers: [{type: String, required: true}] //LTU, KTH etc.
});

//user code submissions
var submissionSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true},
    assignment: { type: Schema.Types.ObjectId, ref: 'Assignment', required: true},
    args: { type: String, required: true }
});

var courseSchema = new Schema({
    course_code: {type: String, required: true},
    name: {type: String, required: true},
    description: {type: String, required: false},
    hidden: { type: Boolean, required: true },  //public or private course
    teachers: [{ type: Schema.Types.ObjectId, ref: 'User', required: false }],
    students: [{ type: Schema.Types.ObjectId, ref: 'User', required: false }],
    assignments: [{ type: Schema.Types.ObjectId, ref: 'Assignment', required: false }],
    features: [{ type: Schema.Types.ObjectId, ref: 'Features', required: true }], //progress, badges etc.
    enabled_features: {
        badges: Boolean,
        progress: Boolean
    }
});

/*
* Feature schemas
*/

//a general gamification badge
var badgeSchema = new Schema({
    icon: {type: String, required: true},   //path to an icon image file
    title: {type: String, required: true},
    description: {type: String, required: true}
});

//a course-specific badge. Needs reference to a course, badge and goals that "unlocks" it.
var courseBadgeSchema = new Schema({
    course_id: { type: Schema.Types.ObjectId, ref: 'Course', required: true},
    badge_id: { type: Schema.Types.ObjectId, ref: 'Badge', required: true},
    //Goals that "unlocks" the badge. This can be other badge(s), assignment(s) etc.
    goals: {
        badges: [{ type: Schema.Types.ObjectId, ref: 'Badge', required: false}],
        assignments:
        [{
            assignment: { type: Schema.Types.ObjectId, ref: 'Assignment', required: true},
            tests: [{ type: Schema.Types.ObjectId, ref: 'Test', required: false}],
            code_size: Number
        }]
    }
});

var featuresSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    progress: [{
        assignment: { type: Schema.Types.ObjectId, ref: 'Assignment', required: true},
        tests: [{test: { type: Schema.Types.ObjectId, ref: 'Test', required: true}, result: Boolean, optional_test: Boolean}],
        timing: {type: Number, required: true},
        code_size: {type: Number, required: true}
    }],
    badges: [{ type: Schema.Types.ObjectId, ref: 'Badge', required: false}],
    custom: {}
});

var Assignment = mongoose.model('Assignment', assignmentSchema);
var Test = mongoose.model('Test', testSchema);
var User = mongoose.model('User', userSchema);
var Submission = mongoose.model('Submission', submissionSchema);
var Course = mongoose.model('Course', courseSchema);
var Badge = mongoose.model('Badge', badgeSchema);
var CourseBadge = mongoose.model('CourseBadge', courseBadgeSchema);
var Features = mongoose.model('Features', featuresSchema);
var models = {Assignment: Assignment, Test: Test, User: User, Submission: Submission, Course: Course,
    Badge: Badge, CourseBadge: CourseBadge, Features: Features};

module.exports = models;
