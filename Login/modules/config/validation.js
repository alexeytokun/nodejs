var regex = require('./regex');

function validate(data) {
    var test = regex.usernameRegex.test(String(data.username))
        && regex.usernameRegex.test(String(data.surname))
        && regex.ageRegex.test(String(data.age))
        && regex.passRegex.test(String(data.pass));
    return test;
}

module.exports = validate;
