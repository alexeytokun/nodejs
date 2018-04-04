var express = require('express');
var router = express.Router();
var dbCityObj = require('../db/city');
var errorsObj = require('../config/errors');

function validate(data) {
    return true;
}

function isAdmin(req, res, next) {
    if (req.body.token !== 'admin') {
        return res.status(403).json({ message: errorsObj.ACCESS_DENIED });
    }
    return next();
}

router.get('/', function (req, res, next) {
    dbCityObj.getAllCities()
        .then(function (result) {
            if (result.length) {
                res.json(result);
            } else {
                res.status(400).json({ message: errorsObj.NO_CITIES });
            }
        })
        .catch(function (result) {
            res.status(result.status).json({ message: result.message });
        });
});

router.get('/country/:id', function (req, res, next) {
    var id = req.params.id;
    dbCityObj.getCities(id)
        .then(function (result) {
            if (result.length) {
                res.json(result);
            } else {
                res.status(400).json({ message: errorsObj.NO_CITIES });
            }
        })
        .catch(function (result) {
            res.status(result.status).json({ message: result.message });
        });
});

router.get('/:id', isAdmin, function (req, res, next) {
    var id = req.params.id;
    dbCityObj.getCity(id)
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

router.post('/', isAdmin, function (req, res, next) { //add isUnique check
    if (validate(req.body)) {
        dbCityObj.addCity(req.body.cityname, req.body.countryname)
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

router.post('/:id', isAdmin, function (req, res, next) { //add isUnique check
    if (!validate(req.body)) {
        return res.status(406).json({ message: errorsObj.VALIDATION });
    }
    return next();
}, function (req, res, next) {
    dbCityObj.updateCity(req.params.id, req.body)
        .then(function (result) {
            return res.status(result.status).json({ message: result.message });
        })
        .catch(function (result) {
            res.status(result.status).json({ message: result.message });
        });
});

router.delete('/:id', isAdmin, function (req, res, next) {
    dbCityObj.deleteCity(req.params.id)
        .then(function (result) {
            return res.status(result.status).json({ message: result.message });
        })
        .catch(function (result) {
            res.status(result.status).json({ message: result.message });
        });
});

module.exports = router;
