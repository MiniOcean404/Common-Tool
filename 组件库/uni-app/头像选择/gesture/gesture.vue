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
import { getAngle, getDistance, relativeCoordinate } from './double-finger';
import { getTranslate } from './single-finger';

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
		moveRage: {
			type: Array,
			default: [],
		},
	},
	data() {
		return {
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
			box: null,
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
					let { scale } = this.boxChangeInfo;

					const translated = getTranslate(this.box);

					this.boxChangeInfo.translateX = x - this.boxChangeInfo.clickX + translated.left;
					this.boxChangeInfo.translateY = y - this.boxChangeInfo.clickY + translated.top;

					// 控制可移动范围
					this.moveRangeHandle();

					this.box.style.transform = `matrix(${scale}, 0, 0, ${scale}, ${this.boxChangeInfo.translateX}, ${this.boxChangeInfo.translateY})`;
					this.boxChangeInfo.clickX = x;
					this.boxChangeInfo.clickY = y;

					this.$emit('move', 'change', e);
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
					this.touchInfo.isDoubleTouch = true;
					this.touchInfo.start = e.touches;
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
					this.boxChangeInfo.rotation = getAngle(now[0], now[1]) - getAngle(start[0], start[1]); //得到旋转角度差

					if (newScale > 1 && scale > this.max) {
						this.boxChangeInfo.scale = scale = this.max;
					}
					if (newScale < 1 && scale < this.min) {
						this.boxChangeInfo.scale = scale = this.min;
					}

					// 修正缩放视野变化带来的平移量
					if (!scalePositionChange) {
						this.boxChangeInfo.scalePositionChange = true;
						const origin = relativeCoordinate(now, this.box, scale);
						// 真实偏移量
						const offsetX = (scale - 1) * (origin.x - this.touchInfo.x);
						const offsetY = (scale - 1) * (origin.y - this.touchInfo.y);
						// 偏移之后加上单个手指的移动距离
						this.boxChangeInfo.translateX = offsetX + translateX;
						this.boxChangeInfo.translateY = offsetY + translateY;

						this.box.style.transformOrigin = `${origin.x}px ${origin.y}px`;
						this.touchInfo.x = origin.x;
						this.touchInfo.y = origin.y;
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

		moveRangeHandle() {
			if (this.moveRage?.length > 4) {
				const rect = this.box.getBoundingClientRect();
				console.log('rect.left ', rect.left);
				if (rect.left > 0 && this.boxChangeInfo.translateX > this.moveRage[0]) {
					this.boxChangeInfo.translateX = this.moveRage[0];
				}

				// this.box
			}
		},
	},
};
</script>

<style scoped lang="scss">
@import 'index';
</style>
