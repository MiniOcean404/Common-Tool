const dayjs = require('dayjs');
const config = require('./config');
const { compress, compileDist } = require('./build');
const { connFun, getSftp, Shell, up, getDir } = require('./sftp');
const fs = require('fs');
const path = require('path');
const { askDir, askCreate } = require('./cli');

const currentEnv = process.argv[2];
const currentConfig = config[currentEnv];
const today = dayjs().format('YYYYMMDD');
const HMSToday = dayjs().format('YYYYMMDD_HH点mm分ss秒');

const compressFile = currentConfig.compressPath;
const buildPath = currentConfig.buildPath;
const netPath = currentConfig.netPath;

(async () => {
	// * 获取sftp链接
	const conn = await connFun(currentConfig);
	const sftp = await getSftp(conn);

	// * 查找文件
	const dirs = await getDir(sftp, conn, netPath);
	const reg = new RegExp(`^${today}_?(\\d{0,2})$`, 'ig');
	let max = 0;
	const dirName = dirs.reduce((total, i) => {
		if (reg.exec(i.filename)) {
			i.filename.match(reg);
			for (const item of i.filename.matchAll(reg)) {
				const num = Number(item[1]);
				if (num && num > max) {
					max = num;
					return item[0];
				} else if (max === 0) {
					return item[0];
				}
			}
		} else {
			return total;
		}
	}, null);

	const action = await askDir();
	let createDirName;
	if (action === 'create' || !dirName) {
		const answers = await askCreate(dirName);
		createDirName = answers.length < 2 ? `${today}_0${answers}` : `${today}_${answers}`;

		const command = [
			`cd ${netPath}`,
			`mkdir ${createDirName}`,
			`cd ${createDirName}`,
			// 'unzip -o dist.zip',
			// 'rm -f dist.zip',
			'exit',
			'close',
		];

		await Shell(conn, command);
	}

	// * 打包压缩
	await compileDist(currentEnv);
	await compress(buildPath, compressFile);

	// * 上传
	const upDirName = action === 'create' || !dirName ? createDirName : dirName;
	const target = `${netPath}/${upDirName}/${config.zipName}`;
	await up(sftp, compressFile, target);
	fs.unlinkSync(path.join(__dirname, `./${config.zipName}`));
	conn.end();
})();
