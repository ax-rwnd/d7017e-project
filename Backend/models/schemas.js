//Mongoose schemas.

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var testSchema = new Schema({
    stdin: {type: String, required: true}, 
    stdout: {type: String, required: true}, 
});

var assignmentSchema = new Schema({
    tests: [{type: Schema.Types.ObjectId, ref: 'Test', required: true}]
});


var Test = mongoose.model('Test', testsSchema);
var Assignment = mongoose.model('Assignment', assignmentSchema);
var Models = {Assignment: Assignment, Test: Test};

module.exports = Models;
