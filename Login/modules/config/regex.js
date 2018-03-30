var regex = {};

regex.usernameRegex = /^[а-яА-ЯёЁa-zA-Z-]{1,30}$/;
regex.ageRegex = /^[0-9]{1,2}$/;
regex.passRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.*\s).{8,}$/;

module.exports = regex;
