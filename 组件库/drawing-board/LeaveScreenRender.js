// 离屏渲染,还可以使用webWork进行多线程渲染
class LeaveScreenRender {
	//私有属性
	#canvas
	#ctx
	#cancelAnimationFrameID
	constructor() {}

	create(width, height) {
		this.#canvas = document.createElement('canvas')
		this.#ctx = this.#canvas.getContext('2d')
		this.#canvas.width = width
		this.#canvas.height = height
	}

	draw(fn, ...args) {
		// 类中canvas执行绘图
		fn.call(this.#ctx, ...args)
	}

	render(ctx, positionX = 0, positionXY = 0) {
		// 在浏览器下次重绘之前继续更新下一帧动画，那么回调函数自身必须再次调用requestAnimationFrame
		this.#cancelAnimationFrameID = window.requestAnimationFrame(() => {
			// 实际canvas执行渲染
			//参数img、绘图位置x,y
			ctx.drawImage(this.#canvas, positionX, positionXY)
		})
	}

	stopRender() {
		window.cancelAnimationFrame(this.#cancelAnimationFrameID)
	}
}

export default LeaveScreenRender
