import {Matrix} from "../matrix/matrix";
import {ImagePixels} from "../image/image";

export class Map {
	storage
	height
	width
	postHandler
	static agentCount = 0

	constructor(height, width, seedConfig = [], postHandler = (agentList) => {return agentList}) {
		this.height = height
		this.width = width
		this.storage = new Matrix(height, width, Array)
		if (seedConfig.length > 0) {
			this.seed(seedConfig)
		}
		this.postHandler = postHandler
	}

	evaluate() {
		let nextState = new Matrix(this.height, this.width, Array)
		Map.agentCount = 0
		for (let y = 0; y < this.height; y += 1) {
			for (let x = 0; x < this.width; x += 1) {
				let agentList = this.storage.get(x, y)
				if (Array.isArray(agentList)) {
					agentList.forEach((agent) => {
						Map.agentCount += 1
						agent.evaluate(this.storage, nextState)
					})
				}
			}
		}
		for (let y = 0; y < this.height; y += 1) {
			for (let x = 0; x < this.width; x += 1) {
				if (!!this.postHandler && (typeof this.postHandler === 'function')) {
					nextState.set(x, y, (this.postHandler)(nextState.get(x, y)))
				}
			}
		}
		this.storage = nextState
	}

	addAgent(agent) {
		Map.addAgentToStorage(agent, this.storage)
	}

	static addAgentToStorage(agent, storage) {
		let agentList = storage.get(agent.x, agent.y)
		if (!Array.isArray(agentList)) {
			agentList = []
		}
		agentList.push(agent)
		storage.set(agent.x, agent.y, agentList)
	}

	seed(config) {
		for (let x = 0; x < this.width; x += 1) {
			for (let y = 0; y < this.height; y +=1 ) {
				config.forEach((configElement) => {
					if ((configElement.condition)(x, y, this.storage)) {
						this.addAgent(new (configElement.agentType)(x, y, (configElement.agentData)(x, y)))
					}
				})
			}
		}
	}

	getSnapshot(converter) {
		let snapshot = ImagePixels.create(this.height, this.width)
		for (let x = 0; x < this.width; x += 1) {
			for (let y = 0; y < this.height; y +=1 ) {
				let agentList = this.storage.get(x, y)
				if (!Array.isArray(agentList)) {
					agentList = undefined
				}
				snapshot.setPixelColor(x, y, (converter)(agentList))
			}
		}
		snapshot.fillImageData()
		return snapshot
	}
}