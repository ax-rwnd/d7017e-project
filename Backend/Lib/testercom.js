
var schemas = require('../models/schemas.js')
var app = require('express')();
var mongoose = require('mongoose');
var dbURI = 'mongodb://localhost/test';

var Assignment = mongoose.model('Assignment', assignmentSchema);
var Test = mongoose.model('Test', testSchema);

mongoose.connect(dbURI);


function getAssignment(assignmentID) {
    
    //find the assignment matching our assignmentID from the database
    assignment = new Assignment;
    assignment = Assignment.findOne({ '_id': 'assignmentID' }); 
    return Assignment;
} 

function getTestsFromAssignment(assignmentID) {
    assignment = new Assignment;
    assignment = getAssignment(assignmentID)
    
    //find all tests from an assignment
    tests = []
    
    assignment.find({'assignment.tests': }).cursor();
                     
    cursor.on('data', function (err, test) {
        //called once per document
        if (err) return handleError(err);
        
        //append tests
        test = {stdin: test.stdin, args: test.args, stdout:test.stdout, id: test._id};
        tests.push(test);
        
        console.log('%s %s %s %s.', test.stdin, test.args, test.stdout, test.id) // test print
    });

    return tests;                   
}
                                              
               
/*
Team.findOne({'teamMembers.username': 'Bioshox'}, {'teamMembers.$': 1},
    function (err, team) {
        if (team) {
            console.log(team.teamMembers[0].email);
        }
    }
);*/


