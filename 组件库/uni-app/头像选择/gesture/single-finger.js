// *  单手
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
