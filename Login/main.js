var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var port = 8000;
var mysql = require('mysql');
var uuidv4 = require('uuid/v4');

var pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '123',
    database: 'newdb',
    connectionLimit: 100
});

var query = function (sql, props) {
    return new Promise(function (resolve, reject) {
        pool.getConnection(function (err, connection) {
            if (err) {
                reject({ status: 409, message: 'DB_CON_ERROR' });
                return;
            }
            connection.query(
                sql, props,
                function (err, res) {
                    if (err) reject({ status: 409, message: 'DB_QUERY_ERROR' });
                    else resolve(res);
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

function addUserToDb(username, surname, age, pass, role) {
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

function checkUserData(username, password) {
    var sql = 'SELECT * FROM `users` WHERE `username` = ? AND `password` = ?';
    var prop = [username, password];
    return query(sql, prop);
}

function login(user) {
    return checkUserData(user.username, user.pass).then(function (results) {
        if (results.length) return results;
        throw ({ status: 406, message: 'AUTH_ERROR' });
    }).catch(function(result) {
        throw ({ status: result.status, message: result.message });
    });
}

function getAllUseres() {
    var sql = 'SELECT * FROM `users`';
    return query(sql);
}

function checkUsername(name) {
    var sql = 'SELECT `id` FROM `users` WHERE `username` = ?';
    var prop = [name];
    return query(sql, prop);
}

function getUserById(id) {
    var sql = 'SELECT * FROM `users` WHERE `id` = ?';
    var prop = id;

    return query(sql, prop);
}

function deleteUser(id) {
    var sql = 'DELETE FROM `users` WHERE `id` = ?';
    var prop = id;

    return query(sql, prop)
        .then(function (result) {
            if (result.affectedRows !== 0) {
                return ({ status: 200, message: 'User deleted' });
            }
            return ({ status: 400, message: 'WRONG_ID_ERROR' });
        }).catch(function (result) {
            throw ({ status: result.status, message: result.message });
        });
}

function updateUserData(id, data) {
    var sql = 'UPDATE `users` SET `username`=?, `surname`=?, `age`=?, `role`=?, `password`=? WHERE id=?';
    var prop = [data.username, data.surname, data.age, data.role, data.pass, id];
    return query(sql, prop)
        .then(function (result) {
            if (result.affectedRows !== 0) {
                return ({ status: 200, message: 'User data updated' });
            }
            return ({ status: 400, message: 'WRONG_ID_ERROR' });
        }).catch(function (result) {
            throw ({ status: result.status, message: result.message });
        });
}

function isUnique(username, id) {
    return checkUsername(username).then(function (results) {
        if (!results.length || (+results[0].id === +id)) return;
        throw ({ status: 406, message: 'USERNAME_ERROR' });
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

function getDataFromToken(uuid) {
    var sql = 'SELECT * FROM `tokens` WHERE `uuid` = ?';
    var prop = uuid;
    return query(sql, prop);
}

function checkTimestamp(timestamp) {
    return (Date.now() < timestamp);
}

function deleteToken(id) {
    var sql = 'DELETE FROM `tokens` WHERE `id` = ?';
    var prop = id;

    return query(sql, prop)
        .then(function (result) {
            throw ({ status: 401, message: 'TOKEN_TIME_ERROR' });
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
        getDataFromToken(headerAuthToken)
            .then(function (results) {
                if (!results.length) {
                    body.token = 'anon';
                    return;
                }
                timestamp = +results[0].timestamp;
                if (checkTimestamp(timestamp)) {
                    return getUserById(results[0].id)
                        .then(function (result) {
                            return result;
                        }).catch(function (result) {
                            throw ({ status: result.status, message: result.message })
                        });
                }
                return deleteToken(results[0].id);
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
    isUnique(req.body.username).then(function () {
        next();
    }).catch(function (result) {
        return res.status(result.status).json({ message: result.message });
    });
}, function (req, res, next) {
    if (vaidate(req.body)) {
        addUserToDb(req.body.username, req.body.surname, req.body.age, req.body.pass, req.body.role)
            .then(function (result) {
                return res.json({ message: result.insertId });
            }).catch(function (result) {
                return res.status(result.status).json({ message: result.message });
            });
    } else next();
}, function (req, res) {
    res.status(406).json({ message: 'VALIDATION_ERROR' });
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
        return res.status(403).json({ message: 'ACCESS_DENIED_ERROR' });
    }
    return next();
}, function (req, res, next) {
    if (!vaidate(req.body)) {
        return res.status(406).json({ message: 'VALIDATION_ERROR' });
    }
    return next();
}, function (req, res, next) {
    isUnique(req.body.username, req.params.id)
        .then(function (result) {
            next();
        }).catch(function (result) {
            return res.status(result.status).json({ message: result.message });
        });
}, function (req, res, next) {
    updateUserData(req.params.id, req.body)
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
        return res.status(403).json({ message: 'ACCESS_DENIED_ERROR' });
    }
    return next();
}, function (req, res, next) {
    getUserById(req.params.id)
        .then(function (result) {
            if (result.length) {
                res.json(result[0]);
            } else {
                res.status(400).json({ message: 'WRONG_ID_ERROR' });
            }
        }).catch(function (result) {
            res.status(result.status).json({ message: result.message });
        });
});

app.delete('/user/:id', function (req, res, next) {
    if (req.body.token !== 'admin') {
        return res.status(403).json({ message: 'ACCESS_DENIED_ERROR' });
    }
    return next();
}, function (req, res, next) {
    deleteUser(req.params.id)
        .then(function (result) {
            return res.status(result.status).json({ message: result.message });
        }).catch(function (result) {
            res.status(result.status).json({ message: result.message });
        });
});

app.get('/users', function (req, res, next) {
    if (req.body.token === 'admin' || req.body.token === 'user') {
        getAllUseres()
            .then(function (results) {
                if (results.length) {
                    return res.json(results);
                }
                return res.status(400).json({ message: 'NO_USERS_ERROR' });
            }).catch(function (result) {
                res.status(result.status).json({ message: result.message });
            });
    } else {
        return next();
    }
}, function (req, res, next) {
    if (req.body.token === 'guest') {
        getUserById(req.body.IdToken)
            .then(function (result) {
                if (result.length) {
                    res.json(result);
                } else {
                    res.status(400).json({ message: 'WRONG_ID_ERROR' });
                }
            }).catch(function (result) {
                res.status(result.status).json({ message: result.message });
            });
    } else {
        return next();
    }
}, function (req, res) {
    res.status(403).json({ message: 'ACCESS_DENIED_ERROR' });
});

app.listen(port, function (error) {
    if (error) {
        console.log('Error:' + error.name + '\n');
    } else console.log('Listening port ' + port + '\n');
});

