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
var https = require('https');
var config = require('config');
var constants = require('../lib/constants.js');
var logger = require('../lib/logger.js');

function create_refresh_token(id) {
    return jwt.sign({
        id: id
    }, config.get('App.secret'), {expiresIn: config.get('Auth.refresh_ttl')});
}

function create_access_token(id, admin, access) {
    return jwt.sign({
        id: id,
        //admin: admin,
        access: access,
    }, config.get('App.secret'), {expiresIn: config.get('Auth.access_ttl')});
}

module.exports = function (router) {
    router.get('/login/ltu', function (req, res, next){
        console.log("Login route");
        var ticket = req.query.ticket;
        var service = req.query.service;

        var url = config.get('Auth.cas_url') + 'serviceValidate?service=' + service + '&ticket=' + ticket + '&format=json';

        var requ = https.get(url, function (resu) {
            var output = '';

            resu.on('data', function (chunk) {
                output += chunk;
            });

            resu.on('end', function() {
                var result = JSON.parse(output);
                var profile = result.serviceResponse.authenticationSuccess;
                if (profile) {
                    // Extract the username and email
                    var user = {username: profile.user, email: profile.attributes.mail};

                    if (profile.attributes.affiliation.indexOf("student") !== -1) {
                        user.access = constants.ACCESS.BASIC;
                    } else if (profile.attributes.affiliation.indexOf("employee") !== -1) {
                        user.access = constants.ACCESS.ADVANCED;
                    }
                    logger.log(user);

                    queries.findOrCreateUser(user).then(function (userObject) {
                        var refToken = create_refresh_token(userObject._id);
                        queries.setRefreshToken(userObject, refToken);

                        res.json({
                            access_token: create_access_token(userObject._id, userObject.admin, userObject.access),
                            access_expires_in: config.get('Auth.access_ttl'),
                            refresh_token: refToken,
                            refresh_expires_in: config.get('Auth.refresh_ttl'),
                            token_type: config.get('Auth.auth_header_prefix')
                        });
                    })
                    .catch(function (err) {
                        next(err);
                    });

                } else {
                    // Extract the error code
                    var error = result.serviceResponse.authenticationFailure.code;
                    logger.log(error);
                    next(error);
                    //res.json({error: error});
                }
            });
        });
    });

    if (config.get('App.environment') === 'development' || config.get('App.environment') === 'test') {
        router.get('/login/fake', (req, res, next) => {
            let admin = req.query.admin === 'true';
            let role = admin ? 'admin' : 'student';
            let access = admin ? constants.ACCESS.ADMIN : constants.ACCESS.BASIC;
            if (req.query.suffix !== 'string') {
                req.query.suffix = '00';
            }
            let profile = {
                username: `fake-${role}-${req.query.suffix}`,
                //admin: admin,
                access: access,
                teaching: []
            };
            queries.findOrCreateUser(profile)
            .then(user => {
                res.json({
                    access_token: create_access_token(user._id, user.admin, user.access),
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
            console.log("USER.ACCESS = " + user.access);
            res.json({
                access_token: create_access_token(user.id, user.admin, user.access),
                expires_in: config.get('Auth.access_ttl'),
                token_type: config.get('Auth.auth_header_prefix')
            });
        })
        .catch(function (err) {
            next(err);
        });
    });
};
