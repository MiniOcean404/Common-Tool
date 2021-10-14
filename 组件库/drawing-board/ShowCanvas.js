export default class ShowCanvas {
  static canvas
  static onlineCtx // 展示用的canvas

  constructor(width,height) {
   ShowCanvas.canvas  = document.createElement('canvas')

    ShowCanvas.canvas.height = height;
    ShowCanvas.canvas.width = width;
    ShowCanvas.onlineCtx = ShowCanvas.canvas.getContext('2d');
  }

  create(config = {size : 32,color : '#000000',compositeOperation:'destination-out'}){
    const {size,color,compositeOperation} = config
    ShowCanvas.onlineCtx.lineWidth = size;
    ShowCanvas.onlineCtx.strokeStyle = color;
    ShowCanvas.onlineCtx.globalCompositeOperation = compositeOperation; // 属性设置要在绘制新形状时应用的合成操作的类型
    ShowCanvas.onlineCtx.lineCap = 'round'; // 设置线条两端为圆弧
    ShowCanvas.onlineCtx.lineJoin = 'round'; // 设置线条转折为圆弧
  }
}
