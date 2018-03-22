var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var port = 8000;
var mysql = require('mysql');

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
            connection.query(
                sql, props,
                function (err, res) {
                    if (err) reject(err);
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
        throw ({ message: 'Wrong username or password' });
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
        .then(function (results) {
            if (results.affectedRows !== 0) {
                return ({ status: 200, message: 'User deleted' });
            }
            return ({ status: 400, message: 'Wrong user id' });
        }).catch(function (err) {
            throw ({ status: 400, message: err });
        });
}

function updateUserData(id, data) {
    var sql = 'UPDATE `users` SET `username`=?, `surname`=?, `age`=?, `role`=?, `password`=? WHERE id=?';
    var prop = [data.username, data.surname, data.age, data.role, data.pass, id];
    return query(sql, prop)
        .then(function (results) {
            if (results.affectedRows !== 0) {
                return ({ status: 200, message: 'User data updated' });
            }
            return ({ status: 400, message: 'Wrong user id' });
        }).catch(function (err) {
            throw ({ status: 400, message: err });
        });
}

function isUnique(username) {
    return checkUsername(username).then(function (results) {
        if (!results.length) return;
        throw ({ message: 'Not unique username' });
    });
}

app.use(function (req, res, next) {
    var body;
    var headerRoleToken;
    var headerIdToken;
    if (req.method !== 'OPTIONS') {
        body = req.body;
        headerRoleToken = req.headers['user-role-token'];
        headerIdToken = +req.headers['user-id-token'];

        switch (headerRoleToken) {
        case 'admin':
            body.token = 'admin';
            body.IdToken = headerIdToken;
            break;
        case 'user':
            body.token = 'user';
            body.IdToken = headerIdToken;
            break;
        case 'guest':
            body.token = 'guest';
            body.IdToken = headerIdToken;
            break;
        default:
            body.token = 'anon';
            break;
        }
    }

    next();
});

app.use('/', function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', '*');
    res.header('Access-Control-Allow-Methods', '*');

    next();
});

app.post('/user', function (req, res, next) {
    isUnique(req.body.username).then(function () {
        next();
    }).catch(function (result) {
        return res.status(406).json({ message: result.message });
    });
}, function (req, res, next) {
    if (vaidate(req.body)) {
        addUserToDb(req.body.username, req.body.surname, req.body.age, req.body.pass, req.body.role)
            .then(function (result) {
                return res.json({ message: result.insertId });
            }).catch(function () {
                return next();
            });
    }
}, function (req, res) {
    res.status(406).json({ message: 'Validation error' });
});

app.post('/signin', function (req, res, next) {
    login(req.body)
        .then(function (result) {
            return res.json({
                roletoken: result[0].role,
                idtoken: result[0].id
            });
        }).catch(function (result) {
            res.status(406).json({ message: result.message });
        });
});

app.post('/user/:id', function (req, res, next) {
    if (req.body.token === 'guest' || req.body.token === 'anon'
    || ((req.body.token === 'user') && (+req.body.IdToken !== +req.params.id))) {
        return res.status(403).json({ message: 'Access denied' });
    }
    return next();
}, function (req, res, next) {
    if (!vaidate(req.body)) {
        return res.status(406).json({ message: 'Validation error' });
    }
    return next();
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
        return res.status(403).json({ message: 'Access denied' });
    }
    return next();
}, function (req, res, next) {
    getUserById(req.params.id)
        .then(function (result) {
            if (result.length) {
                res.json(result[0]);
            } else {
                res.status(400).json({ message: 'Wrong user id' });
            }
        }).catch(function (result) {
            res.status(400).json({ message: result });
        });
});

app.delete('/user/:id', function (req, res, next) {
    if (req.body.token !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
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
                return res.status(400).json({ message: 'No users created' });
            }).catch(function (result) {
                res.status(400).json({ message: result });
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
                    res.status(400).json({ message: 'Wrong user id' });
                }
            }).catch(function (result) {
                res.status(400).json({ message: result });
            });
    } else {
        return next();
    }
}, function (req, res) {
    res.status(403).json({ message: 'Access denied' });
});

app.listen(port, function (error) {
    if (error) {
        console.log('Error:' + error.name + '\n');
    }

    console.log('Listening port ' + port + '\n');
});

