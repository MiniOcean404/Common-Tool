const chalk = require('chalk')
const { Client } = require('ssh2')
const fs = require('fs')

// * 连接函数
function connFun(currentConfig) {
	return new Promise((resolve, reject) => {
		console.log(chalk.yellow('开始连接...\r\n'))

		const conn = new Client()
		conn.connect({
			host: currentConfig.ip,
			port: currentConfig.port,
			username: currentConfig.username,
			password: currentConfig.password,
		})

		conn.on('ready', function () {
			console.log(chalk.yellow('连接成功...\r\n'))
			resolve(conn)
		})

		conn.on('error', function (err) {
			console.log(chalk.red('连接失败'))
			conn.end()
			reject(err)
		})
	})
}

// * 读取sftp
function getSftp(conn) {
	return new Promise((resolve, reject) => {
		if (!conn) {
			console.log(chalk.red('没有连接对象'))
			return
		}

		conn.sftp(function (err, sftp) {
			if (err) reject(err)
			resolve(sftp)
		})
	})
}

function getDir(sftp, conn, netPath) {
	return new Promise((resolve, reject) => {
		sftp.readdir(netPath, async (err, list) => {
			if (err) reject(err)
			resolve(list)
		})
	})
}

// * 上传文件
function up(sftp, file, netPath, today, config) {
	return new Promise((resolve, reject) => {
		const local = file
		const target = `${netPath}/${today}/${config.zipName}`

		sftp.fastPut(local, target, {}, function (err, result) {
			if (err) throw err

			console.log(chalk.yellow('发布完成！！'))
			fs.unlinkSync(`./${config.zipName}`)
			resolve(true)
		})
	})
}

// * 执行Shell
function Shell(conn, commandList) {
	return new Promise((resolve, reject) => {
		conn.shell(function (err, stream) {
			if (err) reject(err)
			stream
				.on('close', function () {
					console.log(chalk.yellow('shell执行完成！！'))
					resolve(true)
				})
				.on('data', function (data) {
					console.log('标准输出: ' + data)
				})
			stream.end(commandList.join('\n'))
		})
	})
}

module.exports = {
	connFun,
	getSftp,
	Shell,
	up,
	getDir,
}
