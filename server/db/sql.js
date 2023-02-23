const mysql = require('mysql')

let connection = mysql.createConnection({
	host: 'localhost',
	port: '3306',
	user: 'root',
	password: '',
	database: 'vue_store'
})

module.exports = connection;