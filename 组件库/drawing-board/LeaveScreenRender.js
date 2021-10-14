// 离屏渲染,还可以使用webWork进行多线程渲染
class LeaveScreenRender {
  static offlineCtx // 离线canvas
  static canvas

  //私有属性
  #width
  #height
  #cancelAnimationFrameID

  constructor(width, height) {
    if (this.#width === width&&this.#height === height){
      LeaveScreenRender.offlineCtx.clearRect(0,0,this.#width, this.#height)
      return
    }

    LeaveScreenRender.canvas = document.createElement('canvas')
    LeaveScreenRender.offlineCtx = LeaveScreenRender.canvas.getContext('2d')
    LeaveScreenRender.canvas.width = this.#width = width
    LeaveScreenRender.canvas.height = this.#height = height
  }

  create({size, color, compositeOperation}) {
    LeaveScreenRender.offlineCtx.lineWidth = size;
    LeaveScreenRender.offlineCtx.strokeStyle = color;
    LeaveScreenRender.offlineCtx.globalCompositeOperation = compositeOperation; // 属性设置要在绘制新形状时应用的合成操作的类型
    LeaveScreenRender.offlineCtx.lineCap = 'round'; // 设置线条两端为圆弧
    LeaveScreenRender.offlineCtx.lineJoin = 'round'; // 设置线条转折为圆弧
  }

  draw(fn, ...args) {
    // 类中canvas执行绘图 1
    fn.call(LeaveScreenRender.offlineCtx, ...args)
  }

  clearAll() {
    LeaveScreenRender.offlineCtx.clearRect(0, 0, this.#width, this.#height)
  }

  // 对展示的Canvas进行渲染
  render(showCtx, canvasData) {
    // 在浏览器下次重绘之前继续更新下一帧动画，那么回调函数自身必须再次调用requestAnimationFrame
    this.#cancelAnimationFrameID = window.requestAnimationFrame(() => {
      // 实际canvas执行渲染
      //参数img、绘图位置x,y
      // showCtx.drawImage(LeaveScreenRender.canvas, positionX, positionXY)

      if (canvasData) {
        LeaveScreenRender.offlineCtx.putImageData(canvasData, 0, 0);
      }

      const data = LeaveScreenRender.offlineCtx.getImageData(0, 0, this.#width, this.#height)
      showCtx.putImageData(data, 0, 0)
    })
  }

  // 将展示的canvas渲染到离屏canvas
  renderLeave(c) {
    this.#cancelAnimationFrameID = window.requestAnimationFrame(() => {
      LeaveScreenRender.offlineCtx.clearRect(0, 0, LeaveScreenRender.canvas.width, LeaveScreenRender.canvas.height)
      LeaveScreenRender.offlineCtx.drawImage(c, 0, 0)
    })
  }

  stopRender() {
    window.cancelAnimationFrame(this.#cancelAnimationFrameID)
  }


  //签完名的图片旋转处理
  rotateImg(src, edg, cb) {
    const canvas = LeaveScreenRender.canvas
    const ctx = LeaveScreenRender.offlineCtx

    let imgW;//图片宽度
    let imgH;//图片高度
    let size;//canvas初始大小


    if (edg % 90 !== 0) {
      throw new Error('旋转角度必须是90的倍数!');
    }

    (edg < 0) && (edg = (edg % 360) + 360)
    const quadrant = (edg / 90) % 4; //旋转象限
    const cutPosition = {sx: 0, sy: 0, ex: 0, ey: 0}; //裁剪坐标


    const image = new Image();
    image.crossOrigin = "anonymous" // 是否允许跨域
    image.src = src;
    image.onload = function () {
      imgW = image.width;
      imgH = image.height;
      size = imgW > imgH ? imgW : imgH;
      canvas.width = size * 2;
      canvas.height = size * 2;


      // 判断象限位置
      switch (quadrant) {
        case 0:
          cutPosition.sx = size;
          cutPosition.sy = size;
          cutPosition.ex = size + imgW;
          cutPosition.ey = size + imgH;
          break;
        case 1:
          cutPosition.sx = size - imgH;
          cutPosition.sy = size;
          cutPosition.ex = size;
          cutPosition.ey = size + imgW;
          break;
        case 2:
          cutPosition.sx = size - imgW;
          cutPosition.sy = size - imgH;
          cutPosition.ex = size;
          cutPosition.ey = size;
          break;
        case 3:
          cutPosition.sx = size;
          cutPosition.sy = size - imgW;
          cutPosition.ex = size + imgH;
          cutPosition.ey = size + imgW;
          break;
      }

      // 移动旋转
      ctx.translate(size, size);
      ctx.rotate(edg * Math.PI / 180);

      //drawImage向画布上绘制图片
      ctx.drawImage(image, 0, 0);
      //复制画布上指定矩形的像素数据
      const imgData = ctx.getImageData(cutPosition.sx, cutPosition.sy, cutPosition.ex, cutPosition.ey);

      if (quadrant % 2 === 0) {
        canvas.width = imgW;
        canvas.height = imgH;
      } else {
        canvas.width = imgH;
        canvas.height = imgW;
      }
      //将图像数据放回画布
      ctx.putImageData(imgData, 0, 0);

      cb(canvas)
    };
  }
}

export default LeaveScreenRender
