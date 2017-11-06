'use strict';

var jwt = require('jsonwebtoken');
var errors = require('./errors.js');
var util = require('util');


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

        if (auth[0].toLowerCase() !== process.env.JWT_AUTH_HEADER_PREFIX.toLowerCase()) {
            throw new AuthorizationError("Authorization header invalid format", 401, 6003);
        }

        var jwtToken = auth[1];
        jwt.verify(jwtToken, process.env.JWT_SECRET_KEY, function(err, payload) {
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
