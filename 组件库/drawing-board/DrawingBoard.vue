<template>
	<div id="Board">
		<div class="left-right-margin" :style="DrawingBoardStyle">
			<div
				class="DrawingBoard"
				@touchstart="touchstart"
				@touchmove="touchmove"
				@touchend.stop="touchend"
			></div>

			<div :class="totalControlClassObj">
				<div class="operate " v-show="currentShow === '操作'">
					<div @click="palette" :class="pencilColorClassObj" :style="pencilStyle"></div>

					<div @click="PencilAndEraser" :class="buttonClassObj">
						<slot name="pencil">{{ state }}</slot>
					</div>

					<div @click="revoke" :class="buttonClassObj">
						<slot name="revoke">撤销</slot>
					</div>

					<div @click="clearBoard" :class="buttonClassObj">
						<slot name="delete">清屏</slot>
					</div>

					<div :class="finishClassObj" @click="complete">
						完成
					</div>
				</div>

				<ul :class="penColorClassObj" v-show="currentShow === '画笔'">
					<li
						class="color-list"
						:style="{ backgroundColor: color }"
						v-for="color in colorList"
						:key="color"
						@click="changeColor('颜色', color)"
					></li>
				</ul>

				<ul class="pen-size " v-show="currentShow === '画笔'">
					<li
						class="size-list"
						:style="{ width: size + 'px', height: size + 'px' }"
						v-for="size in fontSizeList"
						:key="size"
						@click="changeColor('大小', size)"
					></li>
				</ul>
			</div>
		</div>
	</div>
</template>

<script>
import LeaveScreenRender from './LeaveScreenRender';
import ShowCanvas from './ShowCanvas';

import DrawingBoardProp from './DrawingBoardProp';
import { draw, getOpacityPercentage, clear } from './utils';

export default {
	name: 'DrawingBoard',
	props: DrawingBoardProp,
	data() {
		return {
			// 绘图图像
			state: '橡皮擦',
			// 展示canvas
			showCanvasObj: null,
			// 离屏渲染
			leaveScreen: null,
			// 路径点集合
			points: [],
			preImg: [], // 撤销功能保存之前的图信息
			margin: {
				left: '',
				top: '',
			},
			currentShow: '操作',
			DrawingBoardStyle: {
				width: `${this.width}px`,
				height: `${this.height}px`,
			},
			pencilStyle: {
				backgroundColor: '#000',
			},

			// 处理旋转样式
			totalControlClassObj: {
				'total-control-board': true,
				'rotate-board': !this.upright,
			},
			buttonClassObj: {
				'board-button': true,
				rotate: !this.upright,
			},
			finishClassObj: {
				'board-button': true,
				complete: true,
				rotate: !this.upright,
			},
			// 笔的样式旋转
			penColorClassObj: {
				'pen-color': true,
				'pen-color-rotate': !this.upright,
			},
			pencilColorClassObj: {
				'pencil-color': true,
				'pen-color-rotate': !this.upright,
			},

			stopTouchScroll(e) {
				e.preventDefault();
			},
		};
	},
	mounted() {
		this.createCanvas();
	},
	computed: {
		upright() {
			return this.orientation === '竖';
		},
	},
	watch: {
		state(val) {
			if (val === '铅笔') {
				this.pencilConfig.size = 32;
				this.pencilConfig.compositeOperation = 'destination-out';
				this.leaveScreen.create(this.pencilConfig);
			} else {
				this.pencilConfig.compositeOperation = 'source-over';
				this.pencilConfig.size = 4;
				this.leaveScreen.create(this.pencilConfig);
			}
		},
		pencilConfig: {
			handler() {
				if (this.state !== '铅笔') {
					// 设置画笔颜色大小属性
					this.leaveScreen.create(this.pencilConfig);
					this.state = '橡皮擦';
				}
				// 改变当前状态
				this.currentShow = '操作';
			},
			deep: true,
		},
	},
	methods: {
		createCanvas() {
			// 初始化展示canvas
			this.showCanvasObj = new ShowCanvas(this.width, this.height);
			const DrawingBoard = document.querySelector('.DrawingBoard');
			const leftRightMargin = document.querySelector('.left-right-margin');
			DrawingBoard.appendChild(ShowCanvas.canvas);

			// 计算画在canvas中的偏移
			this.margin.left = leftRightMargin.offsetLeft;
			this.margin.top = leftRightMargin.offsetTop;

			// 初始化离屏渲染
			this.leaveScreen = new LeaveScreenRender(this.width, this.height);
			this.leaveScreen.create(this.pencilConfig);
		},
		touchstart(e) {
			// 防止微信屏幕滚动，展示由xx提供
			document.body.addEventListener('touchmove', this.stopTouchScroll, {
				passive: false,
			});
			// 保存每次画后的图
			this.preImg.push(ShowCanvas.onlineCtx.getImageData(0, 0, this.width, this.height));

			const startX = e.changedTouches[0].clientX - this.margin.left;
			const startY = e.changedTouches[0].clientY - this.margin.top;

			this.points.push({ X: startX, Y: startY });
		},
		touchmove(e) {
			const moveX = e.changedTouches[0].clientX - this.margin.left;
			const moveY = e.changedTouches[0].clientY - this.margin.top;
			this.points.push({ X: moveX, Y: moveY }); // 存点
			const len = this.points.length;

			if (len >= 2) {
				const point1 = this.points[0];
				const point2 = this.points[1];
				this.points.shift();

				this.LeaveScreenCanvas(point1, point2);
			}
		},
		touchend() {
			this.points = [];
			document.body.removeEventListener('touchmove', this.stopTouchScroll);
		},
		LeaveScreenCanvas(point1, point2) {
			if (this.state === '橡皮擦') {
				this.leaveScreen.draw(draw, {
					point1,
					point2,
				}); // 绘制路径
			} else if (this.state === '铅笔') {
				this.leaveScreen.draw(clear, {
					point1,
					point2,
				});
			}
			this.leaveScreen.render(ShowCanvas.onlineCtx);
		},

		// * 切换
		palette() {
			this.currentShow = '画笔';
		},
		changeColor(v, value) {
			switch (v) {
				case '颜色':
					this.pencilConfig.color = this.pencilStyle.backgroundColor = value;
					break;
				case '大小':
					this.pencilConfig.size = this.pencilStyle.backgroundColor = value;
					break;
				default:
					break;
			}
		},
		// * 功能
		PencilAndEraser() {
			this.state === '铅笔' ? (this.state = '橡皮擦') : (this.state = '铅笔');
		},
		// 撤销功能
		revoke() {
			if (this.preImg.length <= 0) return;
			this.leaveScreen.render(ShowCanvas.onlineCtx, this.preImg[this.preImg.length - 1]);
			this.preImg.pop();
		},
		clearBoard() {
			this.leaveScreen.clearAll();
			this.leaveScreen.render(ShowCanvas.onlineCtx);
			this.preImg = [];
		},
		complete() {
			const isAbsolutelyOpacity =
				getOpacityPercentage(ShowCanvas.onlineCtx, this.width, this.height) === 1;
			if (isAbsolutelyOpacity) {
				this.$emit('getImg', null);
				return;
			}

			const angle = this.orientation === '横' ? -90 : 0;
			ShowCanvas.canvas.toBlob(
				(blob) => {
					this.leaveScreen.rotateImg(URL.createObjectURL(blob), angle, (canvas) => {
						switch (this.imgType) {
							case 'blob':
								canvas.toBlob((b) => {
									this.$emit('getImg', b, 'image/png', 0.95);
								});
								break;
							case 'base64':
								this.$emit('getImg', canvas.toDataURL('image/png'));
								break;
							default:
								break;
						}
					});
				},
				'image/png',
				0.95,
			);
		},
	},
};
</script>

<style lang="scss" scoped>
@import 'index';
</style>
