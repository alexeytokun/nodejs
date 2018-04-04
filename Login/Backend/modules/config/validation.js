var regex = require('./regex');

function validate(data) {

    var username = data.username;
    var surname = data.surname;
    var age = data.age;
    var pass = data.pass;
    var bio = data.bio;
    var country = data.country;
    var city = data.city;
    var school = data.school;

    return regex.usernameRegex.test(String(username))
        && regex.usernameRegex.test(String(surname))
        && regex.ageRegex.test(String(age))
        && regex.passRegex.test(String(pass))
        && regex.bioRegex.test(bio)
        && regex.selectRegex.test(country)
        && regex.selectRegex.test(city)
        && regex.selectRegex.test(school);
}

module.exports = validate;
