var regex = {};

regex.usernameRegex = /^[а-яА-ЯёЁa-zA-Z-]{1,30}$/;
regex.ageRegex = /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/;
regex.passRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.*\s).{8,}$/;
regex.bioRegex = /^[\w .'"?!:;,-]*$/;
regex.selectRegex = /^[0-9]*$/;

module.exports = regex;
