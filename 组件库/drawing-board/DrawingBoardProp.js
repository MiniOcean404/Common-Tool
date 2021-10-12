export default {
	width: {
		type: Number,
		default: Number(document.body.clientWidth) - 44,
	},
	height: {
		type: Number,
		default: Number(document.body.clientHeight) - 166,
	},
	imgType: {
		type: String,
		default: 'blob',
	},
	colorList: {
		type: Array,
		default() {
			return ['#000', 'red', '#eee', 'blue', '#2385a9'];
		},
	},
	fontSizeList: {
		type: Array,
		default() {
			return ['4', '8', '16', '18'];
		},
	},
	eraserConfig: {
		type: Object,
		default() {
			return {
				flag: false,
				color: 'rgba(0, 0, 0, 0)', // 设置橡皮擦为透明色
				size: 32,
			};
		},
	},
	pencilConfig: {
		type: Object,
		default() {
			return {
				flag: true,
				color: '#000000',
				size: 4,
			};
		},
	},
};
