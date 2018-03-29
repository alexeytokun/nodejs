var express = require('express');
var router = express.Router();
var dbObj = require('../db');
var errorsObj = require('../errors');

function login(user) {
    return dbObj.checkUserData(user.username, user.pass).then(function (results) {
        if (results.length) return results;
        throw ({ status: 406, message: errorsObj.AUTH });
    }).catch(function (result) {
        throw ({ status: result.status, message: result.message });
    });
}

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
                        }).catch(function (result) {
                            throw ({ status: result.status, message: result.message })
                        });
                }
                return dbObj.deleteToken(results[0].id);
            }).then(function (result) {
            if (result) {
                body.token = result[0].role;
                body.IdToken = result[0].id;
            }
            return next();
        }).catch(function (result) {
            body.token = 'anon';
            return res.status(result.status).json({ message: result.message });
        });
    } else return next();
});

router.post('/signin', function (req, res, next) {
    login(req.body)
        .then(function (result) {
            return dbObj.setToken(result);
        }).then(function (result) {
        return res.json({
            authtoken: result
        });
    })
        .catch(function (result) {
            res.status(result.status).json({ message: result.message });
        });
});

module.exports = router;
