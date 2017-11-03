'use strict';

var schemas = require('../../models/schemas.js');
var Assignment = require('../../models/schemas').Assignment;
var Course = require('../../models/schemas').Course;
var Test = require('../../models/schemas').Test;
var User = require('../../models/schemas').User;
var Badge = require('../../models/schemas').Badge;
var errors = require('../errors.js');
var logger = require('../../logger.js');

/*function getUser(id, fields) {
    var wantedFields = fields || "username email admin courses providers";
    return User.findById(id, wantedFields).then(function (user) {
        if (!user) {
            console.log("User not found");
            throw errors.TOKEN_USER_NOT_FOUND;
        }
        return user;
    });
}*/

function createBadge(data, res) {
    let badge = new Badge(data);

    return badge.save(function(err) {
        if (err) {
            // you could avoid http status if you want. I put error 500
            logger.error(err);
            res.sendStatus(500);
        } else {
            res.sendStatus(200);
        }
    });
}

function getFeatureOfUser(user_id, assignment_id) {

    console.log("user_id",user_id);
    console.log("assignment_id",assignment_id);
    return Course.find({assignments: assignment_id }).then(function(course) {
        console.log(course);
    });
}

exports.createBadge = createBadge;
exports.getFeatureOfUser = getFeatureOfUser;
