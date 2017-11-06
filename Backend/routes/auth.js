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

const TESTER_IP = 'http://130.240.5.118:9100';
const SECRET = 'supersecret';
const BACKEND_IP = 'http://130.240.5.119:8000';

// Time-to-Live of Tokens
const access_ttl = 15 * 60;
const refresh_ttl = 24 * 60 * 60;

function create_refresh_token(id) {
    return jwt.sign({
        id: id
    }, SECRET, {expiresIn: refresh_ttl});
}

function create_access_token(id, admin) {
    return jwt.sign({
        id: id,
        admin: admin
    }, SECRET, {expiresIn: access_ttl});
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

        var url = 'https://weblogon.ltu.se/cas/serviceValidate?service=' + service + '&ticket=' + ticket;

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
                        queries.findOrCreateUser(user).then(function(userObject) {
                            console.log("User found")
                            var refToken = create_refresh_token(userObject._id);
                            queries.setRefreshToken(userObject, refToken); 
                            console.log("Efter Ref token save");
                            res.json({
                                access_token: create_access_token(userObject._id, userObject.admin),
                                accesexpires_in: access_tt1,
                                refresh_token: refToken,
                                refreshexpires_in: refresh_tt1,
                                token_type: process.env.jwtAuthHeaderPrefix 
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


    if (process.env.NODE_ENV === 'development') {
        router.get('/login/fake', (req, res, next) => {
            let admin = req.query.admin === 'true';
            let role = admin ? 'admin' : 'student';
            if (req.query.suffix !== 'string') {
                req.query.suffix = '00';
            }
            let profile = {
                username: `fake-${role}-${req.query.suffix}`,
                admin: admin
            };
            queries.findOrCreateUser(profile)
            .then(user => {
                res.json({
                    access_token: create_access_token(user._id, user.admin),
                    token_type: process.env.jwtAuthHeaderPrefix,
                    scope: '',
                    expires_in: access_ttl
                });
            })
            .catch(function (err) {
                next(err);
            });
        });
    }

    router.post('/accesstoken', auth.validateRefToken, function (req, res, next) {



        var grant_type = req.body.grant_type;

        if (grant_type == 'refresh_token') {
            var refresh_token = req.body.refresh_token;

            try {
                var decoded = jwt.verify(refresh_token, SECRET);

                if (!decoded.access){
                    var access_token = create_access_token(decoded.id);
                    res.json({access_token: access_token, token_type: process.env.jwtAuthHeaderPrefix, scope: '', expires_in: access_ttl});
                } else {
                    res.json({error:"Invalid Token Type"});
                    //next(errors.INVALID_TOKEN);
                }
            } catch(err) {
                res.json(err);
                //next(errors.INVALID_TOKEN);
            }
        } else {
            res.json({error:"Invalid Grant Type"});
        }
    });
};
