

var app = require('express')();
var mongoose = require('mongoose');
var dbURI = 'mongodb://localhost/test';

var Assignment = mongoose.model('Assignment', assignment);
var Test = mongoose.model('Test', test);

mongoose.connect(dbURI);

function getAssignment(assignmentID) {
    
    //find the assignment matching our assignmentID from the database
    return Assignment.findOne({ '_id': 'assignmentID' }) 
} 

function getTestFromAssignment(assignment, index) {
    
    //find a test from assignment
    return Test
}



