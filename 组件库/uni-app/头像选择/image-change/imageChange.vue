<template>
	<div id="image-change">
		<div class="container">
			<Gesture
				v-slot:move
				@change="change"
				@move="move"
				:is-move="gesture.isMove"
				:move-range="moveRange"
			>
				<img class="show-image" v-show="url" :src="url" alt="" ref="img" />
			</Gesture>

			<!--方框-->
			<div class="select-box" ref="select"></div>
		</div>

		<div class="operate">
			<span @click="selectImage">重新选择</span>
			<span @click="sure">确定</span>
		</div>
	</div>
</template>

<script>
import Gesture from 'components/A-common-components/gesture/gesture';

export default {
	name: 'imageChange',
	components: {
		Gesture,
	},
	data() {
		return {
			url: '',
			imgInfo: {
				realWidth: '',
				rect: null,
			},
			selectBox: {
				rect: null,
				width: 0,
				height: 0,
			},
			gesture: {
				isMove: true,
				width: 300,
				height: 300,
			},
			moveRange: [],
		};
	},
	onLoad(o) {
		// this.selectImage();
	},
	mounted() {
		this.init();
	},
	methods: {
		init() {
			this.selectBox.width = this.$refs.select.clientWidth;
			this.selectBox.height = this.$refs.select.clientHeight;
			this.selectBox.rect = this.$refs.select.getBoundingClientRect();

			const boxRect = this.selectBox.rect;
			this.moveRange.push(
				boxRect.left,
				boxRect.left + boxRect.width,
				boxRect.top,
				boxRect.top + boxRect.height,
			);
		},
		selectImage() {
			const _this = this;
			uni.chooseImage({
				count: 1, //默认9
				sizeType: ['original', 'compressed'], //可以指定是原图还是压缩图，默认二者都有
				sourceType: ['album', 'camera'], //从相册选择
				success(res) {
					const img = _this.$refs.img;

					_this.url = res.tempFilePaths[0];

					img.onload = function() {
						img.style.width = '';

						_this.imgInfo.realWidth = img.width;

						img.style.width = `${document.body.clientWidth}px`;

						_this.imgInfo.rect = _this.$refs.img.getBoundingClientRect();
						_this.gesture.width = _this.imgInfo.rect.width * 2 - _this.selectBox.width;
						_this.gesture.height = _this.imgInfo.rect.height * 2 + _this.selectBox.height;
					};
				},
				fail() {
					uni.showToast({
						title: '图片选择功能调用失败',
						duration: 2000,
					});
				},
				complete() {},
			});
		},
		// 缩放计算
		change(state) {
			switch (state) {
				case 'start':
					break;
				case 'change':
					break;
				case 'end':
					break;
				default:
					break;
			}
		},
		// 移动计算
		move(state, e, move) {
			switch (state) {
				case 'start':
					break;
				case 'change':
					break;
				case 'end':
					break;
				default:
					break;
			}
		},
		sure() {
			const imgRect = this.imageInfo.rect;
			const boxRect = this.selectBox.rect;
			const b = this.imgInfo.realWidth / imgRect.width;

			const top = boxRect.top - imgRect.top;
			const left = boxRect.left - imgRect.left;

			const canvas = document.createElement('canvas');
			canvas.width = this.selectBox.width;
			canvas.height = this.selectBox.height;
			const ctx = canvas.getContext('2d');

			ctx.drawImage(
				this.$refs.img,
				left * b,
				top * b,
				this.selectBox.width * b,
				this.selectBox.height * b,
				0,
				0,
				this.selectBox.width,
				this.selectBox.height,
			);
			canvas.toBlob(
				(b) => {
					console.log(b);
				},
				'image/png',
				0.95,
			);
		},
	},
};
</script>

<style scoped lang="scss">
@import 'index';
</style>
