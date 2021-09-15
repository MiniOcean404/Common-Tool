export function draw(drawConfig) {
	const {
		point1,
		point2,
		state,
		pencilConfig: { color: PColor, size: PSize },
		eraserConfig: { color: EColor, size: ESize }
	} = drawConfig

	this.lineWidth = state ? PSize : ESize
	this.strokeStyle = state ? PColor : EColor
	this.lineCap = 'round'
	this.lineJoin = 'round'

	this.save()

	//每次触摸开始，开启新的路径,（清除后上次的东西就不存在了，否则还存在）
	this.beginPath()
	this.moveTo(point1.X, point1.Y)
	this.lineTo(point2.X, point2.Y)
	this.stroke()

	this.restore()
}
