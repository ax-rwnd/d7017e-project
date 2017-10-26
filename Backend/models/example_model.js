/*var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var assignmentSchema = new Schema({
    name: {type: String, required: true},
    owner: {type: String, required: true},
    tests: [{type: Schema.Types.ObjectId, ref: 'Tests', required: false}]
});

var testsSchema = new Schema({
    name: {type: String, required: true},
    owner: {type: String, required: true}
});


var Assignment = mongoose.model('Assignment', assignmentSchema);
var Tests = mongoose.model('Tests', testsSchema);
var Models = {Assignment: Assignment, Tests: Tests};

module.exports = models;*/