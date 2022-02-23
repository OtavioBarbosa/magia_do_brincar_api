var mysql = require('mysql');
require("dotenv/config")
const bluebird = require('bluebird');

var connection = mysql.createConnection({
    host     : process.env.DATABASE_HOST,
    port     : process.env.DATABASE_PORT,
    user     : process.env.DATABASE_USER,
    password : process.env.DATABASE_PASSWORD,
    database : process.env.DATABASE
});

bluebird.promisifyAll(connection)

module.exports = {
    mysql: connection
}