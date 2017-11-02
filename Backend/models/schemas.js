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
    email: {type: String, required: true},
    admin: {type: Boolean, required: true},
    courses: [{ type: Schema.Types.ObjectId, ref: 'Course', required: false}],
    providers: [{type: String, required: true}]
});

var submissionSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true},
    assignment: { type: Schema.Types.ObjectId, ref: 'Assignment', required: true},
    args: { type: String, required: true }
});

var courseSchema = new Schema({
    name: {type: String, required: true},
    description: {type: String, required: false},
    teachers: [{ type: Schema.Types.ObjectId, ref: 'User', required: false }],
    students: [{ type: Schema.Types.ObjectId, ref: 'User', required: false }],
    assignments: [{ type: Schema.Types.ObjectId, ref: 'Assignment', required: false }],
    features: [{ type: Schema.Types.ObjectId, ref: 'Features', required: true }]
});

/*
* Feature schemas
*/
var badgeSchema = new Schema({
    assignment_id: { type: Schema.Types.ObjectId, ref: 'Assignment', required: true},
    icon: {type: String, required: true},
    title: {type: String, required: true},
    description: {type: String, required: true},
    goals: {
        tests: [{ type: Schema.Types.ObjectId, ref: 'Test', required: false}],
        code_size: Number
    }
});

var featuresSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    progress: [{ type: Schema.Types.ObjectId, ref: 'Assignment', required: false}],
    performance: [{
        assignment: { type: Schema.Types.ObjectId, ref: 'Assignment', required: true},
        timing: {type: Number, required: true},
        score: {type: Number, required: true}
    }],
    badges: [{ type: Schema.Types.ObjectId, ref: 'Badges'}]
});

var Assignment = mongoose.model('Assignment', assignmentSchema);
var Test = mongoose.model('Test', testSchema);
var User = mongoose.model('User', userSchema);
var Submission = mongoose.model('Submission', submissionSchema);
var Course = mongoose.model('Course', courseSchema);
var Badge = mongoose.model('Badge', badgeSchema);
var Features = mongoose.model('Features', featuresSchema);
var models = {Assignment: Assignment, Test: Test, User: User, Submission: Submission, Course: Course,
    Badge: Badge, Features: Features};

module.exports = models;
