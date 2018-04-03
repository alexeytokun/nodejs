var express = require('express');
var router = express.Router();
var dbSchoolObj = require('../db/school');
var errorsObj = require('../config/errors');

function validate(data) {
    return true;
}

router.get('/', function (req, res, next) {
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

router.get('/:id', function (req, res, next) {
    var id = req.params.id;
    dbSchoolObj.getSchool(id)
        .then(function (result) {
            if (result.length) {
                res.json(result[0]);
            } else {
                res.status(400).json({ message: errorsObj.WRONG_ID });
            }
        })
        .catch(function (result) {
            res.status(result.status).json({ message: result.message });
        });
});

router.post('/', function (req, res, next) { //add isUnique check
    if (validate(req.body)) {
        dbSchoolObj.addSchool(req.body.schoolname, req.body.cityname)
            .then(function (result) {
                return res.json({ message: result.insertId });
            })
            .catch(function (result) {
                return res.status(result.status).json({ message: result.message });
            });
    } else next();
}, function (req, res) {
    res.status(406).json({ message: errorsObj.VALIDATION });
});

router.post('/:id', function (req, res, next) { //add isUnique check
    if (!validate(req.body)) {
        return res.status(406).json({ message: errorsObj.VALIDATION });
    }
    return next();
}, function (req, res, next) {
    dbSchoolObj.updateSchool(req.params.id, req.body)
        .then(function (result) {
            return res.status(result.status).json({ message: result.message });
        })
        .catch(function (result) {
            res.status(result.status).json({ message: result.message });
        });
});

router.delete('/:id', function (req, res, next) {
    dbSchoolObj.deleteSchool(req.params.id)
        .then(function (result) {
            return res.status(result.status).json({ message: result.message });
        })
        .catch(function (result) {
            res.status(result.status).json({ message: result.message });
        });
});

module.exports = router;
