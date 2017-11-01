'use strict';
//Mongoose schemas.

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var testSchema = new Schema({
    stdout: {type: String, required: true},
    stdin: String,
    args: [String]
});

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

var courseSchema = new Schema({
    name: {type: String, required: true},
    description: {type: String, required: false},
    hidden: {type: Boolean, required: true},
    teachers: [{ type: Schema.Types.ObjectId, ref: 'User', required: false }],
    students: [{ type: Schema.Types.ObjectId, ref: 'User', required: false }],
    assignments: [{ type: Schema.Types.ObjectId, ref: 'Assignment', required: false }]
});

var userSchema = new Schema({
	username: {type: String, required: true},
    email: {type: String, required: true},
    admin: {type: Boolean, required: true},
    courses: [{ type: Schema.Types.ObjectId, ref: 'Course', required: false }],
    providers: [{type: String, required: true}]
});

var Test = mongoose.model('Test', testSchema);
var Assignment = mongoose.model('Assignment', assignmentSchema);
var Course = mongoose.model('Course', courseSchema);
var User = mongoose.model('User', userSchema);
var models = {Assignment: Assignment, Test: Test, User: User, Course: Course};

module.exports = models;
