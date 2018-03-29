var modules = {};

modules.connectionObj = require('./config/connection');
modules.auth = require('./routes/auth');
modules.user = require('./routes/user');
modules.users = require('./routes/users');
modules.signin = require('./routes/signin');

module.exports = modules;

