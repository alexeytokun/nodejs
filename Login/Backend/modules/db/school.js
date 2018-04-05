var errorsObj = require('../config/errors');
var schoolsFields = '`school_id`, `name`';
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

var dbSchoolObj = {};

dbSchoolObj.getAllSchools = function () {
    // var sql = 'SELECT ' + schoolsFields + ' FROM `schools` WHERE `city_id` = ?';
    var sql = 'SELECT s.school_id, s.name, c.name AS city, c.city_id AS city_id FROM schools AS s JOIN schools_to_cities AS stc ON s.school_id = stc.school_id LEFT JOIN cities AS c ON c.city_id = stc.city_id';
    var prop = '';
    return query(sql, prop);
};

dbSchoolObj.getSchools = function (id) {
    // var sql = 'SELECT ' + schoolsFields + ' FROM `schools` WHERE `city_id` = ?';
    var sql = 'SELECT s.name, s.school_id FROM schools AS s JOIN schools_to_cities AS stc ON s.school_id = stc.school_id WHERE stc.city_id = ?';
    var prop = id;
    return query(sql, prop);
};

dbSchoolObj.getSchool = function (id) {
    var sql = 'SELECT `name` FROM `schools` WHERE `school_id` = ?';
    var prop = id;

    return query(sql, prop);
};

dbSchoolObj.addSchool = function (school, city) {
    var sql = 'INSERT INTO `schools` (`name`) VALUES (?)';
    var prop = school;
    var cityId = city;

    return query(sql, prop)
        .then(function (result) {
            var newSql = 'INSERT INTO `schools_to_cities` (`school_id`, `city_id`) VALUES (?, ?)';
            var newProp = [result.insertId, cityId];
            return query(newSql, newProp);
        })
        .catch(function (result) {
            throw ({ status: result.status, message: result.message });
        });
};

dbSchoolObj.updateSchool = function (id, data) {
    var sql = 'UPDATE `schools` SET `name`=? WHERE `school_id`=?';
    var prop = [data.schoolname, +id];
    var cityId = data.cityname;
    var oldCityId = data.oldcityname;

    return query(sql, prop)
        .then(function (result) {
            if (result.affectedRows !== 0) {
                return dbSchoolObj.updateSchootToCity(id, cityId, oldCityId);
                // return ({ status: 200, message: 'School data updated' });
            }
            return ({ status: 400, message: errorsObj.WRONG_ID });
        })
        .catch(function (result) {
            throw ({ status: result.status, message: result.message });
        });
};

dbSchoolObj.updateSchootToCity = function (school_id, city_id, old_city_id) {
    var sql = 'UPDATE `schools_to_cities` SET `city_id`=? WHERE `school_id`=? AND `city_id`=?';
    var prop = [+city_id, +school_id, +old_city_id];

    return query(sql, prop)
        .then(function (result) {
            if (result.affectedRows !== 0) {
                return ({ status: 200, message: 'School data updated' });
            }
            return ({ status: 400, message: errorsObj.WRONG_ID });
        })
        .catch(function (result) {
            throw ({ status: result.status, message: result.message });
        });
}

dbSchoolObj.deleteSchool = function (id) {
    var sql = 'DELETE FROM `schools` WHERE `school_id` = ?';
    var prop = id;

    return query(sql, prop)
        .then(function (result) {
            if (result.affectedRows !== 0) {
                return ({ status: 200, message: 'School deleted', id: id });
            }
            return ({ status: 400, message: errorsObj.WRONG_ID });
        })
        .catch(function (result) {
            throw ({ status: result.status, message: result.message });
        });
};

module.exports = dbSchoolObj;
