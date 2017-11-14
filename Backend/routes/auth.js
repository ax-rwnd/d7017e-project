'use strict';

var express = require('express');

var Assignment = require('../models/schemas').Assignment;
var Test = require('../models/schemas').Test;

var request = require('request');
var queries = require('../lib/queries/queries.js');
var auth = require('../lib/authentication.js');

//var passport = require('passport');
//var CasStrategy = require('passport-cas').Strategy;

var errors = require('../lib/errors.js');
var jwt = require('jsonwebtoken');
var parseXml = require('xml2js').parseString;
var https = require('https');
var config = require('config');

function create_refresh_token(id) {
    return jwt.sign({
        id: id
    }, config.get('App.secret'), {expiresIn: config.get('Auth.refresh_ttl')});
}

function create_access_token(id, admin) {
    return jwt.sign({
        id: id,
        admin: admin
    }, config.get('App.secret'), {expiresIn: config.get('Auth.access_ttl')});
}

module.exports = function (router) {

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


    // passport.use(new CasStrategy({
    //     version: 'CAS3.0',
    //     ssoBaseURL: 'https://weblogon.ltu.se/cas',
    //     serverBaseURL: 'http://127.0.0.1:8000'//BACKEND_IP
    // }, function (profile, done) {
    //     console.log(profile);
    //     queries.findOrCreateUser(profile).then(function (user) {
    //         return done(null, user);
    //     }).catch(function (err) {
    //         return done(err);
    //     });
    // }));

    router.get('/login/ltu', function (req, res, next){
        console.log("Login route");
        var ticket = req.query.ticket;
        var service = req.query.service;

        var url = config.get('Auth.cas_url') + 'serviceValidate?service=' + service + '&ticket=' + ticket;

        var requ = https.get(url, function (resu) {
            var output = '';

            resu.on('data', function (chunk) {
                output += chunk;
            });

            resu.on('end', function() {
                parseXml(output, function (err, result){
                    // Parse the CAS XML response
                    var success = result['cas:serviceResponse']['cas:authenticationSuccess'];

                    if (success) {
                        // Extract the username from the XML parse
                        var user = {username: success[0]['cas:user'][0]};
                        //var user.username = success[0]['cas:user'][0];

                        console.log("Hitta eller gör användare");
                        queries.findOrCreateUser(user).then(function (userObject) {
                            console.log("User found");
                            var refToken = create_refresh_token(userObject._id);
                            console.log(refToken);
                            queries.setRefreshToken(userObject, refToken);
                            console.log("Efter Ref token save");
                            res.json({
                                access_token: create_access_token(userObject._id, userObject.admin),
                                access_expires_in: config.get('Auth.access_ttl'),
                                refresh_token: refToken,
                                refresh_expires_in: config.get('Auth.refresh_ttl'),
                                token_type: config.get('Auth.auth_header_prefix')
                            });
                        })
                        .catch(function (err) {
                            console.log("Error");
                            next(err);
                        });

                    } else {
                        // Extract the error code from the XML parse
                        var error = result['cas:serviceResponse']['cas:authenticationFailure'][0].$.code;
                        next(error);
                        //res.json({error: error});
                    }
                });
            });
        });
    });

    if (config.get('App.environment') === 'development' || config.get('App.environment') === 'test') {
        router.get('/login/fake', (req, res, next) => {
            let admin = req.query.admin === 'true';
            let role = admin ? 'admin' : 'student';
            if (req.query.suffix !== 'string') {
                req.query.suffix = '00';
            }
            let profile = {
                username: `fake-${role}-${req.query.suffix}`,
                admin: admin,
                teaching: []
            };
            queries.findOrCreateUser(profile)
            .then(user => {
                res.json({
                    access_token: create_access_token(user._id, user.admin),
                    token_type: config.get('Auth.auth_header_prefix'),
                    scope: '',
                    expires_in: config.get('Auth.access_ttl')
                });
            })
            .catch(function (err) {
                next(err);
            });
        });
    }

    router.get('/logout', auth.validateRefToken, function (req, res, next) {
        console.log("Logout");
        var headerArray = req.headers.authorization.split(' ');
        var token = headerArray[1];
        queries.removeRefreshToken(req.user.id, token);
        res.status(200).send("Token invalidated");
    });

    router.get('/accesstoken', auth.validateRefToken, function (req, res, next) {
        queries.getUser(req.user.id, "username email courses admin").then(function (user) {
            res.json({
                access_token: create_access_token(user.id, user.admin),
                expires_in: config.get('Auth.access_ttl'),
                token_type: config.get('Auth.auth_header_prefix')
            });
        })
        .catch(function (err) {
            next(err);
        });
    });
};
