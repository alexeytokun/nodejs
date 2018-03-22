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

connection.connect(function (err) {
    if (err) console.log('Not Connected!');
    console.log('Connected!');
});

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
                if (err) throw err;
                console.log('User saved');
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
    for (var obj of usersArr) {
        if (obj !== undefined) {
            if (obj.username === user.username && obj.pass === user.pass) {
                return obj;
            }
        }
    }
    return false;
}

function getUsernames() {
    return new Promise( 
        function (resolve, reject) {
            connection.query('SELECT `username` FROM `users`', function (err, results) {
                if (err) reject(err);
                resolve(results);
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

app.use(function (req, res, next) {
    var body;
    var headerRoleToken;
    var headerIdToken;
    if (req.method !== 'OPTIONS') {
        body = req.body;
        headerRoleToken = req.headers['user-role-token'];
        headerIdToken = +req.headers['user-id-token'];

        // console.log('Request URL:', req.originalUrl);
        // console.log('Request Type:', req.method);
        // console.log('Header: ', headerRoleToken);

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
    var user = login(req.body);
    if (user) {
        return res.json({
            roletoken: user.role,
            idtoken: user.id
        });
    }
    return next();
}, function (req, res) {
    res.status(406).json({ message: 'Wrong username or password' });
});

app.post('/user/:id', function (req, res, next) {
    if (req.body.token === 'guest' || req.body.token === 'anon'
    || ((req.body.token === 'user') && (req.body.IdToken !== req.params.id))) {
        return res.status(403).json({ message: 'Access denied' });
    }
    return next();
}, function (req, res, next) {
    if (!vaidate(req.body)) {
        return res.status(406).json({ message: 'Validation error' });
    }
    return next();
}, function (req, res, next) {
    var oldUser;
    if (usersArr[req.params.id]) {
        oldUser = usersArr[req.params.id];
        oldUser.username = req.body.username;
        oldUser.surname = req.body.surname;
        oldUser.age = req.body.age;
        oldUser.pass = req.body.pass;
        oldUser.role = req.body.role;
        return res.json({ message: 'User data updated' });
    }
    return next();
}, reportWrongId);

app.get('/user/:id', function (req, res, next) {
    if ((req.body.token === 'guest' || req.body.token === 'anon'
    || ((req.body.token === 'user') && (+req.body.IdToken !== +req.params.id)))
    && !req.headers.info) {
        return res.status(403).json({ message: 'Access denied' });
    }
    return next();
}, function (req, res, next) {
    if (usersArr[req.params.id]) {
        return res.json(usersArr[req.params.id]);
    }
    return next();
}, reportWrongId);

app.delete('/user/:id', function (req, res, next) {
    if (req.body.token !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
    }
    return next();
}, function (req, res, next) {
    var userId = req.params.id;
    if (usersArr[userId]) {
        delete usersArr[userId];
        return res.json({ message: 'User deleted' });
    }
    return next();
}, reportWrongId);

app.get('/users', function (req, res, next) {
    if (!usersArr.length) {
        return res.status(400).json({ message: 'No users created' });
    }
    return next();
}, function (req, res, next) {
    if (req.body.token === 'admin' || req.body.token === 'user') {
        return res.json(usersArr);
    }
    return next();
}, function (req, res, next) {
    var user;
    if (req.body.token === 'guest') {
        user = [];
        user.push(usersArr[req.body.IdToken]);
        return res.json(user);
    }
    return next();
}, function (req, res) {
    res.status(403).json({ message: 'Access denied' });
});

app.listen(port, function (error) {
    if (error) {
        console.log('Error:' + error.name + '\n');
    }

    console.log('Listening port ' + port + '\n');
});

