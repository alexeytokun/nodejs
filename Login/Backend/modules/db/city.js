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

dbCityObj.addCity = function (name, countryId) {
    var sql = 'INSERT INTO `cities` (`name`, `country_id`) VALUES (?,?)';
    var prop = [name, countryId];

    return query(sql, prop);
};

dbCityObj.updateCity = function (id, data) {
    var sql = 'UPDATE `cities` SET `name`=?, `country_id`=? WHERE `city_id`=?';
    var prop = [data.cityname, data.countryname, id];

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

dbCityObj.isUnique = function (name, countryname, id) {
    return dbCityObj.checkCityname(name, countryname)
        .then(function (results) {
            if (!results.length || (+results[0].city_id === +id)) return;
            throw ({ status: 406, message: errorsObj.USERNAME });
        })
        .catch(function (result) {
            throw ({ status: result.status, message: result.message });
        });
};

dbCityObj.checkCityname = function (name, countryname) {
    var sql = 'SELECT `city_id` FROM `cities` WHERE `name` = ? AND country_id = ?';
    var prop = [name, countryname];
    console.log(prop);
    return query(sql, prop);
};

module.exports = dbCityObj;
