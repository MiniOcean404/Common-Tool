// 版本 2.2.228
import PDFjs from 'pdfjs-dist'
import pdfWorker from 'pdfjs-dist/build/pdf.worker'
const fontLink = 'https://unpkg.com/pdfjs-dist@2.0.943/cmaps/'

export const PDFMixin = {
	data() {
		return {
			execFn: new Map([['all', this.renderAll]]),
			pageNum: 1, //当前页
			total: 0, // 总页数
			PDFDocumentProxy: null, // PDFjs 生成的对象
			pages: [] //每个页面的参数
		}
	},
	async created() {
		await this.exec()
	},
	methods: {
		async exec() {
			const isCreateFinish = await this.createPDF()

			if (this.isOperatePage && isCreateFinish) {
				// this.execFn.get('operatePage')()
			} else if (!this.isOperatePage && isCreateFinish) {
				this.initPages(this.total)
				await this.execFn.get('all')()
			}
		},
		renderAll() {
			this.pages.forEach((page) => {
				// 插入DOM
				const center = document.querySelector('.position')
				const button = document.querySelector('.operate-page')
				center.insertBefore(page.canvas, button)

				this.renderPage(page)
			})
		},

		async renderPage(page) {
			const PDFPageProxy = await this.PDFDocumentProxy.getPage(page.pageId)

			// 文档与屏幕比例，设置其缩放大小
			const origin = PDFPageProxy.getViewport({ scale: 1 }).width
			const viewport = PDFPageProxy.getViewport({
				scale: screen.availWidth / origin
			})

			// 将画布还原为设备像素宽度、高度
			page.canvas.height = page.ratio * viewport.height
			page.canvas.width = page.ratio * viewport.width
			// 将画布展示为设备像素宽度、高度
			page.canvas.style.width = viewport.width + 'px'
			page.canvas.style.height = viewport.height + 'px'
			// a (m11)水平扩大缩放 b (m12)垂直倾斜 c (m21)水平倾斜 d (m22)垂直扩大缩放 e (dx)水平移动 f (dy)垂直移动
			page.ctx.setTransform(page.ratio, 0, 0, page.ratio, 0, 0)

			// 将 PDF 页面渲染到画布上下文中,并等待渲染完成
			await PDFPageProxy.render({
				canvasContext: page.ctx,
				viewport: viewport
			}).promise
		},
		createPDF() {
			let _this = this
			PDFjs.GlobalWorkerOptions.workerSrc = pdfWorker

			let rawArray
			if (this.buffer !== null) {
				const raw = window.atob(this.buffer)
				const rawLength = raw.length
				rawArray = new Uint8Array(new ArrayBuffer(rawLength))
				for (let i = 0; i < rawLength; i++) {
					rawArray[i] = raw.charCodeAt(i)
				}
			}

			const source = {
				cMapUrl: fontLink, //引入pdf.js字体
				cMapPacked: true
			}
			this.buffer && Object.assign(source, rawArray)
			this.url && Object.assign(source, { url: this.url })
			const PDFDocumentLoadingTask = PDFjs.getDocument(source)

			return new Promise((resolve, reject) => {
				PDFDocumentLoadingTask.promise.then((PDFDocumentProxy) => {
					_this.PDFDocumentProxy = PDFDocumentProxy
					_this.total = PDFDocumentProxy.numPages

					resolve(true)
				})
			})
		},
		initPages(total) {
			for (let i = 0; i < total; i += 1) {
				const node = this.initCanvas(i + 1)
				const ratio = this.initPixelRatio(node.ctx)

				const page = {
					pageId: i + 1,
					pdfPage: null,
					dom: null,
					ratio: ratio
				}

				Object.assign(page, node)
				this.pages.push(page)
			}
		},
		// 创建canvas画布
		initCanvas(id) {
			let canvas = document.createElement('canvas')
			canvas.height = 0
			canvas.width = 0
			canvas.id = `${id}-canvas`
			const ctx = canvas.getContext('2d')

			return {
				canvas,
				ctx
			}
		},
		// 查询设备像素比
		initPixelRatio(ctx) {
			let bsr =
				ctx.webkitBackingStorePixelRatio ||
				ctx.mozBackingStorePixelRatio ||
				ctx.msBackingStorePixelRatio ||
				ctx.oBackingStorePixelRatio ||
				ctx.backingStorePixelRatio ||
				1
			// 设备像素比
			let dpr = window.devicePixelRatio || 1

			return dpr / bsr
		}
	}
}
