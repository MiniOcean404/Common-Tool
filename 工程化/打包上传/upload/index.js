// * 导入文件
const shell = require('shelljs')
const Client = require('ssh2-sftp-client')
const config = require('./config.js')
const chalk = require('chalk')

const currentEnv = process.argv[2]

// * 打包
const compileDist = async () => {
	const command = `npm run build:${currentEnv}`,
		executeCommand = shell.exec(command)

	if (executeCommand.code === 0) {
		console.log(chalk.yellow(`${'*'.repeat(20)}打包成功`))
	}
}

// todo 上传
async function connectSSh() {
	const sftp = new Client(),
		currentConfig = config[currentEnv],
		server = {
			host: currentConfig.ip,
			port: currentConfig.port,
			username: currentConfig.username,
			password: currentConfig.password,
		}

	sftp
		.connect(server)
		.then(() => {
			console.log(chalk.yellow('正在执行删除服务器文件'))
			return sftp.rmdir(currentConfig.removePath, true)
		})
		.then(() => {
			console.log(chalk.yellow('开始上传'))
			return sftp.uploadDir(config[currentEnv].localPackage, currentConfig.path)
		})
		.then((data) => {
			console.log(chalk.yellow(`正在从 ${data}`))
			sftp.end()
			console.log(chalk.yellow(`上传完成`))
		})
		.catch((err) => {
			console.log(err, '\r\n', chalk.red(`失败`))
			sftp.end()
		})
}

;(async function runTask() {
	await compileDist() //打包完成
	await connectSSh() //提交上传
})()
