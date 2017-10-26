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
    description: {type: String, required: true}
    //TDOD: More fields
});

var userSchema = new Schema({
	username: {type: String, required: true},
    email: {type: String, required: true},
    admin: {type: Boolean, required: true},
    courses: [{ type: Schema.Types.ObjectId, ref: 'Course', required: true }]
});

var Test = mongoose.model('Test', testSchema);
var Assignment = mongoose.model('Assignment', assignmentSchema);
var Course = mongoose.model('Course', courseSchema);
var User = mongoose.model('User', userSchema);
var models = {Assignment: Assignment, Test: Test, User: User, Course: Course};

module.exports = models;
