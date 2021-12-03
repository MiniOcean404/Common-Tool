const webpack = require('webpack');
const chalk = require('chalk');
const ProgressBar = require('./progress-bar');

module.exports = function (options) {
	options = options || {};
	const { stream = process.stderr } = options;
	const prefix = chalk.cyan.bold('构建进度：');
	const barFormat = options.format || prefix + ':bar' + chalk.green.bold(' :percent') + '  预估:estimatedTime/s';

	const barOptions = Object.assign(
		{
			complete: '█',
			incomplete: '░',
			head: '█',
			width: 100,
			total: 100,
			clear: false,
		},
		options,
	);

	const bar = new ProgressBar(barFormat, barOptions);

	return new webpack.ProgressPlugin((percent, msg) => {
		bar.update(percent, {
			msg: msg,
		});

		if (percent === 1) {
			bar.terminate();
		}
	});
};
