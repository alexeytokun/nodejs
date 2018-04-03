var errorsObj = require('../config/errors');
var citiesFields = '`city_id`, `name`, `country_id`';
var pool = require('../config/connection').pool;

function validate(data) {
    return true;
}

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

dbCityObj.getAllCities = function () {
    var sql = 'SELECT ci.city_id, ci.name, co.name AS country FROM cities AS ci LEFT JOIN countries AS co ON co.country_id = ci.country_id';
    var prop = '';

    return query(sql, prop);
};

dbCityObj.getCities = function (id) {
    var sql = 'SELECT ' + citiesFields + ' FROM `cities` WHERE `country_id` = ?';
    var prop = id;

    return query(sql, prop);
};

dbCityObj.getCity = function (id) {
    var sql = 'SELECT `name` FROM `cities` WHERE `city_id` = ?';
    var prop = id;

    return query(sql, prop);
};

dbCityObj.addCity = function (name) {
    var sql = 'INSERT INTO `cities` (`name`) VALUES (?)';
    var prop = name;

    return query(sql, prop);
};

dbCityObj.updateCity = function (id, data) {
    var sql = 'UPDATE `cities` SET `name`=? WHERE `city_id`=?';
    var prop = [data.name, id];

    return query(sql, prop)
        .then(function (result) {
            if (result.affectedRows !== 0) {
                return ({ status: 200, message: 'City data updated' });
            }
            return ({ status: 400, message: errorsObj.WRONG_ID });
        })
        .catch(function (result) {
            throw ({ status: result.status, message: result.message });
        });
};

dbCityObj.deleteCity = function (id) {
    var sql = 'DELETE FROM `cities` WHERE `city_id` = ?';
    var prop = id;

    return query(sql, prop)
        .then(function (result) {
            if (result.affectedRows !== 0) {
                return ({ status: 200, message: 'City deleted', id: id });
            }
            return ({ status: 400, message: errorsObj.WRONG_ID });
        })
        .catch(function (result) {
            console.log('rej' + result);
            throw ({ status: result.status, message: result.message });
        });
};

module.exports = dbCityObj;
