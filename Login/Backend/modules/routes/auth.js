var express = require('express');
var router = express.Router();
var dbObj = require('../db/users');
var errorsObj = require('../config/errors');

router.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', '*');
    res.header('Access-Control-Allow-Methods', '*');

    next();
});

router.use(function (req, res, next) {
    var body;
    var headerAuthToken;
    var timestamp;

    if (req.method !== 'OPTIONS') {
        body = req.body;
        headerAuthToken = String(req.headers['user-auth-token']);
        if (headerAuthToken === 'undefined') {
            body.token = 'anon';
            return next();
        }
        dbObj.getDataFromToken(headerAuthToken)
            .then(function (results) {
                if (!results.length) {
                    body.token = 'anon';
                    return false;
                }
                timestamp = +results[0].timestamp;
                if (dbObj.checkTimestamp(timestamp)) {
                    return dbObj.getUserById(results[0].id)
                        .then(function (result) {
                            return result;
                        })
                        .catch(function (result) {
                            throw ({ status: result.status, message: result.message });
                        });
                }
                return dbObj.deleteToken(results[0].id);
            })
            .then(function (result) {
                if (result.length) {
                    body.token = result[0].role;
                    body.IdToken = result[0].id;
                }
                return next();
            })
            .catch(function (result) {
                if (!result) {
                    result = { status: 401, message: errorsObj.TOKEN_TIME_ERROR };
                }
                body.token = 'anon';
                return res.status(result.status).json({ message: result.message });
            });
    } else {
        return next();
    }
});

module.exports = router;