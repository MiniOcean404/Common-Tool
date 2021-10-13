// 离屏渲染,还可以使用webWork进行多线程渲染
class LeaveScreenRender {
	//私有属性
	#canvas
	#offlineCtx // 离线canvas
  #cancelAnimationFrameID
	constructor(width, height) {

    this.#canvas = document.createElement('canvas')
    this.#offlineCtx = this.#canvas.getContext('2d')
    this.#canvas.width = width
    this.#canvas.height = height
  }

	create({size,color,compositeOperation}) {
    this.#offlineCtx.lineWidth = size;
    this.#offlineCtx.strokeStyle = color;
    this.#offlineCtx.globalCompositeOperation = compositeOperation; // 属性设置要在绘制新形状时应用的合成操作的类型
    this.#offlineCtx.lineCap = 'round'; // 设置线条两端为圆弧
    this.#offlineCtx.lineJoin = 'round'; // 设置线条转折为圆弧
	}

	draw(fn, ...args) {
		// 类中canvas执行绘图 1
		fn.call(this.#offlineCtx, ...args)
	}

  // 对展示的Canvas进行渲染
	render(showCtx,positionX = 0, positionXY = 0) {
		// 在浏览器下次重绘之前继续更新下一帧动画，那么回调函数自身必须再次调用requestAnimationFrame
		this.#cancelAnimationFrameID = window.requestAnimationFrame(() => {
			// 实际canvas执行渲染
			//参数img、绘图位置x,y
      showCtx.drawImage(this.#canvas, positionX, positionXY)
		})
	}

  // 将展示的canvas渲染到离屏canvas
  renderLeave(c){
    this.#cancelAnimationFrameID = window.requestAnimationFrame(() => {
      this.#offlineCtx.clearRect(0,0,this.#canvas.width,this.#canvas.height)
      this.#offlineCtx.drawImage(c, 0, 0)
    })
  }

	stopRender() {
		window.cancelAnimationFrame(this.#cancelAnimationFrameID)
	}
}

export default LeaveScreenRender
