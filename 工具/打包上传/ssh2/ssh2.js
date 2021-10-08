const dayjs = require('dayjs')
const config = require('./config')
const { compress, compileDist } = require('./build')
const { connFun, getSftp, Shell, up, getDir } = require('./sftp')
const fs = require('fs')
const path = require('path')

const currentEnv = process.argv[2]
const currentConfig = config[currentEnv]
const today = dayjs().format('YYYYMMDD')
const file = currentConfig.localPackage
const netPath = currentConfig.path

;(async () => {
	// * 打包压缩
	await compileDist(currentEnv)
	await compress()

	// * 获取sftp链接
	const conn = await connFun(currentConfig)
	const sftp = await getSftp(conn)

	// * 查找文件，创建文件
	const dirs = await getDir(sftp, conn, netPath)
	const isHaveDir = dirs.some((i) => i.filename === today)
	if (!isHaveDir) {
		const command = [
			`cd ${netPath}`,
			`mkdir ${today}`,
			`cd ${today}`,
			// 'unzip -o dist.zip',
			// 'rm -f dist.zip',
			'exit',
			'close',
		]

		await Shell(conn, command)
	}

	// * 上传
	const target = `${netPath}/${today}/${config.zipName}`
	await up(sftp, file, target)
	fs.unlinkSync(path.join(__dirname, `./${config.zipName}`))

	conn.end()
})()
