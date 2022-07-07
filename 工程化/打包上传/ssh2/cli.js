const { prompt } = require('inquirer');
const chalk = require('chalk');

function askDir() {
	return new Promise(async (resolve) => {
		let { action } = await prompt([
			{
				type: 'list',
				name: 'action',
				message: '请选择要上传还是创建',
				choices: [
					{
						name: '上传',
						value: 'up',
					},
					{
						name: '创建',
						value: 'create',
					},
				],
			},
		]);
		resolve(action);
	});
}

function askCreate(dirName) {
	return new Promise(async (resolve) => {
		let { answers } = await prompt([
			{
				type: 'input',
				name: 'answers',
				message: dirName
					? `当前已经创建到了${chalk.yellow(dirName)}，请填写创建的文件数字后缀`
					: '当前还未创建任何文件，请填写创建的文件数字后缀',
			},
		]);

		resolve(answers);
	});
}

module.exports = {
	askDir,
	askCreate,
};
