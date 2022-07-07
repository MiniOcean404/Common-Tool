const chalk = require('chalk');

module.exports = class Custom {
	timer;

	constructor(options) {
		this.options = options;
	}

	apply(compiler) {
		// 监听文件改动
		compiler.hooks.watchRun.tap('ProgressBar', (watching) => {
			const changeFiles = watching.watchFileSystem.watcher.mtimes;
			for (let file in changeFiles) {
				console.log(chalk.green('当前改动文件：' + file));
			}
		});

		// 在一次编译创建之前
		compiler.hooks.compile.tap('ProgressBar', (compilationParams) => {
			this.beginCompile();
		});

		// 一次 compile 完成
		compiler.hooks.done.tap('ProgressBar', () => {
			this.timer && clearInterval(this.timer);
			console.log(chalk.yellow(' 编译完成'));
		});
	}

	// 开始记录编译
	beginCompile() {
		let text = '开始编译：';
		this.timer = setInterval(() => {
			console.clear();
		}, 50);
	}
};
