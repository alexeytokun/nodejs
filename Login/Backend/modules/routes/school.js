var express = require('express');
var router = express.Router();
var dbSchoolObj = require('../db/school');
var errorsObj = require('../config/errors');

router.get('/', function (req, res, next) {
    var id = req.params.id;
    dbSchoolObj.getAllSchools()
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

router.get('/city/:id', function (req, res, next) {
    var id = req.params.id;
    dbSchoolObj.getSchools(id)
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