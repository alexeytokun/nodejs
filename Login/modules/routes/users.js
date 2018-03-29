var express = require('express');
var router = express.Router();
var dbObj = require('../db');
var errorsObj = require('../errors');
var validate = require('../validation')

// function validate(data) {
//     var usernameRegex = /^[а-яА-ЯёЁa-zA-Z-]{1,30}$/;
//     var ageRegex = /^[0-9]{1,2}$/;
//     var test = usernameRegex.test(String(data.username)) && usernameRegex.test(String(data.surname))
//         && ageRegex.test(String(data.age));
//     return test;
// }

router.post('/user', function (req, res, next) {
    dbObj.isUnique(req.body.username).then(function () {
        next();
    }).catch(function (result) {
        return res.status(result.status).json({ message: result.message });
    });
}, function (req, res, next) {
    if (validate(req.body)) {
        dbObj.addUserToDb(req.body.username, req.body.surname, req.body.age, req.body.pass, req.body.role)
            .then(function (result) {
                return res.json({ message: result.insertId });
            }).catch(function (result) {
            return res.status(result.status).json({ message: result.message });
        });
    } else next();
}, function (req, res) {
    res.status(406).json({ message: errorsObj.VALIDATION });
});

router.post('/user/:id', function (req, res, next) {
    if (req.body.token === 'guest' || req.body.token === 'anon'
        || ((req.body.token === 'user') && (+req.body.IdToken !== +req.params.id))) {
        return res.status(403).json({ message: errorsObj.ACCESS_DENIED });
    }
    return next();
}, function (req, res, next) {
    if (!validate(req.body)) {
        return res.status(406).json({ message: errorsObj.VALIDATION });
    }
    return next();
}, function (req, res, next) {
    dbObj.isUnique(req.body.username, req.params.id)
        .then(function (result) {
            next();
        }).catch(function (result) {
        return res.status(result.status).json({ message: result.message });
    });
}, function (req, res, next) {
    dbObj.updateUserData(req.params.id, req.body)
        .then(function (result) {
            return res.status(result.status).json({ message: result.message });
        }).catch(function (result) {
        res.status(result.status).json({ message: result.message });
    });
});

router.get('/user/:id', function (req, res, next) {
    if ((req.body.token === 'guest' || req.body.token === 'anon'
            || ((req.body.token === 'user') && (+req.body.IdToken !== +req.params.id)))
        && !req.headers.info) {
        return res.status(403).json({ message: errorsObj.ACCESS_DENIED });
    }
    return next();
}, function (req, res, next) {
    dbObj.getUserById(req.params.id)
        .then(function (result) {
            if (result.length) {
                res.json(result[0]);
            } else {
                res.status(400).json({ message: errorsObj.WRONG_ID });
            }
        }).catch(function (result) {
        res.status(result.status).json({ message: result.message });
    });
});

router.delete('/user/:id', function (req, res, next) {
    if (req.body.token !== 'admin') {
        return res.status(403).json({ message: errorsObj.ACCESS_DENIED });
    }
    return next();
}, function (req, res, next) {
    dbObj.deleteUser(req.params.id)
        .then(function (result) {
            if (result.id) {
                return dbObj.deleteUnusedToken(result.id).then(function () {
                    return res.status(result.status).json({ message: result.message });
                });
            }
            return res.status(result.status).json({ message: result.message });
        }).catch(function (result) {
        res.status(result.status).json({ message: result.message });
    });
});

router.get('/users', function (req, res, next) {
    if (req.body.token === 'admin' || req.body.token === 'user') {
        dbObj.getAllUseres()
            .then(function (results) {
                if (results.length) {
                    return res.json(results);
                }
                return res.status(400).json({ message: errorsObj.NO_USERS });
            }).catch(function (result) {
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
            }).catch(function (result) {
            res.status(result.status).json({ message: result.message });
        });
    } else {
        return next();
    }
}, function (req, res) {
    res.status(403).json({ message: errorsObj.ACCESS_DENIED });
});

module.exports = router;
