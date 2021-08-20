<template>
	<div id="pdf-dist">
		<div class="position">
			<div class="isOperatePage" v-if="this.isOperatePage"></div>
		</div>

		<!--原生方式,支持桌面浏览器-->
		<!--<iframe :src="url" width="100%" height="750"></iframe>-->
	</div>
</template>

<script>
import { PDFMixin } from './PDFMixin'
import { PDFProps } from 'components/pdf-dist/pdf-props'

export default {
	name: 'pdf-dist',
	mixins: [PDFMixin],
	props: PDFProps,
	data() {
		return {
			scale: 1, // 放大倍数
			maxScale: 2, // 最大放大倍数
			minScale: 0.8 // 最小放大倍数
		}
	},
	methods: {
		prev() {
			if (this.pageNum <= 1) return
			this.pageNum--
			this.renderPage(this.pages[this.pageNum])
		},
		next() {
			if (this.pageNum >= this.total) return
			this.pageNum++
			this.renderPage(this.pages[this.pageNum])
		},
		addScale() {
			// 放大
			if (this.scale >= this.maxScale) return
			this.scale += 0.1
			this.renderPage(this.pages[this.pageNum])
		},
		minus() {
			// 缩小
			if (this.scale <= this.minScale) return
			this.scale -= 0.1
			this.renderPage(this.pages[this.pageNum])
		},
		closedPDF() {
			// 关闭PDF
			this.$emit('closedPDF')
		}
	}
}
</script>
<style lang="scss" scoped>
@import 'index.scss';
</style>
