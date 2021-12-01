const webpack = require('webpack');
const chalk = require('chalk');

module.exports = function () {
	let options = options || {};

	const stream = options.stream || process.stderr;
	const enabled = stream && stream.isTTY; // 是否是终端

	if (!enabled) {
		return function () {};
	}

	const prefix = chalk.cyan.bold('构建进度');
	const barFormat = options.format || prefix + ':bar' + chalk.green.bold(' :百分比');

	const summary = options.summary !== false;
	const summaryContent = options.summaryContent;
	const customSummary = options.customSummary;

	delete options.format;
	delete options.total;
	delete options.summary;
	delete options.summaryContent;
	delete options.customSummary;

	const barOptions = Object.assign(
		{
			complete: '█',
			incomplete: '░',
			width: 20,
			total: 100,
			clear: true,
		},
		options,
	);

	const bar = new ProgressBar(barFormat, barOptions);

	let running = false;
	let startTime = 0;
	let lastPercent = 0;

	return new webpack.ProgressPlugin(function (percent, msg) {
		if (!running && lastPercent !== 0 && !customSummary) {
			stream.write('\n');
		}

		// 计算百分比
		const newPercent = Math.floor(percent * barOptions.width);
		if (lastPercent < percent || newPercent === 0) {
			lastPercent = percent;
		}

		bar.update(percent, {
			msg: msg,
		});

		if (!running) {
			running = true;
			startTime = new Date(); //计算开始时间
			lastPercent = 0;
		} else if (percent === 1) {
			const now = new Date();
			const buildTime = (now - startTime) / 1000 + 's'; // 计算运行时间

			bar.terminate();

			// 如果有摘要
			if (summary) {
				stream.write(chalk.green.bold('构建时间 ' + buildTime + '\n\n'));
			} else if (summaryContent) {
				stream.write(summaryContent + '(' + buildTime + ')\n\n');
			}

			if (customSummary) {
				customSummary(buildTime);
			}

			running = false;
		}
	});
};
