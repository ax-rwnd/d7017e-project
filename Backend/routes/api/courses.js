'use strict';

var request = require('request');
var queries = require('../../lib/queries/queries');
var errors = require('../../lib/errors.js');
var auth = require('express-jwt-token');
var check_access = require('../../lib/access.js');

var Assignment = require('../../models/schemas').Assignment;
var Test = require('../../models/schemas').Test;

module.exports = function(router) {

    /*
    router.get('/coursestest', function(req, res) {
        res.send("/coursestest GET Endpoint");
    });
    */

    router.get('/', function (req, res) {
        res.send("/courses GET Endpoint");
    });

    router.post('/', auth.jwtAuthProtected, function (req, res) {
        res.send("/courses POST Endpoint");
    });

    router.get('/:course_id', auth.jwtAuthProtected, function (req, res) {
        var course_id = req.params.course_id;
        res.send("/courses/" + course_id + " GET Endpoint");
    });

    router.get('/:course_id/users', auth.jwtAuthProtected, function (req, res) {
        var course_id = req.params.course_id;
        res.send("/courses/" + course_id + "/users GET Endpoint");
    });

    router.get('/:course_id/assignments', auth.jwtAuthProtected, function (req, res) {
        var course_id = req.params.course_id;
        res.send("/courses/" + course_id + "/assignments GET Endpoint");
    });

    router.post('/:course_id/assignments', auth.jwtAuthProtected, function (req, res) {
        var course_id = req.params.course_id;
        res.send("/courses/" + course_id + "/assignments POST Endpoint");
    });

    router.get('/:course_id/assignments/:assignment_id', auth.jwtAuthProtected, function (req, res) {
        var course_id = req.params.course_id;
        var assignment_id = req.params.assignment_id;
        res.send("/courses/" + course_id + "/assignments/" + assignment_id + " GET Endpoint");
    });

    router.get('/:course_id/assignments/:assignment_id/tests', auth.jwtAuthProtected, function (req, res) {
        var course_id = req.params.course_id;
        var assignment_id = req.params.assignment_id;
        res.send("/courses/" + course_id + "/assignments/" + assignment_id + "/tests GET Endpoint");
    });

    router.get('/:course_id/assignments/:assignment_id/tests/:test_id', auth.jwtAuthProtected, function (req, res) {
        var course_id = req.params.course_id;
        var assignment_id = req.params.assignment_id;
        var test_id = req.params.test_id;
        res.send("/courses/" + course_id + "/assignments/" + assignment_id + "/tests/" + test_id + "GET Endpoint");
    });
};
