'use strict';

var jwt = require('jsonwebtoken');
var errors = require('./errors.js');
var util = require('util');
var queries = require('./queries/queries');
var config = require('config');

function AuthorizationError(message, httpCode, errorCode) {
    this.name = this.constructor.name;
    this.message = message;
    this. httpCode = httpCode;
    this.errorCode = errorCode;
}
util.inherits(AuthorizationError, Error);

exports.validateJWTtoken = function (req, res, next) {
    try {
        if (!(req.headers && req.headers.authorization)){
            var err = new AuthorizationError("No Authorization header included", 401, 6000);
            throw err;
        }
        var auth = req.headers.authorization.split(' ');

        if (auth.length === 1) {
            throw new AuthorizationError("Authorization header invalid format", 401, 6001);
        }

        if (auth.length > 2) {
            throw new AuthorizationError("Authorization header invalid format", 401, 6002);
        }

        if (auth[0].toLowerCase() !== config.get('Auth.auth_header_prefix').toLowerCase()) {
            throw new AuthorizationError("Authorization header invalid format", 401, 6003);
        }

        var jwtToken = auth[1];
        jwt.verify(jwtToken, config.get('App.secret'), function(err, payload) {
            if (err) {
                if (err.name === "TokenExpiredError") {
                    throw new AuthorizationError("Token expired", 401, 6004);
                }
                if (err.name === "JsonWebTokenError") {
                    throw new AuthorizationError("Invalid token", 401, 6005);
                }
            }
            if (!payload.hasOwnProperty('admin')) {
                throw new AuthorizationError("Expect access token. Recieved refresh token.", 401, 6006);
            }

            req.user = payload;
            next();
        });

    } catch (err) {
        next(err);
    }

};

exports.validateRefToken = function (req, res, next) {
    console.log("Validera");
    try {
        if (!(req.headers && req.headers.authorization)){
            throw new AuthorizationError("No Authorization header included", 401, 6000);
        }
        var auth = req.headers.authorization.split(' ');

        if (auth.length === 1) {
            throw new AuthorizationError("Authorization header invalid format", 401, 6001);
        }

        if (auth.length > 2) {
            throw new AuthorizationError("Authorization header invalid format", 401, 6002);
        }

        if (auth[0].toLowerCase() !== config.get('Auth.auth_header_prefix').toLowerCase()) {
            throw new AuthorizationError("Authorization header invalid format", 401, 6003);
        }

        var jwtToken = auth[1];
        jwt.verify(jwtToken, config.get('App.secret'), function(err, payload) {
            if (err) {
                if (err.name === "TokenExpiredError") {
                    throw new AuthorizationError("Token expired", 401, 6004);
                }
                if (err.name === "JsonWebTokenError") {
                    throw new AuthorizationError("Invalid token", 401, 6005);
                }
            }
            if (payload.hasOwnProperty('admin')) {
                throw new AuthorizationError("Expected refresh token. Received access token.", 401, 6006);
            }

            queries.getUser(payload.id, "tokens").then(function (user) {
                console.log("tokenList = " + user.tokens);
                if (!user.tokens.includes(jwtToken)) {
                    throw new AuthorizationError("Invalid token", 401, 6005);
                }
                req.user = payload;
                next();
            })
            .catch(function (err) {
                next(err);
            });
        });
    } catch (err) {
        next(err);
    }
};
