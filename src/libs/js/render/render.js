export class Render {
	map

	canvas
	context

	timesCanvasToMap = 1

	fps
	needFrameCount

	currentCalculateCount = 0
	currentDrawCount = 0

	htmlEditor
	htmlFinishElement

	converter
	snapshotList = []

	static create(config) {
		return new Render(config)
	}

	constructor(config) {
		this.map = config.map
		this.canvas = config.canvas
		this.timesCanvasToMap = config.timesCanvasToMap
		this.context = this.canvas.getContext('2d')
		this.fps = config.fps
		this.needFrameCount = config.needFrameCount
		this.converter = config.converter
		this.htmlEditor = config.htmlEditor
		this.htmlFinishElement = config.htmlFinishElement
		this.maxExecutionTime = config.maxExecutionTime
	}

	run() {
		setTimeout(() => {
			this.calculateSnapshotList()
		}, 0)
		setTimeout(() => {
			this.drawSnapshotList()
		}, 10)
		this.maxExecutionTimer = setTimeout(() => {
			this.stopRender('Время вышло!')
		}, this.maxExecutionTime * 1000)
	}

	calculateSnapshotList() {
		for (let i = 0; i < this.needFrameCount; i += 1) {
			this.snapshotList.push(this.map.getSnapshot(this.converter))
			this.currentCalculateCount += 1;
			(this.htmlEditor)({
				currentCalculateCount: this.currentCalculateCount,
				currentDrawCount: this.currentDrawCount,
			})
			this.map.evaluate()
		}
	}

	drawSnapshotList() {
		this.drawIntervalId = setInterval(() => {
			const currentSnapshot = this.snapshotList[this.currentDrawCount]
			this.context.putImageData(currentSnapshot.increaseSize(this.timesCanvasToMap).imageData, 0, 0)
			this.currentDrawCount += 1;
			(this.htmlEditor)({
				currentCalculateCount: this.currentCalculateCount,
				currentDrawCount: this.currentDrawCount,
			})
			if (this.currentDrawCount >= this.snapshotList.length) {
				this.stopRender('Рендер завершён!')
			}
		}, (1000 / this.fps))
	}

	stopRender(reason) {
		clearInterval(this.drawIntervalId)
		clearTimeout(this.maxExecutionTimer)
		this.htmlFinishElement.innerText = reason
	}
}