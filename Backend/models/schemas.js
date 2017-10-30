//Mongoose schemas.

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var testSchema = new Schema({
    stdin: {type: String, required: false},
    args: [{type: String, required: false}],
    stdout: {type: String, required: true} 
});

var assignmentSchema = new Schema({
    assignmentName: {type: String, required: false},
    tests: [{ type: Schema.Types.ObjectId, ref: 'Test', required: true }]
});

var courseSchema = new Schema({
    name: {type: String, required: true},
    description: {type: String, required: true},
    teachers: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
    students: [{ type: Schema.Types.ObjectId, ref: 'User', required: false }],
    assignments: [{
        name: {type: String, required: true},
        description: String,
        tests: {
            io: [{
                stdout: {type: String, required: true},
                stdin: String,
                args: [String]
            }],
            lint: Boolean
        },
        optional_tests: {
            io: [{
                stdout: {type: String, required: true},
                stdin: String,
                args: [String]
            }],
            lint: Boolean
        },
        languages: [String]
    }]
});

var userSchema = new Schema({
	username: {type: String, required: true},
    email: {type: String, required: true},
    admin: {type: Boolean, required: true},
    courses: [{ type: Schema.Types.ObjectId, ref: 'Course', required: true }],
    providers: [{type: String, required: true}]
});

var Test = mongoose.model('Test', testSchema);
var Assignment = mongoose.model('Assignment', assignmentSchema);
var Course = mongoose.model('Course', courseSchema);
var User = mongoose.model('User', userSchema);
var models = {Assignment: Assignment, Test: Test, User: User, Course: Course};

module.exports = models;
