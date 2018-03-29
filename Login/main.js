var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mysql = require('mysql');
var uuidv4 = require('uuid/v4');
var usersFields = '`id`, `username`, `surname`, `age`, `role`, `password`';
var tokensFields = '`id`, `uuid`, `timestamp`';

var connectionObj = {
    host: 'localhost',
    user: 'root',
    password: '123',
    database: 'newdb',
    connectionLimit: 100,
    port: 8000
};

var pool = mysql.createPool({
    host: connectionObj.host,
    user: connectionObj.user,
    password: connectionObj.password,
    database: connectionObj.database,
    connectionLimit: connectionObj.connectionLimit
});

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

var dbObj = {};

var query = function (sql, props) {
    return new Promise(function (resolve, reject) {
        pool.getConnection(function (err, connection) {
            if (err) {
                reject({ status: 409, message: errorsObj.DB_CON });
                return;
            }
            connection.query(
                sql, props,
                function (error, result) {
                    if (error) reject({ status: 409, message: errorsObj.DB_QUERY });
                    else resolve(result);
                }
            );
            connection.release();
        });
    });
};

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

dbObj.addUserToDb = function (username, surname, age, pass, role) {
    var sql = 'INSERT INTO `users` (`username`, `surname`, `age`, `role`, `password`) VALUES (?, ?, ?, ?, ?)';
    var userData = [username, surname, age, role, pass];
    return query(sql, userData);
}

function vaidate(data) {
    var usernameRegex = /^[а-яА-ЯёЁa-zA-Z-]{1,30}$/;
    var ageRegex = /^[0-9]{1,2}$/;
    var test = usernameRegex.test(String(data.username)) && usernameRegex.test(String(data.surname))
    && ageRegex.test(String(data.age));
    return test;
}

dbObj.checkUserData = function (username, password) {
    var sql = 'SELECT ' + usersFields + ' FROM `users` WHERE `username` = ? AND `password` = ?';
    var prop = [username, password];
    return query(sql, prop);
}

function login(user) {
    return dbObj.checkUserData(user.username, user.pass).then(function (results) {
        if (results.length) return results;
        throw ({ status: 406, message: errorsObj.AUTH });
    }).catch(function (result) {
        throw ({ status: result.status, message: result.message });
    });
}

dbObj.getAllUseres = function () {
    var sql = 'SELECT ' + usersFields + ' FROM `users`';
    return query(sql);
}

dbObj.checkUsername = function (name) {
    var sql = 'SELECT `id` FROM `users` WHERE `username` = ?';
    var prop = [name];
    return query(sql, prop);
}

dbObj.getUserById = function (id) {
    var sql = 'SELECT ' + usersFields + ' FROM `users` WHERE `id` = ?';
    var prop = id;

    return query(sql, prop);
}

dbObj.deleteUser = function (id) {
    var sql = 'DELETE FROM `users` WHERE `id` = ?';
    var prop = id;

    return query(sql, prop)
        .then(function (result) {
            if (result.affectedRows !== 0) {
                return ({ status: 200, message: 'User deleted', id: id });
            }
            return ({ status: 400, message: errorsObj.WRONG_ID });
        }).catch(function (result) {
            throw ({ status: result.status, message: result.message });
        });
}

dbObj.updateUserData = function (id, data) {
    var sql = 'UPDATE `users` SET `username`=?, `surname`=?, `age`=?, `role`=?, `password`=? WHERE id=?';
    var prop = [data.username, data.surname, data.age, data.role, data.pass, id];
    return query(sql, prop)
        .then(function (result) {
            if (result.affectedRows !== 0) {
                return ({ status: 200, message: 'User data updated' });
            }
            return ({ status: 400, message: errorsObj.WRONG_ID });
        }).catch(function (result) {
            throw ({ status: result.status, message: result.message });
        });
}

dbObj.isUnique = function (username, id) {
    return dbObj.checkUsername(username).then(function (results) {
        if (!results.length || (+results[0].id === +id)) return;
        throw ({ status: 406, message: errorsObj.USERNAME });
    }).catch(function (result) {
        throw ({ status: result.status, message: result.message });
    });
}

function countTimestamp(min) {
    return Date.now() + (60000 * min);
}

function setToken(results) {
    var timestamp = countTimestamp(20);
    var uuid = uuidv4();
    var sqlUpdate = 'UPDATE `tokens` SET `uuid`=?, `timestamp`=? WHERE id=?';
    var sqlInsert = 'INSERT INTO `tokens` (`uuid`, `timestamp`, `id`) VALUES (?, ?, ?)';
    var userData = [uuid, timestamp, results[0].id];
    return query(sqlUpdate, userData)
        .then(function (result) {
            if (result.affectedRows !== 0) {
                return uuid;
            }
            return query(sqlInsert, userData)
                .then(function (res) {
                    return uuid;
                }).catch(function (res) {
                    throw ({ status: res.status, message: res.message });
                });
        }).catch(function (result) {
            throw ({ status: result.status, message: result.message });
        });
}

dbObj.getDataFromToken = function (uuid) {
    var sql = 'SELECT ' + tokensFields + ' FROM `tokens` WHERE `uuid` = ?';
    var prop = uuid;
    return query(sql, prop);
}

function checkTimestamp(timestamp) {
    return (Date.now() < timestamp);
}

dbObj.deleteToken = function (id) {
    var sql = 'DELETE FROM `tokens` WHERE `id` = ?';
    var prop = id;

    return query(sql, prop)
        .then(
            function (result) {
                throw ({ status: 401, message: errorsObj.TOKEN_TIME });
            },
            function (result) {
                throw ({ status: result.status, message: result.message });
            }
        );
}

app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', '*');
    res.header('Access-Control-Allow-Methods', '*');

    next();
});

app.use(function (req, res, next) {
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
                if (checkTimestamp(timestamp)) {
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

app.post('/user', function (req, res, next) {
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

app.post('/signin', function (req, res, next) {
    login(req.body)
        .then(function (result) {
            return setToken(result);
        }).then(function (result) {
            return res.json({
                authtoken: result
            });
        })
        .catch(function (result) {
            res.status(result.status).json({ message: result.message });
        });
});

app.post('/user/:id', function (req, res, next) {
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

app.get('/user/:id', function (req, res, next) {
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

app.delete('/user/:id', function (req, res, next) {
    if (req.body.token !== 'admin') {
        return res.status(403).json({ message: errorsObj.ACCESS_DENIED });
    }
    return next();
}, function (req, res, next) {
    dbObj.deleteUser(req.params.id)
        .then(function (result) {
            var sql;
            var prop;
            if (result.id) {
                sql = 'DELETE FROM `tokens` WHERE `id` = ?';
                prop = result.id;
                return query(sql, prop).then(function () {
                    return res.status(result.status).json({ message: result.message });
                });
            }
            return res.status(result.status).json({ message: result.message });
        }).catch(function (result) {
            res.status(result.status).json({ message: result.message });
        });
});

app.get('/users', function (req, res, next) {
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

app.listen(connectionObj.port, function (error) {
    if (error) {
        console.log('Error:' + error.name + '\n');
    } else console.log('Listening port ' + connectionObj.port + '\n');
});

