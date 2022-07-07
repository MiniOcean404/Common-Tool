const compressing = require('compressing');
const config = require('./config');
const chalk = require('chalk');
const shell = require('shelljs');

// * 打包
const compileDist = (currentEnv) => {
	return new Promise((resolve, reject) => {
		const command = `npm run build:${currentEnv}`;
		const result = shell.exec(command);

		if (result.code === 0) {
			console.log(chalk.yellow(`打包成功`));
			return resolve(true);
		} else {
			reject(false);
		}
	});
};

// * 压缩代码
function compress(buildPath, compressPath) {
	return new Promise((resolve, reject) => {
		compressing.zip
			.compressDir(buildPath, compressPath)
			.then(() => {
				console.log(chalk.yellow(`Tip: 文件压缩成功，已压缩至【${compressPath}】`));
				resolve(true);
			})
			.catch((err) => {
				console.log(chalk.red('Tip: 压缩出错'));
				reject(err);
			});
	});
}

module.exports = {
	compress,
	compileDist,
};
