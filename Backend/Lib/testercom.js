
var schemas = require('../models/schemas.js')
var app = require('express')();
//var mongoose = require('mongoose');
//var dbURI = 'mongodb://localhost/test'; 

var Assignment = require('../models/schemas').Assignment;
var Test = require('../models/schemas').Test;



var getTestsFromAssignment = function (assignmentID) {
    
    //assignment = getAssignment(assignmentID)
    
    //find all tests from an assignment
    testss = []

    /*Assignment.findById(assignmentID)
    .populate({
        //model: 'Test',
        path: '_id'
    })
    .exec(function(err, assignmentObject) {
        console.log(assignmentObject)
    });*/


    /*Assignment.findOne( { '_id': assignmentID }, function(err, assignment) {
        var t1 = assignment['tests']
        Test.findByID( {t1}, function(err, test1) {

            console.log(test1);
        });
    }); */
    /*populate('tests').
    exec(function(err, result){
        testss.push(result)
        console.log(result)
    });*/
    //console.log(testss) 

    Assignment.findOne({ '_id': assignmentID})
        .populate('tests')
        .exec(function(err, assignment) {


            if (err) return console.log(err);
            console.log(assignment);
        });
//
    
    
    /*Assignment.find({ _id: assignmentID}, function(err, assignment) {
        if (err) return console.log(err);
        console.log(assignment.tests[1]);
    });*/
    /*Assignment.find({'assignment_id': assignmentID, 'assignment.tests': }).cursor();
                     
    cursor.on('data', function (err, test) {
        //called once per document
        if (err) return handleError(err);
        
        //append tests
        test = {stdin: test.stdin, args: test.args, stdout:test.stdout, id: test._id};
        tests.push(test);
        
        console.log('%s %s %s %s.', test.stdin, test.args, test.stdout, test.id) // test print
    }); */

    return testss;                   
}

exports.getTestsFromAssignment = getTestsFromAssignment;


/*function getAssignment(assignmentID) {
    
    //find the assignment matching our assignmentID from the database
    assignment = new Assignment;
    assignment = Assignment.findByID({assignmentID}); 
    return assignment;
} */



                                    
               
/*
Team.findOne({'teamMembers.username': 'Bioshox'}, {'teamMembers.$': 1},
    function (err, team) {
        if (team) {
            console.log(team.teamMembers[0].email);
        }
    }
);*/


