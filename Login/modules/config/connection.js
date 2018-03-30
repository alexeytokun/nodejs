var mysql = require('mysql');

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

module.exports.connectionObj = connectionObj;
module.exports.pool = pool;
