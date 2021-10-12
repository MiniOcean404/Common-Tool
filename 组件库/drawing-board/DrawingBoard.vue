<template>
	<div id="Board">
		<div class="left-right-margin" :style="DrawingBoardStyle">
			<div
				class="DrawingBoard"
				@touchstart="touchstart"
				@touchmove="touchmove"
				@touchend.stop="touchend"
			></div>

			<div class="total-control-board">
				<div @click="palette" class="pencil-color" :style="pencilStyle"></div>

				<div class="operate" v-show="currentShow === '操作'">
					<div @click="pencil" class="board-button">
						<slot name="pencil">铅笔</slot>
					</div>

					<div @click="eraser" v-bind:state="state" class="board-button">
						<slot name="eraser">橡皮擦</slot>
					</div>

					<div @click="revoke" class="board-button">
						<slot name="revoke">撤销</slot>
					</div>

					<div @click="clearBoard" class="board-button">
						<slot name="delete">清屏</slot>
					</div>

					<div class="complete" @click="complete">
						完成
					</div>
				</div>

				<ul class="operate" v-show="currentShow === '画笔'">
					<li
						class="color-list"
						:style="{ backgroundColor: color }"
						v-for="color in colorList"
						:key="color"
						@click="changeColor('颜色', color)"
					></li>
				</ul>

				<ul class="pen-size" v-show="currentShow === '画笔'">
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
import DrawingBoardProp from './DrawingBoardProp';
import { draw, getOpacityPercentage } from './draw';

export default {
	name: 'DrawingBoard',
	props: DrawingBoardProp,
	data() {
		return {
			// 绘图图像
			ctx: '',
			canvas: '',
			state: true,
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
			stopTouchScroll(e) {
				e.preventDefault();
			},
		};
	},
	mounted() {
		this.createCanvas();
	},
	methods: {
		createCanvas() {
			const canvas = (this.canvas = document.createElement('canvas'));
			const DrawingBoard = document.querySelector('.DrawingBoard');
			const leftRightMargin = document.querySelector('.left-right-margin');
			DrawingBoard.appendChild(canvas);
			this.ctx = canvas.getContext('2d');

			canvas.height = this.height;
			canvas.width = this.width;

			// 计算画在canvas中的偏移
			this.margin.left = leftRightMargin.offsetLeft;
			this.margin.top = leftRightMargin.offsetTop;
		},
		touchstart(e) {
			// 防止微信屏幕滚动，展示由xx提供
			document.body.addEventListener('touchmove', this.stopTouchScroll, {
				passive: false,
			});

			// 保存每次画后的图
			this.preImg.push(this.ctx.getImageData(0, 0, this.width, this.height));

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

				// this.eraser()
			}
		},
		touchend() {
			this.points = [];
			document.body.removeEventListener('touchmove', this.stopTouchScroll);
		},
		LeaveScreenCanvas(point1, point2) {
			const leaveScreen = new LeaveScreenRender();
			leaveScreen.create(this.width, this.height);
			leaveScreen.draw(draw, {
				point1,
				point2,
				state: this.state,
				eraserConfig: this.eraserConfig,
				pencilConfig: this.pencilConfig,
			}); // 绘制路径
			leaveScreen.render(this.ctx);
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
			this.currentShow = '操作';
			this.state = true;
		},
		// * 功能
		pencil() {
			this.state = true;
		},
		eraser() {
			this.state = false;
		},
		// 撤销功能
		revoke() {
			if (this.preImg.length <= 0) return;
			this.ctx.putImageData(this.preImg[this.preImg.length - 1], 0, 0);
			this.preImg.pop();
		},
		clearBoard() {
			this.ctx.clearRect(0, 0, this.width, this.height);
			this.preImg = [];
		},
		complete() {
			const isAbsolutelyOpacity = getOpacityPercentage(this.ctx, this.width, this.height) === 1;
			if (isAbsolutelyOpacity) {
				this.$emit('getImg', null);
				return;
			}

			let value;
			switch (this.imgType) {
				case 'blob':
					this.canvas.toBlob(
						(blob) => {
							value = blob;
						},
						'image/png',
						0.95,
					);
					break;
				case 'base64':
					value = this.canvas.toDataURL('image/png');
					break;
				default:
					break;
			}
			this.$emit('getImg', value);
		},
	},
};
</script>

<style lang="scss" scoped>
@import 'index';
</style>
