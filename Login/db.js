var mysql = require('mysql');
var query = 'INSERT INTO `users` (`username`, `surname`, `age`, `role`, `password`) VALUES ("Alt", "Smith", 22, "admin", "Hello123")';
var query2 = 'SELECT * FROM `users`';

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

connection.query(query, function (err, results) {
    if (err) throw err;
    console.log('Result: ' + results);
});

connection.query(query2, function (err, results) {
    if (err) throw err;
    console.log(results);
});
