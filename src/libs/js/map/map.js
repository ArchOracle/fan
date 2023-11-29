import {Matrix} from "../matrix/matrix";

export class Map {
	storage
	height
	width

	constructor(height, width) {
		this.height = height
		this.width = width
		this.storage = new Matrix(height, width, Array)
	}

	evaluate() {
		let nextState = new Matrix(this.height, this.width, Array)
		for (let y = 0; y < this.height; y += 1) {
			for (let x = 0; x < this.width; x += 1) {
				let agentList = this.storage.get(x, y)
				if (Array.isArray(agentList)) {
					agentList.forEach((agent) => {
						agent.evaluate(this.storage, nextState)
					})
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
}