var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var port = 8000;
var usersArr = [];
var id = 0;

function User (username, surname, age, id) {
    this.username = username;
    this.surname = surname;
    this.age = age;
    this.id = id;
}

app.post('/user', function (req, res) {
    var data = req.body;
    if ( vaidate(data) ) {
        var newUser = new User (data.username, data.surname, data.age, id);
        usersArr.push(newUser);
        res.send(String(id++));
    } else {
        res.status(406).send('Validation error\n');
    }
})

app.post('/user/:id', function (req, res) {
    var userId = req.params.id;
    var data = req.body;

    if (vaidate(data)) {
        if (usersArr[userId]) {
            var oldUser = usersArr[userId];
            oldUser.username = data.username;
            oldUser.surname = data.surname;
            oldUser.age = data.age;
            res.send('User data updated\n');
        } else {
            res.status(400).send('Wrong user id\n');
        }
    } else {
        res.status(406).send('Validation error\n');
    } 
})

app.get('/user/:id', function (req, res) {
    var userId = req.params.id;
    if (usersArr[userId]) {
        res.json(usersArr[userId]);
    } else {
        res.status(400).send('Wrong user id\n');
    }
})

app.delete('/user/:id', function (req, res) {
    var userId = req.params.id;
    if (usersArr[userId]) {
        delete usersArr[userId];
        res.send('User deleted\n');
    } else {
        res.status(400).send('Wrong user id\n');
    }
})

app.get('/users', function (req, res) {
    if (usersArr.length) {
        res.json(usersArr);
    } else {
        res.status(400).send('No users created\n');
    }
})

app.listen(port, function (error) {
    if(error) {
        console.log('Error:' + error.name + '\n');
    }

    console.log('Listening port ' + port + '\n')
});

function vaidate(data) {
    var usernameRegex = /^[а-яА-ЯёЁa-zA-Z\-]{1,30}$/;
    var ageRegex = /^[0-9]{1,2}$/;
    var test = usernameRegex.test(String(data.username)) && usernameRegex.test(String(data.surname)) && ageRegex.test(String(data.age));
    return test;
}