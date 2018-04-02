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

dbSchoolObj.getSchools = function (id) {
    // var sql = 'SELECT ' + schoolsFields + ' FROM `schools` WHERE `city_id` = ?';
    var sql = 'SELECT name, city_id FROM schools AS s JOIN schools_to_cities AS stc ON s.school_id = stc.school_id WHERE stc.city_id = ?';
    var prop = id;

    return query(sql, prop);
};

module.exports = dbSchoolObj;