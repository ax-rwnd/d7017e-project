'use strict';

var schemas = require('../../models/schemas.js');
var Assignment = require('../../models/schemas').Assignment;
var Course = require('../../models/schemas').Course;
var Test = require('../../models/schemas').Test;
var User = require('../../models/schemas').User;
var Badge = require('../../models/schemas').Badge;
var Features = require('../../models/schemas').Features;
var CourseBadge = require('../../models/schemas').CourseBadge;
var errors = require('../errors.js');
var logger = require('../../logger.js');

function createBadge(data) {
    let badge = new Badge(data);
    return badge.save();
}

function getBadge(badge_id) {
    return Badge.findById(badge_id);
}

function updateBadge(badge_id, data) {
    return Badge.findOneAndUpdate({"_id": badge_id}, data);
}

function createCourseBadge(data) {
    let courseBadge = new CourseBadge(data);
    return courseBadge.save();
}

function getCourseBadge(coursebadge_id) {
    return CourseBadge.findById(coursebadge_id);
}

function updateCourseBadge(coursebadge_id, data) {
    return CourseBadge.findOneAndUpdate({"_id": coursebadge_id}, data);
}

function getCourseBadgeByCourseID(course_id) {
    return CourseBadge.find({});
}

function getCourseByID(course_id) {
    return Course.findById(course_id);
}

function getCourseByAssignmentID(assignment_id) {
    return Course.findOne({"assignments": assignment_id});
}

function getNumberOfAssignments(course_id) {
    return Course.aggregate()
        .match({_id: course_id})
        .project({
            total: {$size:"$assignments"}
    });
}

function createFeature(user_id, course_id) {
    return new Promise((resolve, reject) => {
        let feature = new Features({user: user_id, progress: [], badges: []});
        feature.save().then(function(data) {
            let course = getCourseByID(course_id).then(function(course) {
                course.features.push(feature);
                course.save().then(function(course) {
                    resolve(feature);
                });
            });
        });
    });
}

function getFeatureByID(features_id) {
    return Features.findById(features_id);
}

function updateFeatureProgress(assignment_id, data) {
    Features.update({'progress.assignment': assignment_id}, {'$set': data}, function(err) {
        if(err) {
            logger.error(err);
        }
    });
}

function addBadgeToFeature(badge_id, features_id) {
    return new Promise((resolve, reject) => {
        getFeatureByID(features_id).then(function(feature) {
            feature.badges.push(badge_id);
            feature.save().then(function() {
                resolve(true);
            });
        });
    });
}

function getFeaturesByCourseID(course_id) {

}

function getNumberOfCompletedAssignments(course_id, user_id) {
    return new Promise((resolve, reject) => {
        Course.findById(course_id).then(function(course) {
            course.features.forEach(function(feature_id) {
                getFeatureByID(feature_id).then(function(feature) {
                    if(feature.user.equals(user_id)) {
                        Features.aggregate()
                            .match({_id: feature._id})
                            .project({
                                completed: {$size:"$progress"}
                        }).then(function(completed) {
                            resolve(completed);
                        });
                    }
                });
            });
        });
    });
}

exports.createBadge = createBadge;
exports.getBadge = getBadge;
exports.updateBadge = updateBadge;
exports.createCourseBadge = createCourseBadge;
exports.getCourseBadge = getCourseBadge;
exports.updateCourseBadge = updateCourseBadge;
exports.getCourseBadgeByCourseID = getCourseBadgeByCourseID;
exports.getCourseByID = getCourseByID;
exports.getCourseByAssignmentID = getCourseByAssignmentID;
exports.getNumberOfAssignments = getNumberOfAssignments;
exports.createFeature = createFeature;
exports.getFeatureByID = getFeatureByID;
exports.updateFeatureProgress = updateFeatureProgress;
exports.addBadgeToFeature = addBadgeToFeature;
exports.getNumberOfCompletedAssignments = getNumberOfCompletedAssignments;
