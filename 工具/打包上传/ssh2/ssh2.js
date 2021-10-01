const { Client } = require('ssh2')
const chalk = require('chalk')
const fs = require('fs')
const compressing = require('compressing')
const shell = require('shelljs')
const dayjs = require('dayjs')
const config = require('./config')

const currentEnv = process.argv[2]
const currentConfig = config[currentEnv]
const today = dayjs().format('YYYYMMDD')

const file = currentConfig.localPackage
const netPath = currentConfig.path

// * 打包
const compileDist = async () => {
	const command = `npm run build:${currentEnv}`
	const result = shell.exec(command)

	if (result.code === 0) {
		console.log(chalk.yellow(`打包成功`))
		compress()
	}
}

// * 压缩代码
function compress() {
	compressing.zip
		.compressDir('./dist/.', `./ssh2/${config.zipName}`)
		.then(() => {
			console.log(chalk.yellow(`Tip: 文件压缩成功，已压缩至【ssh2/${config.zipName}】`))
			// 连接函数
			// conFun()
		})
		.catch((err) => {
			console.log(chalk.red('Tip: 压缩报错'))
			console.error(err)
		})
}

// * 连接函数
function conFun() {
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
		upLoadFile(conn, currentConfig)
	})

	conn.on('error', function (err) {
		console.log(chalk.red('连接失败'))
		conn.end()
	})
}

// * 上传函数
function upLoadFile(conn) {
	if (!conn) {
		console.log(chalk.red('没有连接对象'))
		return
	}

	conn.sftp(function (err, sftp) {
		if (err) throw err

		sftp.readdir(netPath, async (err, list) => {
			if (err) throw err

			const isHaveDir = list.some((i) => {
				return i.filename === today
			})

			if (!isHaveDir) {
				await Shell(conn)
			}

			up(sftp, conn)

			conn.end()
		})
	})
}

// * 上传文件
function up(sftp, conn) {
	const local = file
	const target = `${netPath}/${today}/${config.zipName}`

	sftp.fastPut(local, target, {}, function (err, result) {
		if (err) throw err

		console.log(chalk.yellow('发布完成！！'))
		fs.unlinkSync(`./${config.zipName}`)
		conn.end()
	})
}

// * 执行Shell
function Shell(conn) {
	const comment = [
		`cd ${currentConfig.path}`,
		`mkdir ${today}`,
		`cd ${today}`,
		// 'unzip -o dist.zip',
		// 'rm -f dist.zip',
		'exit',
		'close',
	]

	return new Promise((resolve, reject) => {
		conn.shell(function (err, stream) {
			if (err) throw err
			stream
				.on('close', function () {
					console.log(chalk.yellow('创建今天日期文件完成！！'))
					resolve(true)
				})
				.on('data', function (data) {
					console.log('标准输出: ' + data)
				})
			stream.end(comment.join('\n'))
		})
	})
}

;(async () => {
	// await compileDist()
	conFun()
})()
