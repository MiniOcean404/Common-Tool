export const PDFProps = {
	url: {
		type: String,
		default: ''
	},
	buffer: {
		type: Object,
		default() {
			return null
		}
	},
	isOperatePage: {
		type: Boolean,
		default: false
	}
}
