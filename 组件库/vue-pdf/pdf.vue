<template>
	<view v-if="url !== '' && num !== 0">
		<pdf ref="pdf" v-for="i in num" :key="i" :page="i" :src="src" style="display: inline-block; width: 100%"></pdf>
	</view>
</template>

<script>
import pdf from 'vue-pdf'
const fontLink = 'https://unpkg.com/pdfjs-dist@2.0.943/cmaps/'

export default {
	name: 'show-pdf',
	components: {
		pdf
	},
	data() {
		return {
			url: '',
			num: 0
		}
	},
	onLoad(o) {
		uni.setNavigationBarTitle({
			title: o.name
		})
		this.url = o.url
		this.num = Number(o.num)
	},
	computed: {
		src() {
			//处理pdfUrl返回
			return pdf.createLoadingTask({
				url: decodeURIComponent(this.url),
				//引入pdf.js字体，templ
				cMapUrl: fontLink,
				cMapPacked: true
			})
		}
	}
}
</script>

<style lang="scss" scoped></style>
