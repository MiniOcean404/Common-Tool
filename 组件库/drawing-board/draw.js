export function draw(drawConfig) {
	const {
		point1,
		point2,
		state,
		pencilConfig: { color: PColor, size: PSize },
		eraserConfig: { color: EColor, size: ESize },
	} = drawConfig;

	this.lineWidth = state ? PSize : ESize;
	this.strokeStyle = state ? PColor : EColor;
	this.lineCap = 'round';
	this.lineJoin = 'round';

	this.save();

	// 每次触摸开始，开启新的路径,（清除后上次的东西就不存在了，否则还存在）
	this.beginPath();
	this.moveTo(point1.X, point1.Y);
	this.lineTo(point2.X, point2.Y);
	this.stroke();

	this.restore();
}

/**
 * 获取透明所占百分比，返回一个 <= 1 的值
 * @param {object} context canvas 上下文对象
 * @param width 画板宽度
 * @param height 画板高度
 * @param {number} opacity 透明度参考值，初始参考透明值是 128
 */
export function getOpacityPercentage(context, width, height, opacity = 128) {
	const imageData = context.getImageData(0, 0, width, height);
	const colorDataArr = imageData.data;
	const colorDataArrLen = colorDataArr.length;
	const eraseArea = [];
	// rgba 显示的模式，所以一个像素表示有 4 个分量，透明度是最后一个分量
	for (let i = 0; i < colorDataArrLen; i += 4) {
		// 严格上来说，判断像素点是否透明需要判断该像素点的 a 值是否等于0，
		if (colorDataArr[i + 3] < opacity) {
			eraseArea.push(colorDataArr[i + 3]);
		}
	}
	let divResult = eraseArea.length / (colorDataArrLen / 4);
	// 处理除不尽的情况
	const pointIndex = String(divResult).indexOf('.');
	if (pointIndex > -1) {
		divResult = String(divResult).slice(0, pointIndex + 5);
	}
	return Number(divResult);
}
