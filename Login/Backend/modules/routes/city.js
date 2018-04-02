var express = require('express');
var router = express.Router();
var dbCityObj = require('../db/city');
var errorsObj = require('../config/errors');

router.get('/:id', function (req, res, next) {
    var id = req.params.id;
    dbCityObj.getCities(id)
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