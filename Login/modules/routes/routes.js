var express = require('express');
var router = express.Router();
var dbObj = require('../db');

var errorsObj = {
    SERVER_CON: 'SERVER_CON_ERROR',
    ACCESS_DENIED: 'ACCESS_DENIED_ERROR',
    DB_CON: 'DB_CON_ERROR',
    DB_QUERY: 'DB_QUERY_ERROR',
    AUTH: 'AUTH_ERROR',
    WRONG_ID: 'WRONG_ID_ERROR',
    USERNAME: 'USERNAME_ERROR',
    TOKEN_TIME: 'TOKEN_TIME_ERROR',
    VALIDATION: 'VALIDATION_ERROR',
    NO_USERS: 'NO_USERS_ERROR'
};

function vaidate(data) {
    var usernameRegex = /^[а-яА-ЯёЁa-zA-Z-]{1,30}$/;
    var ageRegex = /^[0-9]{1,2}$/;
    var test = usernameRegex.test(String(data.username)) && usernameRegex.test(String(data.surname))
        && ageRegex.test(String(data.age));
    return test;
}

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

router.post('/user', function (req, res, next) {
    dbObj.isUnique(req.body.username).then(function () {
        next();
    }).catch(function (result) {
        return res.status(result.status).json({ message: result.message });
    });
}, function (req, res, next) {
    if (vaidate(req.body)) {
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
    if (!vaidate(req.body)) {
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
