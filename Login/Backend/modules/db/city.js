var errorsObj = require('../config/errors');
var citiesFields = '`city_id`, `name`, `country_id`';
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

var dbCityObj = {};

dbCityObj.getCities = function (id) {
    var sql = 'SELECT ' + citiesFields + ' FROM `cities` WHERE `country_id` = ?';
    var prop = id;

    return query(sql, prop);
};

module.exports = dbCityObj;