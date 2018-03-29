var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var modules = require('./modules');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use('/', modules.auth);
app.use('/signin', modules.signin);
app.use('/user', modules.user);
app.use('/users', modules.users);

app.listen(modules.connectionObj.port, function (error) {
    if (error) {
        console.log('Error:' + error.name + '\n');
    } else console.log('Listening port ' + modules.connectionObj.port + '\n');
});

