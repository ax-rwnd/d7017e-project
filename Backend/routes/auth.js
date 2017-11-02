'use strict';

var express = require('express');

var Assignment = require('../models/schemas').Assignment;
var Test = require('../models/schemas').Test;

var request = require('request');
var queries = require('../lib/queries/queries');
var passport = require('passport');
var CasStrategy = require('passport-cas').Strategy;

var errors = require('../lib/errors.js');
var jwt = require('jsonwebtoken');
var auth = require('express-jwt-token');
var parseXml = require('xml2js').parseString;
var check_access = require('../lib/access.js');
var https = require('https');

const TESTER_IP = 'http://130.240.5.118:9100';
const SECRET = 'supersecret';
const BACKEND_IP = 'http://130.240.5.119:8000';

// Time-to-Live of Tokens
const access_ttl = 15 * 60;
const refresh_ttl = 24 * 60 * 60;

function create_refresh_token(id) {
    return jwt.sign({
        id: id,
        access: false
    }, SECRET, {expiresIn: refresh_ttl});
}

function create_access_token(id) {
    return jwt.sign({
        id: id,
        access: true
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


    passport.use(new CasStrategy({
        version: 'CAS3.0',
        ssoBaseURL: 'https://weblogon.ltu.se/cas',
        serverBaseURL: 'http://127.0.0.1:8000'//BACKEND_IP
    }, function (profile, done) {
        console.log(profile);
        queries.findOrCreateUser(profile).then(function (user) {
            return done(null, user);
        }).catch(function (err) {
            return done(err);
        });
    }));

    router.get('/login/ltu', function (req, res){
        var ticket = req.query.ticket;
        var service = req.query.service;

        console.log(ticket);
        console.log(service);

        var url = 'https://weblogon.ltu.se/cas/serviceValidate?service=' + service + '&ticket=' + ticket;
        console.log(url);

        var requ = https.get(url, function (resu) {
            var output = '';
            //resu.setEncoding('utf8');

            resu.on('data', function (chunk) {
                output += chunk;
            });

            resu.on('end', function() {
                parseXml(output, function (err, result){
                    // Parse the CAS XML response
                    var success = result['cas:serviceResponse']['cas:authenticationSuccess'];
                    var return_obj;

                    if (success) {
                        var username = success[0]['cas:user'][0];
                        console.log("user = " + username);
                        var user = queries.findOrCreateUser(username);

                        // The JWT API tokens
                        var refresh_token = create_refresh_token(user._id);
                        var access_token = create_access_token(user._id);

                        return_obj = {access_token: access_token, token_type: process.env.jwtAuthHeaderPrefix, scope: '', expires_in: access_ttl, refresh_token: refresh_token};
                    } else {
                        var error = result['cas:serviceResponse']['cas:authenticationFailure'][0]['$']['code'];
                        console.log("error = " + error);

                        return_obj = {error: error};
                    }
                    res.json(return_obj);
                });
            });
        });
    });

    // router.get('/login/ltu/:successurl', passport.authenticate('cas', {session: false}), function (req, res) {
    //     console.log("Hej");
    //     var redirectUrl = req.params.successurl; 
    //     var access_token, refresh_token; // The JWT API keys

    //     refresh_token = create_refresh_token(req.user._id);
    //     access_token = create_access_token(req.user._id);
    //     return res.render('loginRedirect.hbs', {token: access_token, redirectURL: redirectUrl, layout: 'loginLayout'});


    //     //res.json({access_token: access_token, token_type: process.env.jwtAuthHeaderPrefix, scope: '', expires_in: access_ttl, refresh_token: refresh_token});
    // });

    if (process.env.NODE_ENV === 'development') {
        router.get('/login/fake', (req, res, next) => {
            queries.findOrCreateUser('test-student-00')
            .then(user => {
                res.json({
                    access_token: create_access_token(user._id),
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

    router.post('/token', function (req, res, next) {
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
