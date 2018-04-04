var express = require('express');
var router = express.Router();
var dbObj = require('../db/users');
var errorsObj = require('../config/errors');

function login(user) {
    return dbObj.checkUserData(user.username, user.pass)
        .then(function (results) {
            if (results.length) return results;
            throw ({ status: 406, message: errorsObj.AUTH });
        })
        .catch(function (result) {
            throw ({ status: result.status, message: result.message });
        });
}

router.post('/', function (req, res, next) {
    login(req.body)
        .then(function (result) {
            return dbObj.setToken(result);
        })
        .then(function (result) {
            return res.json({
                authtoken: result
            });
        })
        .catch(function (result) {
            res.status(result.status).json({ message: result.message });
        });
});

router.get('/role', function (req, res, next) {
    dbObj.getRole(req.headers['user-auth-token'])
        .then(function (result) {
            return res.json({
                role: result[0].role
            });
        })
        .catch(function (result) {
            res.status(result.status).json({ message: result.message });
        });
});

module.exports = router;
