<template>
	<div
		id="gesture"
		@touchstart="touchstart"
		@touchmove="touchmove"
		@touchend="touchend"
		ref="gesture"
	>
		<slot name="move"></slot>
	</div>
</template>

<script>
import {
	doubleScaleLimit,
	getAngle,
	getDistance,
	isScaleLimit,
	patchScaleError,
	relativeCoordinate,
} from './double-finger';
import { getTranslate, singleRangeLimit } from './single-finger';

export default {
	name: 'gesture.vue',
	props: {
		min: {
			type: Number,
			default: 0.5,
		},
		max: {
			type: Number,
			default: 2,
		},
		x: {
			type: Number,
			default: 0,
		},
		y: {
			type: Number,
			default: 0,
		},
		isMove: {
			type: Boolean,
			default: true,
		},
		moveRange: {
			type: Array,
			default: [],
		},
	},
	data() {
		return {
			box: null,
			boxRect: null,
			touchInfo: {
				isDoubleTouch: false, // 判断是否在双指状态
				x: 0,
				y: 0,
				start: [],
			},
			event: {
				gesturestart: new CustomEvent('gesturestart'),
				gesturechange: new CustomEvent('gesturechange'),
				gestureend: new CustomEvent('gestureend', {
					detail: { scale: 0, rotation: 0, x: 0, y: 0 },
				}),
			},
			boxChangeInfo: {
				scalePositionChange: false,
				// tMatrix: [1, 0, 0, 1, 0, 0], // x缩放，无，无，y缩放，x平移，y平移
				scale: 1,
				rotation: 0,
				clickX: 0,
				clickY: 0,
				translateX: 0,
				translateY: 0,
			},
			stopTouchScroll(e) {
				e.preventDefault();
			},
		};
	},
	mounted() {
		this.init();
	},
	beforeUpdate() {},
	beforeDestroy() {
		this.box.removeEventListener('gesturestart', this.gesture);
		this.box.removeEventListener('gesturechange', this.gesture);
		this.box.removeEventListener('gestureend', this.gesture);

		document.body.removeEventListener('touchmove', this.stopTouchScroll, {
			passive: false,
		});
	},
	methods: {
		init() {
			this.box = this.$refs.gesture;

			this.box.addEventListener('gesturestart', this.gesture);
			this.box.addEventListener('gesturechange', this.gesture);
			this.box.addEventListener('gestureend', this.gesture);

			this.box.style.transform = `matrix(1, 0, 0, 1, ${this.x}, ${this.y})`;
			this.box.style.transformOrigin = 'center';

			document.body.addEventListener('touchmove', this.stopTouchScroll, {
				passive: false,
			});

			this.boxChangeEmit();
		},
		touchstart(e) {
			this.box = this.$refs.gesture;
			if (e.touches.length >= 2) {
				this.doubleFinger(e.type, e);
			} else if (this.touchInfo.isDoubleTouch === false) {
				this.singleFinger(e.type, e);
			}
		},
		touchmove(e) {
			this.boxRect = this.$refs.gesture.getBoundingClientRect();
			if (e.touches.length >= 2) {
				this.doubleFinger(e.type, e);
			} else if (this.touchInfo.isDoubleTouch === false) {
				this.singleFinger(e.type, e);
			}
		},
		touchend(e) {
			e.touches.length === 0 && this.touchInfo.isDoubleTouch
				? this.doubleFinger(e.type, e)
				: this.singleFinger(e.type, e);
		},
		singleFinger(type, e) {
			let x;
			let y;
			switch (type) {
				case 'touchstart':
					x = this.boxChangeInfo.clickX = e.touches[0].pageX;
					y = this.boxChangeInfo.clickY = e.touches[0].pageY;

					this.$emit('move', 'start', e);
					break;
				case 'touchmove':
					x = e.touches[0].pageX;
					y = e.touches[0].pageY;

					// 计算移动距离并且是否要被限制
					let realMoveX = x - this.boxChangeInfo.clickX;
					let realMoveY = y - this.boxChangeInfo.clickY;

					this.boxChangeInfo.clickX = x;
					this.boxChangeInfo.clickY = y;

					if ((this.moveRange.length = 4)) {
						const flag = singleRangeLimit(this.boxRect, this.moveRange, {
							x: realMoveX,
							y: realMoveY,
						});
						realMoveX = flag.x === false ? 0 : realMoveX;
						realMoveY = flag.y === false ? 0 : realMoveY;
					}

					// 移动距离加上之前的移动，并且设置上
					const translated = getTranslate(this.box);
					this.boxChangeInfo.translateX = realMoveX + translated.left;
					this.boxChangeInfo.translateY = realMoveY + translated.top;

					let { scale } = this.boxChangeInfo;
					this.box.style.transform = `matrix(${scale}, 0, 0, ${scale}, ${this.boxChangeInfo.translateX}, ${this.boxChangeInfo.translateY})`;

					this.$emit('move', 'change', e, { x: realMoveX, y: realMoveY });
					break;
				case 'touchend':
					this.boxChangeEmit();
					this.$emit('move', 'end', e);
					break;
			}
		},
		doubleFinger(type, e) {
			switch (type) {
				case 'touchstart':
					this.touchInfo.start = e.touches;
					this.touchInfo.isDoubleTouch = true;
					this.boxChangeInfo.scalePositionChange = false;

					this.box.dispatchEvent(this.event.gesturestart);
					break;
				case 'touchmove':
					const now = e.touches; //得到第二组两个点
					const { start } = this.touchInfo;
					let { scale, scalePositionChange, translateX, translateY } = this.boxChangeInfo;

					// 角度缩放比例进行计算
					const newScale = getDistance(now[0], now[1]) / getDistance(start[0], start[1]);
					this.boxChangeInfo.scale = scale = newScale * scale;
					if (newScale > 1 && scale > this.max) {
						this.boxChangeInfo.scale = scale = this.max;
					}
					if (newScale < 1 && scale < this.min) {
						this.boxChangeInfo.scale = scale = this.min;
					}

					this.boxChangeInfo.rotation = getAngle(now[0], now[1]) - getAngle(start[0], start[1]); //得到旋转角度差

					// 计算缩放限制位置
					let point;
					if (this.moveRange.length === 4) {
						point = doubleScaleLimit(this.boxRect, this.moveRange, scale);

						if (point) scalePositionChange = false;
					}

					if (!scalePositionChange) {
						this.boxChangeInfo.scalePositionChange = true;

						// 计算源坐标位置，判断是否需要对源左边进行限制，对源坐标偏移进行修复
						let origin = relativeCoordinate(this.boxRect, now, scale);
						let limitOrigin;
						if (this.moveRange.length === 4) {
							limitOrigin = isScaleLimit(point, this.boxRect, origin);
						}

						// 判断这个是否被限制的时候是否需要放大，如果满足就按手指位置进行放大
						const originUse = limitOrigin.isLimit && newScale > 1 ? origin : limitOrigin;
						const info = patchScaleError(originUse, scale, this.touchInfo, {
							translateX,
							translateY,
						});

						// 对数据赋值，进行样式设置
						const { box, touch, patchOrigin } = info;

						this.boxChangeInfo.translateX = box.translateX;
						this.boxChangeInfo.translateY = box.translateY;

						this.touchInfo.x = touch.x;
						this.touchInfo.y = touch.y;

						this.box.style.transformOrigin = `${patchOrigin.x}px ${patchOrigin.y}px`;
					}

					this.box.style.transform = `matrix(${scale}, 0, 0, ${scale}, ${this.boxChangeInfo.translateX}, ${this.boxChangeInfo.translateY})`;
					this.touchInfo.start = now;

					this.box.dispatchEvent(this.event.gesturechange);
					break;
				case 'touchend':
					this.touchInfo.isDoubleTouch = false;
					this.boxChangeEmit();
					break;
			}
		},
		gesture(e) {
			switch (e.type) {
				case 'gesturestart':
					this.$emit('change', 'start');
					break;
				case 'gesturechange':
					this.$emit('change', 'change', e.detail);
					break;
				case 'gestureend':
					this.$emit('change', 'end', e.detail);
					break;
			}
		},
		boxChangeEmit() {
			this.event.gestureend.detail.scale = this.boxChangeInfo.scale;
			this.event.gestureend.detail.rotation = this.boxChangeInfo.rotation;
			this.event.gestureend.detail.x = this.boxChangeInfo.translateX;
			this.event.gestureend.detail.y = this.boxChangeInfo.translateY;

			this.box.dispatchEvent(this.event.gestureend);
		},
	},
};
</script>

<style scoped lang="scss">
@import 'index';
</style>
