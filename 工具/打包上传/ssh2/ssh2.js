const dayjs = require('dayjs')
const config = require('./config')
const { compress, compileDist } = require('./build')
const { conFun, getSftp, Shell, up, getDir } = require('./sftp')

const currentEnv = process.argv[2]
const currentConfig = config[currentEnv]
const today = dayjs().format('YYYYMMDD')
const file = currentConfig.localPackage
const netPath = currentConfig.path

;(async () => {
	await compileDist(currentEnv)

	await compress()
	const conn = await conFun(currentConfig)
	const sftp = await getSftp(conn)

	const dirs = await getDir(sftp, netPath)
	const isHaveDir = dirs.some((i) => i.filename === today)
	if (!isHaveDir) {
		const command = [
			`cd ${currentConfig.path}`,
			`mkdir ${today}`,
			`cd ${today}`,
			// 'unzip -o dist.zip',
			// 'rm -f dist.zip',
			'exit',
			'close',
		]

		await Shell(conn, command)
	}

	await up(sftp, file, netPath, today, config)

	conn.end()
})()
