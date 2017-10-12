

var app = require('express')();
var mongoose = require('mongoose');
var dbURI = 'mongodb://localhost/test';

mongoose.connect(dbURI);

function getAssignment(assignmentID) {
    
    var Test = mongoose.model('Test', test);
    
    //find the test matching our assignmentID
    Person.findOne({ 'ID': 'assignmentID' })  
} 
