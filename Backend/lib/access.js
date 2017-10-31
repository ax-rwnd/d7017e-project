'use strict';

module.exports = function (req, res, next) {
    if (req.user.access) {
        next();
    } else {
        res.json({error: 'Unauthorized', message: 'Not an access token'});
    }
};
