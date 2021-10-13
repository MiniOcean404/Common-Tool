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
	pencilConfig: {
		type: Object,
		default() {
			return {
				color: '#000000',
				size: 4,
				compositeOperation: 'source-over',
			};
		},
	},
};
