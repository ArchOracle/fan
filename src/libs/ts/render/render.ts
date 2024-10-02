import {Map} from "../map/map";
import {AgentList} from "../map/agentList";
import {ImagePixels} from "../image/image";

export class Render {
	protected map: Map

	protected canvas: HTMLCanvasElement
	protected context: CanvasRenderingContext2D

	protected timesCanvasToMap: number = 1

	protected fps: number
	protected needFrameCount: number

	protected currentCalculateCount: number = 0
	protected currentDrawCount: number = 0

	protected htmlEditor: {(params: object): void}
	protected htmlFinishElement: HTMLElement

	protected converter: {(agentList: AgentList): AgentList}
	protected snapshotList: Array<ImagePixels> = []

	protected isRun: boolean = false
	protected renderId: number = 0

	protected stream?: MediaStream
	protected recorder?: MediaRecorder
	protected timerId?: NodeJS.Timeout
	protected prevFrameCount: number = 0
	protected time: number = 0
	private readonly maxExecutionTime: number;
	private maxExecutionTimer?: NodeJS.Timeout;

	static create(config: RenderConfig) {
		return new Render(config)
	}

	constructor(config: RenderConfig) {
		this.map = config.map
		this.canvas = config.canvas
		this.timesCanvasToMap = config.timesCanvasToMap
		this.context = this.canvas.getContext('2d', {alpha: false})!
		this.fps = config.fps
		this.needFrameCount = config.needFrameCount
		this.converter = config.converter
		this.htmlEditor = config.htmlEditor
		this.htmlFinishElement = config.htmlFinishElement
		this.maxExecutionTime = config.maxExecutionTime
	}

	run() {
		this.isRun = true
		document.getElementById('load')!.style.display = 'none'
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

	static runFrameDecorator(render: Render) {
		return render.runFrame.bind(render)
	}

	calculateSnapshotList() {
		this.snapshotList.push(this.map.getSnapshot())
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

	stopRender(reason: string) {
		this.isRun = false
		clearTimeout(this.maxExecutionTimer)
		this.htmlFinishElement.innerText = reason
		window.cancelAnimationFrame(this.renderId)
		this.recorder!.stop()
	}
	stopCalculate() {
		this.isRun = false
	}

	startVideoFile() {
		//this.recorder.requestData()
		this.recorder!.addEventListener('dataavailable', (event) => {
			let data = event.data
			let reader = new FileReader()
			// reader.readAsDataURL(data)
			reader.addEventListener('load', () => {
				let link: HTMLElement | null = document!.getElementById('load')
				if (link instanceof HTMLAnchorElement && typeof reader.result === "string") {
					link.href = reader.result
					link.style.display = ''
				}
			})
			// this.frames.push(data)
			reader.readAsDataURL(data)
			// document.getElementById('load').href = URL.createObjectURL(data)
		})
	}
}

export class RenderConfig {
	constructor(
		public map: Map,
		public canvas: HTMLCanvasElement,
		public timesCanvasToMap: number,
		public fps: number,
		public needFrameCount: number,
		public converter: {(agentList: AgentList): AgentList},
		public htmlEditor: {(params: object): void},
		public htmlFinishElement: HTMLElement,
		public maxExecutionTime: number
	) {
	}
}