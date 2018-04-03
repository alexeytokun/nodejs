var errorsObj = require('../config/errors');
var countriesFields = '`country_id`, `name`';
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

var dbCountryObj = {};

dbCountryObj.getCountries = function () {
    var sql = 'SELECT ' + countriesFields + ' FROM `countries`';
    var prop = '';

    return query(sql, prop);
};


dbCountryObj.getCountry = function (id) {
    var sql = 'SELECT `name` FROM `countries` WHERE `country_id` = ?';
    var prop = id;

    return query(sql, prop);
};

dbCountryObj.addCountry = function (name) {
    var sql = 'INSERT INTO `countries` (`name`) VALUES (?)';
    var prop = name;

    return query(sql, prop);
};

dbCountryObj.updateCountry = function (id, data) {
    var sql = 'UPDATE `countries` SET `name`=? WHERE `country_id`=?';
    var prop = [data.name, id];

    return query(sql, prop)
        .then(function (result) {
            if (result.affectedRows !== 0) {
                return ({ status: 200, message: 'Country data updated' });
            }
            return ({ status: 400, message: errorsObj.WRONG_ID });
        })
        .catch(function (result) {
            throw ({ status: result.status, message: result.message });
        });
};

dbCountryObj.deleteCountry = function (id) {
    var sql = 'DELETE FROM `countries` WHERE `country_id` = ?';
    var prop = id;

    return query(sql, prop)
        .then(function (result) {
            if (result.affectedRows !== 0) {
                return ({ status: 200, message: 'Country deleted', id: id });
            }
            return ({ status: 400, message: errorsObj.WRONG_ID });
        })
        .catch(function (result) {
            console.log('rej' + result);
            throw ({ status: result.status, message: result.message });
        });
};

module.exports = dbCountryObj;
