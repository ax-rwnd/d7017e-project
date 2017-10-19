var schemas = require('../models/schemas.js')
var app = require('express')();
var Assignment = require('../models/schemas').Assignment;
var Test = require('../models/schemas').Test;

//get all tests related to a specific assignment in the format that Tester requires. 
function getTestsFromAssignment(assignmentID, callback) {
    
    testsToReturn = []  //the tests we want to return.

    Assignment.findById(assignmentID)
    .populate({
        path: 'tests',
        model: 'Test'
    })
    .exec(function(err, assignmentObject) {

        //The tests needs to match the format used by Tester.
        for (i = 0; i < assignmentObject.tests.length; i ++) { 
            testsToReturn.push( {stdin: assignmentObject.tests[i].stdin, 
                args: assignmentObject.tests[i].args, 
                stdout: assignmentObject.tests[i].stdout,
                id: assignmentObject.tests[i]._id
            } )
        }

        callback(testsToReturn)
    });
}

exports.getTestsFromAssignment = getTestsFromAssignment;



