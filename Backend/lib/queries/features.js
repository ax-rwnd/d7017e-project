'use strict';

var schemas = require('../../models/schemas.js');
var Assignment = require('../../models/schemas').Assignment;
var Course = require('../../models/schemas').Course;
var Test = require('../../models/schemas').Test;
var User = require('../../models/schemas').User;
var Badge = require('../../models/schemas').Badge;
var Features = require('../../models/schemas').Features;
var CourseMembers = require('../../models/schemas').CourseMembers;
var errors = require('../errors.js');
var logger = require('../logger.js');

function createBadge(data) {
    let badge = new Badge(data);
    return badge.save();
}

function getBadge(badge_id) {
    return Badge.findById(badge_id).then(function(badge) {
        if(badge === null)
            throw errors.BADGE_DO_NOT_EXIST;
        return badge;
    });
}

function updateBadge(badge_id, data) {
    return Badge.findOneAndUpdate({"_id": badge_id}, data, { runValidators: true, new: true}).then(function(badge) {
        if(badge === null)
            throw errors.BADGE_DO_NOT_EXIST;
        return badge;
    });
}

function deleteBadge(badge_id) {
    return Badge.findOneAndRemove({_id: badge_id})
    .then(badge => {
        if (!badge) {
            throw errors.BADGE_DO_NOT_EXIST;
        }
        return badge;
    });
}

function getBadgeByCourseID(course_id) {
    return Badge.find({'course_id': course_id}).then(function(badge) {
        if(badge === null)
            throw errors.BADGE_DO_NOT_EXIST;
        return badge;
    });
}

function getCourseByID(course_id) {
    return Course.findById(course_id).then(function(course) {
        if(course === null) {
            throw errors.COURSE_DO_NOT_EXIST;
        }
        return course;
    });
}

function getCourseByAssignmentID(assignment_id) {
    return Course.findOne({'assignments': assignment_id}).then(function(course) {
        if(course === null)
            throw errors.COURSE_DO_NOT_EXIST;
        return course;
    });
}

function getNumberOfAssignments(course_id) {
    return getCourseByID(course_id).then(function(course) {
        if(course === null){
            throw errors.COURSE_DO_NOT_EXIST;
        }
        return course.assignments.length;
    });
}

function createFeature(user_id, course_id) {
    let feature = new Features({user: user_id, progress: [], badges: []});
    return feature.save().then(function(data) {
        return data;
    }).catch(function(err) {
        throw err;
    });

}

function getFeatureByID(features_id) {
    return Features.findById(features_id)
    .populate({path: 'user', model: 'User'})
    .lean()
    .then(function(feature) {
        if(feature === null) {
            throw errors.FEATURE_DO_NOT_EXIST;
        }

        return feature;
    });
}

function updateFeatureProgress(user_id, features_id, assignment_id, data) {
    return Features.update({'_id': features_id, 'user': user_id, 'progress.assignment': assignment_id}, {'$set': {'progress.$': data}}, { runValidators: true })
    .then(function(result) {
        if(result.n === 0) {
            return Features.update({'_id': features_id, 'user': user_id}, {'$addToSet': {'progress': data}}, { runValidators: true, new: true})
            .then(function(result) {
                return result;
            });
        }
    });
}

function addBadgeToFeature(badge_id, features_id) {
    return Features.findById(features_id)
    .then(function(feature) {
        feature.badges.push(badge_id);
        return feature.save()
        .then(function(feature) {
            return true;
        });
    });
}

function getNumberOfCompletedAssignmentsByFeatureID(feature_id) {
    return Features.aggregate()
    .match({_id: feature_id})
    .project({
        completed: {$size:'$progress'}
    }).then(function(completed) {
        return completed[0].completed;
    });
}

function getFeaturesOfCourse(course_id) {

    let json = {};

    return getNumberOfAssignments(course_id).then(function(total_assignments) {

         json.total_assignments = total_assignments;
         json.features = [];

         return CourseMembers.find({course: course_id}, 'features')
         .populate({
             path: 'features', model:'Features',
             populate: [
                 {
                     path: 'user', model: 'User'
                 },{
                     path: 'badges', model: 'Badge'
                 },{
                     path: 'progress.tests.test', model: 'Test'
                 },{
                     path: 'progress.assignment', model: 'Assignment'
                 },{
                     path: 'progress.assignment.optional_tests.io', model: 'Test'
                 },{
                     path: 'progress.assignment.tests.io', model: 'Test'
                 }
             ]})
         .lean()
         .then(function(features) {
             for(let feature of features) {
                 feature = feature.features;
                 
                 delete feature.user.tokens;

                 feature.completed_assignments = feature.progress.length;
                 json.features.push(feature);
             }
             return json;
         });
    });
}

function getFeatureOfUserID(course_id, user_id) {
    return CourseMembers.findOne({course: course_id, user: user_id}, 'features')
    .populate({
        path: 'features', model:'Features',
        populate: [
            {
                path: 'user', model: 'User'
            },{
                path: 'badges', model: 'Badge'
            },{
                path: 'progress.tests.test', model: 'Test'
            },{
                path: 'progress.assignment', model: 'Assignment'
            },{
                path: 'progress.assignment.optional_tests.io', model: 'Test'
            },{
                path: 'progress.assignment.tests.io', model: 'Test'
            }
        ]})
    .lean()
    .then(function(feature) {
        feature = feature.features;

        delete feature.user.tokens;

        return getNumberOfAssignments(course_id)
        .then(function(total_assignments) {
            feature.total_assignments = total_assignments;
            feature.completed_assignments = feature.progress.length;
            return feature;
        });
    });
}

exports.createBadge = createBadge;
exports.getBadge = getBadge;
exports.getBadgeByCourseID = getBadgeByCourseID;
exports.updateBadge = updateBadge;
exports.deleteBadge = deleteBadge;
exports.getCourseByID = getCourseByID;
exports.getCourseByAssignmentID = getCourseByAssignmentID;
exports.getNumberOfAssignments = getNumberOfAssignments;
exports.createFeature = createFeature;
exports.getFeatureByID = getFeatureByID;
exports.updateFeatureProgress = updateFeatureProgress;
exports.addBadgeToFeature = addBadgeToFeature;
exports.getFeaturesOfCourse = getFeaturesOfCourse;
exports.getFeatureOfUserID = getFeatureOfUserID;
