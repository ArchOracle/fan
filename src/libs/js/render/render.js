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

	isRun = false

	renderId

	stream
	recorder
	timerId
	prevFrameCount = 0
	time = 0

	frames = []

	static create(config) {
		return new Render(config)
	}

	constructor(config) {
		this.map = config.map
		this.canvas = config.canvas
		this.timesCanvasToMap = config.timesCanvasToMap
		this.context = this.canvas.getContext('2d', {alpha: false})
		this.fps = config.fps
		this.needFrameCount = config.needFrameCount
		this.converter = config.converter
		this.htmlEditor = config.htmlEditor
		this.htmlFinishElement = config.htmlFinishElement
		this.maxExecutionTime = config.maxExecutionTime
	}

	run() {
		this.isRun = true
		document.getElementById('load').style.display = 'none'
		this.stream = this.canvas.captureStream(25)
		this.recorder = new MediaRecorder(this.stream, {
			// mimeType: "video/mp4",
			bitsPerSecond: 25,

		})
		this.startVideoFile()
		this.recorder.start()
		this.timerId = setInterval(() => {
			this.fps = this.currentDrawCount - this.prevFrameCount
			this.prevFrameCount = this.currentDrawCount
			this.time += 1
		}, 1000)
		window.requestAnimationFrame(Render.runFrameDecorator(this));
		this.maxExecutionTimer = setTimeout(() => {
			this.stopRender('Время вышло!')
			this.stopCalculate()
		}, this.maxExecutionTime * 1000)

	}

	runFrame() {
		if (this.isRun) {
			this.calculateSnapshotList()
			this.drawSnapshotList()
			this.renderId = window.requestAnimationFrame(Render.runFrameDecorator(this));
		}
	}

	static runFrameDecorator(render) {
		return render.runFrame.bind(render)
	}

	calculateSnapshotList() {
		this.snapshotList.push(this.map.getSnapshot(this.converter))
		this.currentCalculateCount += 1;
		(this.htmlEditor)({
			currentCalculateCount: this.currentCalculateCount,
			currentDrawCount: this.currentDrawCount,
		})
		this.map.evaluate()
		if (this.currentCalculateCount >= this.needFrameCount) {
			this.stopCalculate()
		}
	}

	drawSnapshotList() {
		const currentSnapshot = this.snapshotList[this.currentDrawCount]
		this.context.putImageData(currentSnapshot.increaseSize(this.timesCanvasToMap).imageData, 0, 0)
		this.currentDrawCount += 1;
		(this.htmlEditor)({
			currentCalculateCount: this.currentCalculateCount,
			currentDrawCount: this.currentDrawCount,
			fps: this.fps,
			time: this.time
		})
		if (this.currentDrawCount >= this.needFrameCount) {
			this.stopRender('Рендер завершён!')
		}
	}

	stopRender(reason) {
		this.isRun = false
		clearTimeout(this.maxExecutionTimer)
		this.htmlFinishElement.innerText = reason
		window.cancelAnimationFrame(this.renderId)
		this.recorder.stop()
	}
	stopCalculate() {
		this.isRun = false
	}

	startVideoFile() {
		//this.recorder.requestData()
		this.recorder.addEventListener('dataavailable', (event) => {
			let data = event.data
			let reader = new FileReader()
			// reader.readAsDataURL(data)
			reader.addEventListener('load', () => {
				document.getElementById('load').href = reader.result
				document.getElementById('load').style.display = ''
			})
			// this.frames.push(data)
			reader.readAsDataURL(data)
			// document.getElementById('load').href = URL.createObjectURL(data)
		})
	}
}