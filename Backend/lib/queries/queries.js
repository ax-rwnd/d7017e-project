var schemas = require('../../models/schemas.js')
var Assignment = require('../../models/schemas').Assignment;
var Test = require('../../models/schemas').Test;

//get all tests related to a specific assignment. 
function getTestsFromAssignment(assignmentID, callback) {
    console.log(assignmentID)
    Assignment.findById(assignmentID)
    .populate({
        path: 'tests',
        model: 'Test'
    })
    
    .exec(function(err, assignmentObject) {
        callback(assignmentObject.tests)    
    });
}

exports.getTestsFromAssignment = getTestsFromAssignment;



