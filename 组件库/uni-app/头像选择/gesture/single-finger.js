// *  单手

// 获取之前的移动距离
export function getTranslate(target) {
	let matrix = getStyle(target, 'transform');
	let nums = matrix.substring(7, matrix.length - 1).split(', ');
	let left = parseInt(nums[4]) || 0;
	let top = parseInt(nums[5]) || 0;
	return {
		left: left,
		top: top,
	};
}

export function getStyle(target, style) {
	let styles = window.getComputedStyle(target, null);
	return styles.getPropertyValue(style);
}

// 是否达到范围限制,某个位置收到限制就不能移动
export function singleRangeLimit(rect, moveArr, move) {
	const x1 = moveArr[0];
	const x2 = moveArr[1];
	const y1 = moveArr[2];
	const y2 = moveArr[3];

	let x;
	let y;

	// 左右
	if ((rect.left > x1 && move.x > 0) || (rect.left + rect.width < x2 && move.x < 0)) {
		x = false;
	}

	// 上下
	if ((rect.top > y1 && move.y > 0) || (rect.top + rect.height < y2 && move.y < 0)) {
		y = false;
	}

	return {
		x,
		y,
	};
}
