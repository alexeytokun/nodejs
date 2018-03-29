var mysql = require('mysql');
var uuidv4 = require('uuid/v4');
var usersFields = '`id`, `username`, `surname`, `age`, `role`, `password`';
var tokensFields = '`id`, `uuid`, `timestamp`';
var connectionObj = require('../connection');

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

dbObj.addUserToDb = function (username, surname, age, pass, role) {
    var sql = 'INSERT INTO `users` (`username`, `surname`, `age`, `role`, `password`) VALUES (?, ?, ?, ?, ?)';
    var userData = [username, surname, age, role, pass];
    return query(sql, userData);
}

dbObj.checkUserData = function (username, password) {
    var sql = 'SELECT ' + usersFields + ' FROM `users` WHERE `username` = ? AND `password` = ?';
    var prop = [username, password];
    return query(sql, prop);
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
            console.log('rej' + result);
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

dbObj.countTimestamp = function (min) {
    return Date.now() + (60000 * min);
}

dbObj.setToken = function (results) {
    var timestamp = dbObj.countTimestamp(20);
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

dbObj.checkTimestamp = function (timestamp) {
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

dbObj.deleteUnusedToken = function (id) {
    var sql = 'DELETE FROM `tokens` WHERE `id` = ?';
    var prop = id;
    return query(sql, prop);
}

module.exports = dbObj;
