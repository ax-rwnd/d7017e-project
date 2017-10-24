var Assignment = require('../models/schemas').Assignment;


var Test = require('../models/schemas').Test;
var request = require('request');
var queries = require('../lib/queries/queries');
var passport = require('passport');
var CasStrategy = require('passport-cas').Strategy;

var errors = require('../lib/errors.js');
var jwt = require('jsonwebtoken');
var auth = require('express-jwt-token');

const TESTER_IP = 'http://130.240.5.118:9100'

module.exports = function(router) {

/*
 * /ROUTE/TO/POST/CODE        THIS NEEDS A PROPER ROUTE
 */

/*router.post('/ROUTE/TO/POST/CODE', function(req, res) {
        var lang = req.body.lang;
    var code = req.body.code;
    var assignment_id = req.body.assignment_id;

    testerCom.validateCode(lang, code, assignment_id);
}*/


/*
 * /login/ Endpoints
 */


passport.use(new (require('passport-cas').Strategy)({ 
    version: 'CAS3.0',   
    ssoBaseURL: 'https://weblogon.ltu.se/cas',
    serverBaseURL: 'http://127.0.0.1:8000'
    }, function (profile, done) {
        console.log(profile);
        return done(null, profile);
        // User.findOne({login: login}, function (err, user) {
        //     if (err) {
        //       return done(err);
        //     }
        //     if (!user) {
        //       return done(null, false, {message: 'Unknown user'});
        //     }
        //     user.attributes = profile.attributes;
        //     return done(null, user);
        // });
}));


router.get('/login/ltu', passport.authenticate('cas', {session: false}), function (req, res) {
    var token; // the JWT API key
    token = jwt.sign({
        name: req.user.user,
        roles: req.user.attributes.affiliation
    }, 'supersecret', { expiresIn: '1h' });
    
    res.json({ api_key: token });
});

/*
 * Require JWT authorization for all routes below
 */
router.all('*', auth.jwtAuthProtected);

/*
 * /users/ Endpoints
 */
router.get('/users', function(req, res) {
    var ids = req.query.ids;
    if(!ids) {
        res.sendStatus(404);
        return
    }
    res.send("/users?ids=" + ids + " GET Endpoint " + req.user.name + " " + req.user.roles);
});

router.get('/users/:user_id', function(req, res) {
    var user_id = req.params.user_id;
    res.send("/users/" + user_id + " GET Endpoint");
});

router.delete('/users/:user_id', function(req, res) {
    var user_id = req.params.user_id;
    res.send("/users/" + user_id + " DELETE Endpoint");
});

router.post('/users/register', function(req, res) {
    res.send("/users/register POST Endpoint");
});

router.get('/users/:user_id/submissions', function(req, res) {
    var user_id = req.params.user_id;
    res.send("/users/" + user_id + "/submissions GET Endpoint");
});

router.get('/users/:user_id/courses', function(req, res) {
    var user_id = req.params.user_id;
    res.send("/users/" + user_id + "/courses GET Endpoint");
});

router.post('/users/:user_id/courses', function(req, res) {
    var user_id = req.params.user_id;
    res.send("/users/" + user_id + "/courses POST Endpoint");
});

router.get('/users/:user_id/courses/:course_id/submissions', function(req, res) {
    var user_id = req.params.user_id;
    var course_id = req.params.course_id;
    res.send("/users/" + user_id + "/courses/" + course_id + "/submissions GET Endpoint");
});




/*
 * /courses/ Endpoints
 */
router.get('/courses/:course_id/users', function(req, res) {
    var course_id = req.params.course_id;
    res.send("/courses/" + course_id + "/users GET Endpoint");
});

router.get('/courses/:course_id/submissions', function(req, res) {
    var course_id = req.params.course_id;
    res.send("/courses/" + course_id + "/submissions GET Endpoint");
});

router.post('/courses/:course_id/submissions', function(req, res) {
    var course_id = req.params.course_id;
    res.send("/courses/" + course_id + "/submissions POST Endpoint");
});

router.get('/courses/:course_id/submissions/:submission_id', function(req, res) {
    var course_id = req.params.course_id;
    var submission_id = req.params.submissions_id
    res.send("/courses/" + course_id + "/submissions/" + submission_id + " GET Endpoint");
});

router.get('/courses/:course_id/tests', function(req, res) {
    var course_id = req.params.course_id;
    res.send("/courses/" + course_id + "/tests GET Endpoint");
});

router.get('/courses/:course_id/tests/:test_id', function(req, res) {
    var course_id = req.params.course_id;
    var test_id = req.params.test_id
    res.send("/courses/" + course_id + "/tests/" + test_id + " GET Endpoint");
});

};
