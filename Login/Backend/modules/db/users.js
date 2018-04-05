var uuidv4 = require('uuid/v4');
var errorsObj = require('../config/errors');
var usersFields = '`id`, `username`, `surname`, DATE_FORMAT(age,"%Y%-%m%-%d") AS date, `role`, `password`';
var usersInfoFields = '`id`, `username`, `surname`, DATE_FORMAT(age,"%Y%-%m%-%d") AS date, `role`, `bio`';
var tokensFields = '`id`, `uuid`, `timestamp`';
var pool = require('../config/connection').pool;

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

var dbObj = {};

function countTimestamp(min) {
    return Date.now() + (60000 * min);
}

dbObj.addUserToDb = function (username, surname, age, pass, role, country, city, school, bio) {
    var sql = 'INSERT INTO `users` (`username`, `surname`, `age`, `role`, `password`, `country_id`, `city_id`,' +
        ' `school_id`, `bio`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
    var userData = [username, surname, age, role, pass, country, city, school, bio];
    return query(sql, userData);
};

dbObj.checkUserData = function (username, password) {
    var sql = 'SELECT ' + usersFields + ' FROM `users` WHERE `username` = ? AND `password` = ?';
    var prop = [username, password];
    return query(sql, prop);
};

dbObj.getAllUseres = function () {
    var sql = 'SELECT ' + usersFields + ' FROM `users`';
    return query(sql);
};

dbObj.checkUsername = function (name) {
    var sql = 'SELECT `id` FROM `users` WHERE `username` = ? COLLATE utf8_unicode_ci';
    var prop = [name];
    return query(sql, prop);
};

dbObj.getUserById = function (id) {
    // var sql = 'SELECT ' + usersFields + ' FROM `users` WHERE `id` = ?';
    var sql = 'SELECT ' + usersInfoFields + ', co.name AS country, ci.name AS city,' +
        ' sc.name AS school FROM `users` AS u LEFT JOIN `countries` AS co ON (u.country_id = co.country_id)' +
        ' LEFT JOIN `cities` AS ci ON (u.city_id = ci.city_id) LEFT JOIN `schools` AS sc' +
        ' ON (u.school_id = sc.school_id) WHERE u.id = ?;'
    var prop = id;

    return query(sql, prop);
};

dbObj.deleteUser = function (id) {
    var sql = 'DELETE FROM `users` WHERE `id` = ?';
    var prop = id;

    return query(sql, prop)
        .then(function (result) {
            if (result.affectedRows !== 0) {
                return ({ status: 200, message: 'User deleted', id: id });
            }
            return ({ status: 400, message: errorsObj.WRONG_ID });
        })
        .catch(function (result) {
            console.log('rej' + result);
            throw ({ status: result.status, message: result.message });
        });
};

dbObj.updateUserData = function (id, data) {
    var sql = 'UPDATE `users` SET `username`=?, `surname`=?, `age`=?, `role`=?, `password`=?,`country_id`=?, ' +
        '`city_id`=?, `school_id`=?, `bio`=? WHERE id=?';
    var prop = [data.username, data.surname, data.age, data.role, data.pass,
        data.country, data.city, data.school, data.bio, id];
    return query(sql, prop)
        .then(function (result) {
            if (result.affectedRows !== 0) {
                return ({ status: 200, message: 'User data updated' });
            }
            return ({ status: 400, message: errorsObj.WRONG_ID });
        })
        .catch(function (result) {
            throw ({ status: result.status, message: result.message });
        });
};

dbObj.isUnique = function (username, id) {
    return dbObj.checkUsername(username)
        .then(function (results) {
            if (!results.length || (+results[0].id === +id)) return;
            throw ({ status: 406, message: errorsObj.USERNAME });
        })
        .catch(function (result) {
            throw ({ status: result.status, message: result.message });
        });
};

dbObj.setToken = function (results) {
    var timestamp = countTimestamp(60);
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
                })
                .catch(function (res) {
                    throw ({ status: res.status, message: res.message });
                });
        })
        .catch(function (result) {
            throw ({ status: result.status, message: result.message });
        });
};

dbObj.getDataFromToken = function (uuid) {
    var sql = 'SELECT ' + tokensFields + ' FROM `tokens` WHERE `uuid` = ?';
    var prop = uuid;
    return query(sql, prop);
};

dbObj.checkTimestamp = function (timestamp) {
    return (Date.now() < timestamp);
};

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
};

dbObj.deleteUnusedToken = function (id) {
    var sql = 'DELETE FROM `tokens` WHERE `id` = ?';
    var prop = id;
    return query(sql, prop);
};

dbObj.getRole = function (uuid) {
    var sql = 'SELECT `role` FROM `users` AS u JOIN `tokens` AS t WHERE t.uuid = ? AND u.id = t.id';
    var prop = uuid;
    return query(sql, prop)
        .then(function (results) {
            if (results.length) return results;
            throw ({ status: 403, message: errorsObj.ACCESS_DENIED });
        })
        .catch(function (result) {
            throw ({ status: result.status, message: result.message });
        });
};

module.exports = dbObj;
