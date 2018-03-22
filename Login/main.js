var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var port = 8000;
var mysql = require('mysql');
var usersArr = [];
var userId;

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123',
    database: 'newdb'
});

connection.connect(showConnectionStatus);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

function addUserToDb(username, surname, age, pass, role) {
    return new Promise (
        function (resolve, reject) {
            var userData = [username, surname, age, role, pass];
            var query = 'INSERT INTO `users` (`username`, `surname`, `age`, `role`, `password`) VALUES (?, ?, ?, ?, ?)';
            connection.query(query, userData, function (err, results) {
                if (err) {
                    throw err;
                } 
                resolve (results.insertId);
            });
        }
    )
}

function vaidate(data) {
    var usernameRegex = /^[а-яА-ЯёЁa-zA-Z-]{1,30}$/;
    var ageRegex = /^[0-9]{1,2}$/;
    var test = usernameRegex.test(String(data.username)) && usernameRegex.test(String(data.surname))
    && ageRegex.test(String(data.age));
    return test;
}

function login(user) {

    return getAllUseres().then(
        function (results) {
            for (var obj of results) {
                if (obj.username === user.username && obj.password === user.pass) {
                    return obj;
                }
            }
            throw ('Wrong username or password');
        }
    )
}

function getAllUseres() {
    return new Promise( 
        function (resolve, reject) {
            connection.query('SELECT * FROM `users`', function (err, results) {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(results);
            });
        }
    )
}

function getUsernames() {
    return new Promise( 
        function (resolve, reject) {
            connection.query('SELECT `username` FROM `users`', function (err, results) {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(results);
            });
        }
    )
}

function getUserById(id) {
    return new Promise( 
        function (resolve, reject) {
            connection.query('SELECT * FROM `users` WHERE `id` = ?', id, function (err, results) {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(results);
            });
        }
    )
}

function deleteUser(id) {
    return new Promise( 
        function (resolve, reject) {
            connection.query('DELETE FROM `users` WHERE `id` = ?', id, function (err, results) {
                if (err) {
                    reject({status: 400, message: err});
                    return;
                }
                if (results.affectedRows !== 0) {
                    resolve({status: 200, message: 'User deleted'});
                } else {
                    resolve({status: 400, message: 'Wrong user id'});
                }
            });
        }
    )
}

function updateUserData(id, data) {
    return new Promise( 
        function (resolve, reject) {
            var query = 'UPDATE `users` SET `username`=?, `surname`=?, `age`=?, `role`=?, `password`=? WHERE id=?';
            var userData = [data.username, data.surname, data.age, data.role, data.pass, id];
            connection.query(query, userData, function (err, results) {
                if (err) {
                    reject({status: 400, message: err});
                    return;
                }
                if (results.affectedRows !== 0) {
                    resolve({status: 200, message: 'User data updated'});
                } else {
                    resolve({status: 400, message: 'Wrong user id'});
                } 
            });
        }
    )
}

function isUnique(username) {

    return getUsernames().then(
        function(results) {
            if (!results.length) return;
            for (var i = 0; i < results.length; i+=1) {
                if (results[i].username === username) {
                    throw ('Not unique username');
                }
            }
            return;
        }
    )
}

function reportWrongId(req, res) {
    res.status(400).json({ message: 'Wrong user id' });
}

function showConnectionStatus (err) {
    if (err){
        console.log('Not Connected!');
        return;
    } 
    console.log('Connected!');
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
    isUnique(req.body.username).then(
        function() {
            next();
        }
    ).catch(
        function(result) {
            return res.status(406).json({ message: result });
        }
    )
}, function (req, res, next) {
    if (vaidate(req.body)) {
        addUserToDb(req.body.username, req.body.surname, req.body.age, req.body.pass, req.body.role)
        .then(
            function (result) {
                return res.json({ message: result });
            }
        ).catch(
            function () {
                return next();
            }
        );
    }
    
}, function (req, res) {
    res.status(406).json({ message: 'Validation error' });
});

app.post('/signin', function (req, res, next) {
    login(req.body)
    .then(
        function(result){
            return res.json({
                roletoken: result.role,
                idtoken: result.id
            });
        }
    ).catch(
        function(result) {
            res.status(406).json({ message: result });
        }
    );
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
    .then(
        function(result) {
            return res.status(result.status).json({ message: result.message });
        }
    ).catch(
        function (result) {
            res.status(result.status).json({ message: result.message });
        }
    )
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
    .then(
        function (result) {
            if(result.length) {
                res.json(result[0]); //???
            } else {
                res.status(400).json({ message: 'Wrong user id' });
            }
        }   
    ).catch(
        function(result) {
            res.status(400).json({ message: result });
        }
    )
});

app.delete('/user/:id', function (req, res, next) {
    if (req.body.token !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
    }
    return next();
}, function (req, res, next) {

    deleteUser(req.params.id)
    .then(
        function(result) {
            return res.status(result.status).json({ message: result.message });
        }
    ).catch(
        function (result) {
            res.status(result.status).json({ message: result.message });
        }
    )
});

app.get('/users',  function (req, res, next) {
    if (req.body.token === 'admin' || req.body.token === 'user') {
        getAllUseres()
        .then(
            function (results){
                if(results.length) {
                    return res.json(results);
                } else {
                    return res.status(400).json({ message: 'No users created' });
                }
            }
        ).catch(
            function (result) {
                res.status(400).json({ message: result });
            }
        )
    } else {
        return next();
    }
}, function (req, res, next) {
    if (req.body.token === 'guest') {
        getUserById(req.body.IdToken)
        .then(
            function (result) {
                if(result.length) {
                    res.json(result); //???
                } else {
                    res.status(400).json({ message: 'Wrong user id' });
                }
            }   
        ).catch(
            function(result) {
                res.status(400).json({ message: result });
            }
        )
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

