'use strict';

var queries = require('./queries/queries.js');

module.exports = function (req, res, next) {
    if (req.user.access) {
        queries.getUser(req.user.id)
        .then(user => {
            // Sets the req.user object to the returned database object
            req.user = user;
            next();
        })
        .catch(function (err) {
            next(err);
        });
    } else {
        res.json({error: 'Unauthorized', message: 'Not an access token'});
    }
};
