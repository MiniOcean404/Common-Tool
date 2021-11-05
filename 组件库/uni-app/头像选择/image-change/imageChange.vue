<template>
	<div id="image-change">
		<div class="container">
			<div class="img">
				<Gesture v-slot:move @change="change" @move="move" :moveRage="moveRange">
					<img class="show-image" v-show="url" :src="url" alt="" ref="img" />
				</Gesture>
				<!--方框-->
				<div class="select-box" ref="select"></div>
			</div>
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
			originImageInfo: {
				realWidth: '',
				realHeight: '',
				width: '',
				height: '',
			},
			changeImageInfo: {
				x: '',
				y: '',
				aspectRatio: '',
				scale: '',
			},
			selectBox: {
				width: 0,
				height: 0,
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

			this.moveRange = [
				this.$refs.select.offsetLeft,
				this.$refs.select.offsetTop,
				this.$refs.select.offsetLeft + this.$refs.select.clientWidth,
				this.$refs.select.offsetTop + this.$refs.select.clientHeight,
			];
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

						_this.originImageInfo.realWidth = img.width;
						_this.originImageInfo.realHeight = img.height;

						img.style.width = '100%';

						_this.originImageInfo.width = img.width;
						_this.originImageInfo.height = img.height;
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
		change(state, e) {
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
		move(state, e) {
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
			const rect = this.$refs.img.getBoundingClientRect();
			const boxRect = this.$refs.select.getBoundingClientRect();
			const b = this.originImageInfo.realWidth / rect.width;

			const top = boxRect.top - rect.top;
			const left = boxRect.left - rect.left;

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
