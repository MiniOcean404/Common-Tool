exports = module.exports = ProgressBar;

// 控制台输出颜色 process.stderr.write('\x1B[32minfo\x1B[39m')

function ProgressBar(format, options) {
	options = options || {};
	const { curr, total, width, clear, complete, incomplete, head, renderThrottle, callback, stream } = options;
	this.stream = stream || process.stderr;

	if ('string' != typeof format) throw new Error('格式化字符串选项必填');
	if ('number' != typeof total) throw new Error('total必填');

	this.format = format; // 格式化样式
	this.curr = curr || 0; // 当前进度
	this.total = total; // 总共长度
	this.barWidth = width || this.total; // 进度条宽度
	this.clear = clear; // 是否清理
	this.chars = {
		complete: complete || '█', // 完成样式
		incomplete: incomplete || '░', // 未完成样式
		head: head || complete || '█',
	};

	this.renderThrottle = renderThrottle !== 0 ? renderThrottle || 16 : 0;
	this.preRender = -Infinity; // 上一个渲染时间
	this.callback = callback || function () {};
	this.option = {}; // 记录当前的option
	this.preDraw = ''; // 上一次终端渲染的字符串
}

// 更新
ProgressBar.prototype.update = function (percent, option) {
	const completeLen = Math.floor(percent * this.total);
	const gapLen = completeLen - this.curr;

	this.tick(gapLen, option);
};

ProgressBar.prototype.tick = function (len, option) {
	if (len !== 0) len = len || 1;

	// 交换属性
	if ('object' == typeof len) {
		(option = len)((len = 1));
	}
	if (option) this.option = option;

	// 当前长度为0开始记录时间
	if (this.curr === 0) this.startTime = new Date();
	this.curr += len;

	this.render();

	// 当前周期（tick）进度完成
	if (this.curr >= this.total) {
		this.render(undefined, true);
		this.complete = true;
		this.terminate();
		this.callback(this);
	}
};

ProgressBar.prototype.render = function (option, force) {
	// 判断是否是终端
	if (!this.stream.isTTY) throw new Error('当前的流不是终端');
	force = force ? force : false;
	if (option) this.option = option;

	// 两次渲染时间间隔
	const now = Date.now();
	const delta = now - this.preRender;
	if (!force && delta < this.renderThrottle) {
		return;
	} else {
		this.preRender = now;
	}

	// 百分比
	let ratio = this.curr / this.total;
	ratio = Math.min(Math.max(ratio, 0), 1);
	const percent = Math.floor(ratio * 100);

	/* 绘画条形模板 */
	let incomplete, complete, completeLength;
	const elapsedTime = new Date() - this.startTime;
	const elapsedStr = isNaN(elapsedTime) ? '0.0' : (elapsedTime / 1000).toFixed(1);
	const estimatedTime = percent === 100 ? 0 : elapsedTime * (this.total / this.curr - 1);
	const estimatedStr = isNaN(estimatedTime) || !isFinite(estimatedTime) ? '0.0' : (estimatedTime / 1000).toFixed(1);
	const rate = this.curr / (elapsedTime / 1000);

	let str = this.format
		.replace(':current', this.curr) // 当前进度
		.replace(':total', this.total) // 总共进度
		.replace(':elapsedTime', elapsedStr) // 已经经过的时间
		.replace(':estimatedTime', estimatedStr) // 预估时间
		.replace(':percent', percent.toFixed(0) + '%') // 进度百分比
		.replace(':rate', Math.round(rate)); //速率

	/* 计算条的可用空间（非零） */
	let availableSpace = Math.max(0, this.stream.columns - str.replace(':bar', '').length);
	if (availableSpace && process.platform === 'win32') {
		availableSpace = availableSpace - 1;
	}

	const barWidth = Math.min(this.barWidth, availableSpace);

	/* 计算bar完成长度未完成长度*/
	completeLength = Math.round(barWidth * ratio);
	complete = Array(Math.max(0, completeLength + 1)).join(this.chars.complete);
	incomplete = Array(Math.max(0, barWidth - completeLength + 1)).join(this.chars.incomplete);

	/* 将头部添加到完整的字符串中 */
	if (completeLength > 0) complete = complete.slice(0, -1) + this.chars.head;

	/* 填写实际进度条 */
	str = str.replace(':bar', complete + incomplete);

	/* 将:传递的键替换为对应的值 */
	if (this.option) for (const key in this.option) str = str.replace(':' + key, this.option[key]);

	// 移动0点后写入字符换，从光标位置向右清除
	if (this.preDraw !== str) {
		this.stream.cursorTo(0);
		this.stream.write(str);
		this.stream.clearLine(1);
		this.preDraw = str;
	}
};

// 打断
ProgressBar.prototype.interrupt = function (message) {
	this.stream.clearLine();
	this.stream.cursorTo(0);
	this.stream.write(message);
	this.stream.write('\n');
	this.stream.write(this.preDraw);
};

// 中断
ProgressBar.prototype.terminate = function () {
	if (this.clear) {
		if (this.stream.clearLine) {
			this.stream.clearLine(0);
			this.stream.cursorTo(0);
		}
	} else {
		this.stream.write('\n');
	}
};
