const mysql = require('mysql')

let connection = mysql.createConnection({
	host: 'localhost',
	port: '3306',
	user: '',
	password: '',
	database: ''
})

module.exports = connection;