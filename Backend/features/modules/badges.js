'use strict';

var queries = require('../../lib/queries/features');
var helper = require('../features_helper');
var logger = require('../../logger');


function init(emitter, name) {
    emitter.on('handleFeatures', function(data) {
        return new Promise(function (resolve, reject){
            run(data).then(function(result) {
                let json = {};
                json[name] = result;
                resolve(json);
            });
        });
    });
}

async function run(data) {

    let newBadges = [];
    let feature = await helper.getFeature(data.user_id, data.assignment_id);

    // Merge result with existing data
    feature.progress = mergeResultWithProgress(data, feature.progress);

    let courseBadges = await queries.getCourseBadgeByCourseID(data.course_id);

    // Badges can need other badges in order to be completed
    let achievedNewBadge = true;
    while(achievedNewBadge) {
        // Only iterate loop if a new badge has been completed
        achievedNewBadge = false;
        for(let courseBadge of courseBadges) {
            // Calculate a new badge
            let badge = calcCourseBadge(feature.badges, feature.progress, courseBadge);
            if(badge !== undefined && feature.badges.indexOf(badge) === -1) {
                let result = await queries.addBadgeToFeature(badge, feature._id);
                newBadges.push(await queries.getBadge(badge));
                feature.badges.push(badge);
                achievedNewBadge = true;
            }
        }
    }


    return newBadges;
}

function mergeResultWithProgress(result, progress) {

    let assignmentExists = false;

    progress.forEach(function (assignment, i) {
        if(assignment.assignment == result.assignment_id) {
            assignmentExists = true;

            progress.splice(i, 1);
            progress.push(helper.prepareProgressData(result));
        }
    });

    if(!assignmentExists) {
        progress.push(helper.prepareProgressData(result));
    }

    return progress;
}

function calcCourseBadge(badges, progress, courseBadge) {

    // Compare badges
    if(!helper.arrayContainsArray(badges, courseBadge.goals.badges)) {
        logger.warn('Badges failed coursebadge');
        return;
    }

    for(let assignment of courseBadge.goals.assignments) {

        // Find assignment in progress
        let assignment_progress;
        for(let p of progress) {
            if(p.assignment.equals(assignment.assignment)) {
                assignment_progress = p;
                break;
            }
        }
        if(assignment_progress === undefined) {
            logger.warn("Assignment required for CourseBadge as not yet been done");
            return;
        }

        // Compare tests
        for(let test of assignment.tests) {
            let passed = false;
            for(let test_progress of assignment_progress.tests) {
                if(test.equals(test_progress.test) && test_progress.result === true) {
                    passed = true;
                }
            }
            if(passed === false) {
                logger.warn("Required test for badge was not completed");
                return;
            }
        }

        // Compare code size
        if("code_size" in assignment) {
            if(assignment.code_size < assignment_progress.code_size) {
                logger.warn("Code size was larger than required for CourseBadge");
                return;
            }
        }
    }

    return courseBadge.badge_id;
}

exports.init = init;
