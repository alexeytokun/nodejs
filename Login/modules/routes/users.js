var express = require('express');
var router = express.Router();
var dbObj = require('../db');
var errorsObj = require('../errors');

router.get('/', function (req, res, next) {
    if (req.body.token === 'admin' || req.body.token === 'user') {
        dbObj.getAllUseres()
            .then(function (results) {
                if (results.length) {
                    return res.json(results);
                }
                return res.status(400).json({ message: errorsObj.NO_USERS });
            })
            .catch(function (result) {
                res.status(result.status).json({ message: result.message });
            });
    } else {
        return next();
    }
}, function (req, res, next) {
    if (req.body.token === 'guest') {
        dbObj.getUserById(req.body.IdToken)
            .then(function (result) {
                if (result.length) {
                    res.json(result);
                } else {
                    res.status(400).json({ message: errorsObj.WRONG_ID });
                }
            })
            .catch(function (result) {
                res.status(result.status).json({ message: result.message });
            });
    } else {
        return next();
    }
}, function (req, res) {
    res.status(403).json({ message: errorsObj.ACCESS_DENIED });
});

module.exports = router;
