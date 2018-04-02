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

var dbInfoObj = {};

dbInfoObj.getCountries = function () {
    var sql = 'SELECT ' + countriesFields + ' FROM `countries`';
    var prop = '';

    return query(sql, prop);
};

module.exports = dbInfoObj;