var schemas = require('../../models/schemas.js')

var Assignment = require('../../models/schemas').Assignment;
var Test = require('../../models/schemas').Test;
var Course = require('../../models/schemas').Course;

//get all tests related to a specific assignment. 
function getTestsFromAssignment(assignmentID, callback) {
    Assignment.findById(assignmentID)
    .populate({
        path: 'tests',
        model: 'Test'
    })
    
    .exec(function(err, assignmentObject) {
        callback(assignmentObject.tests)    
    });
}

//get assignments from a course
function getAssignmentsCourse(courseID, callback) {
    getCourse(courseID, function(course) {
        callback(course.assignments);
    });
}

exports.getTestsFromAssignment = getTestsFromAssignment;



