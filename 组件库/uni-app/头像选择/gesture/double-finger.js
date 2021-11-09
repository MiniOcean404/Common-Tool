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

// * 计算缩放限制
export function doubleScaleLimit(rect, moveArr, scale) {
	const x1 = moveArr[0];
	const x2 = moveArr[1];
	const y1 = moveArr[2];
	const y2 = moveArr[3];

	const top = rect.top;
	const bottom = rect.top + rect.height;
	const left = rect.left;
	const right = rect.left + rect.width;

	if (top >= y1 && left >= x1) {
		return scale < 1 ? 'topLeft' : '';
	}

	if (top >= y1 && right <= x2) {
		return scale < 1 ? 'topRight' : '';
	}

	if (left >= x1 && bottom <= y2) {
		return scale < 1 ? 'bottomLeft' : '';
	}

	if (right >= x1 && bottom <= y2) {
		return scale < 1 ? 'bottomRight' : '';
	}

	if (top >= y1) {
		return scale < 1 ? 'top' : '';
	}

	if (left >= x1) {
		return scale < 1 ? 'left' : '';
	}

	if (bottom <= y2) {
		return scale < 1 ? 'bottom' : '';
	}

	if (right <= x2) {
		return scale < 1 ? 'right' : '';
	}
}

// * 修复双指缩放偏移量
export function patchScaleError(origin, scale, touchInfo, preTranslate) {
	const { translateX, translateY } = preTranslate;

	// 真实偏移量
	const offsetX = (scale - 1) * (origin.x - touchInfo.x);
	const offsetY = (scale - 1) * (origin.y - touchInfo.y);

	return {
		touch: {
			// 记录之前手指的位置，计算真实图片手指偏移量
			x: origin.x,
			y: origin.y,
		},
		box: {
			// 偏移之后加上单个手指的移动距离
			translateX: offsetX + translateX,
			translateY: offsetY + translateY,
		},
		patchOrigin: origin,
	};
}

export function isScaleLimit(point, rect, origin) {
	if (point !== '') {
		switch (point) {
			case 'top':
				origin = { x: rect.width / 2, y: 0 };
				break;
			case 'left':
				origin = { x: 0, y: rect.height / 2 };
				break;
			case 'bottom':
				origin = { x: rect.width / 2, y: rect.height };
				break;
			case 'right':
				origin = { x: rect.width, y: rect.height / 2 };
				break;
			case 'topLeft':
				origin = { x: 0, y: 0 };
				break;
			case 'topRight':
				origin = { x: rect.width, y: 0 };
				break;
			case 'bottomLeft':
				origin = { x: 0, y: rect.height };
				break;
			case 'bottomRight':
				origin = { x: rect.width, y: rect.height };
				break;
			default:
				break;
		}

		origin.isLimit = true;
	}

	return origin;
}

// * 计算真实图片在指头的相对位置
export const relativeCoordinate = (rect, p, scaleRatio) => {
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
