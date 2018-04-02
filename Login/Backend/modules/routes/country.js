var express = require('express');
var router = express.Router();
var dbInfoObj = require('../db/country');
var errorsObj = require('../config/errors');

router.get('/', function (req, res, next) {
    dbInfoObj.getCountries()
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
});

module.exports = router;