import {Matrix} from "../matrix/matrix";
import {ImagePixels} from "../image/image";

export class Map {
	storage
	height
	width

	constructor(height, width, seedConfig = []) {
		this.height = height
		this.width = width
		this.storage = new Matrix(height, width, Array)
		if (seedConfig.length > 0) {
			this.seed(seedConfig)
		}
	}

	evaluate(postHandler = (agentList) => {return agentList}) {
		let nextState = new Matrix(this.height, this.width, Array)
		for (let y = 0; y < this.height; y += 1) {
			for (let x = 0; x < this.width; x += 1) {
				let agentList = this.storage.get(x, y)
				if (Array.isArray(agentList)) {
					agentList.forEach((agent) => {
						agent.evaluate(this.storage, nextState)
					})
				}
				if (!!postHandler && (typeof postHandler === 'function')) {
					nextState.set(x, y, (postHandler)(nextState.get(x, y)))
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
						this.addAgent(new (configElement.agentType)(x, y, configElement.agentData))
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
					agentList = []
				}
				snapshot.setPixelColor(x, y, (converter)(agentList))
			}
		}
		snapshot.fillImageData()
		return snapshot
	}
}