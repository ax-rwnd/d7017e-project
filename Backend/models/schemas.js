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

var Test = mongoose.model('Test', testSchema);
var Assignment = mongoose.model('Assignment', assignmentSchema);
var models = {Assignment: Assignment, Test: Test};

module.exports = models;
