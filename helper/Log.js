const fs = require('fs');
const moment = require('moment');

const errorLog = (message, filePath, requestUrl) => { //errorLog('test error', __filename, '/')
	fs.appendFile('public/logs/error_logs.txt', `\r\n[${moment().format('Y-MM-DD HH:mm:ss (Z)')}] ['${requestUrl}'] ['${filePath}']\r\n`, function (err) {
		if (err) return console.error(err, 'errorLog error');
	});
	fs.appendFile('public/logs/error_logs.txt', `=> ${message}\r\n`, function (err) {
		if (err) return console.error(err, 'errorLog error');
		console.error(message, 'errorLog');
	});
}

const consoleLog = (message, filePath, requestUrl) => { //consoleLog('test log', __filename, '/')
	fs.appendFile('public/logs/console_logs.txt', `\r\n[${moment().format('Y-MM-DD HH:mm:ss (Z)')}] ['${requestUrl}'] ['${filePath}']\r\n`, function (err) {
		if (err) return console.log(err, 'consoleLog error');
	});
	fs.appendFile('public/logs/console_logs.txt', `=> ${message}\r\n`, function (err) {
		if (err) return console.log(err, 'consoleLog error');
		console.log(message, 'consoleLog');
	});
}

module.exports = { errorLog, consoleLog };