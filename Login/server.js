var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var connectionObj = require('./modules/connection');
var users = require('./modules/routes/users');
var signin = require('./modules/routes/signin');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use('/', signin);
app.use('/', users);

app.listen(connectionObj.port, function (error) {
    if (error) {
        console.log('Error:' + error.name + '\n');
    } else console.log('Listening port ' + connectionObj.port + '\n');
});

