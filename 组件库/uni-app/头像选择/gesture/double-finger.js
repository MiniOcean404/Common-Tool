// * 双手

export function getDistance(p1, p2) {
	const x = p2.pageX - p1.pageX;
	const y = p2.pageY - p1.pageY;
	return Math.sqrt(x * x + y * y);
}

export function getAngle(p1, p2) {
	const x = p1.pageX - p2.pageX;
	const y = p1.pageY - p2.pageY;
	return (Math.atan2(y, x) * 180) / Math.PI;
}

// * 计算真实图片在指头的相对位置
export const relativeCoordinate = (p, dom, scaleRatio) => {
	const rect = dom.getBoundingClientRect();

	const { x, y } = getMiddlePosition(p[0], p[1]);
	let cx = (x - rect.left) / scaleRatio;
	let cy = (y - rect.top) / scaleRatio;

	return {
		x: cx,
		y: cy,
	};
};

export function getMiddlePosition(p1, p2) {
	const x = (p1.pageX + p2.pageX) / 2;
	const y = (p1.pageY + p2.pageY) / 2;
	return { x, y };
}
