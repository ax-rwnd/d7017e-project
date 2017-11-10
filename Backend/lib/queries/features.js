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
    Badge.findById(badge_id).then(function(badge) {
        if(badge === null)
            throw errors.BADGE_DO_NOT_EXIST;
        return badge;
    });
}

function updateBadge(badge_id, data) {
    Badge.findOneAndUpdate({"_id": badge_id}, data).then(function(badge) {
        if(badge === null)
            throw errors.BADGE_DO_NOT_EXIST;
        return badge;
    });
}

function createCourseBadge(data) {
    let courseBadge = new CourseBadge(data);
    return courseBadge.save();
}

function getCourseBadge(coursebadge_id) {
    CourseBadge.findById(coursebadge_id).then(function(courseBadge) {
        if(courseBadge === null)
            throw errors.COURSEBADGE_DO_NOT_EXIST;
        return courseBadge;
    });
}

function updateCourseBadge(coursebadge_id, data) {
    CourseBadge.findOneAndUpdate({'_id': coursebadge_id}, data).then(function(courseBadge) {
        if(courseBadge === null)
            throw errors.COURSEBADGE_DO_NOT_EXIST;
        return courseBadge;
    });
}

function getCourseBadgeByCourseID(course_id) {
    CourseBadge.find({'course_id': course_id}).then(function(courseBadge) {
        if(courseBadge === null)
            throw errors.COURSEBADGE_DO_NOT_EXIST;
        return courseBadge;
    });
}

function getCourseByID(course_id) {
    Course.findById(course_id).then(function(course) {
        if(course === null)
            throw errors.COURSE_DO_NOT_EXIST;
        return course;
    });
}

function getCourseByAssignmentID(assignment_id) {
    Course.findOne({'assignments': assignment_id}).then(function(course) {
        if(course === null)
            throw errors.COURSE_DO_NOT_EXIST;
        return course;
    });
}

function getNumberOfAssignments(course_id) {
    getCourseByID(course_id).then(function(course) {
        if(course === null)
            throw errors.COURSE_DO_NOT_EXIST;
        return course.assignments.length;
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
            }).catch(function(err) {
                reject(err);
            });
        });
    });
}

function getFeatureByID(features_id) {
    let feature =  Features.findById(features_id);
    if(feature === null)
        throw new Error('');
    return feature;
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

function getNumberOfCompletedAssignments(course_id, user_id) {
    return new Promise(async (resolve, reject) => {
        let course = await Course.findById(course_id);
        course.features.forEach(async function(feature_id) {
            let feature = await getFeatureByID(feature_id);
            if(feature.user.equals(user_id)) {
                Features.aggregate()
                .match({_id: feature._id})
                .project({
                    completed: {$size:'$progress'}
                }).then(function(completed) {
                    resolve(completed[0].completed);
                });
            }
        });
    });
}

async function getFeaturesOfCourse(course_id) {
    let json = {};

    json.total_assignments = await getNumberOfAssignments(course_id);

    let course = await Course.findById(course_id);

    json.features = [];
    for(let feature_id of course.features) {
        json.features.push(await getFeatureByID(feature_id));
    }

    return json;
}

async function getFeatureOfUserID(course_id, user_id) {
    let course = await Course.findById(course_id);

    for(let feature_id of course.features) {

        let feature = await getFeatureByID(feature_id);
        if(feature.user.equals(user_id)) {
            return await getFeatureByID(feature_id);
        }
    }

    // User had no feature in that course create it
    let feature = await createFeature(user_id, course_id);
    return await getFeatureByID(feature._id);
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
exports.getFeaturesOfCourse = getFeaturesOfCourse;
exports.getFeatureOfUserID = getFeatureOfUserID;
