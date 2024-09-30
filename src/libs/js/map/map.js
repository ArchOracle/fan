import {Matrix} from "../matrix/matrix";
import {ImagePixels} from "../image/image";
import {AgentList} from "../../../simple_charge/agents";

export class Map {
	storage
	height
	width
	postHandler
	static agentCount = 0
	static maxEnergy = 0

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
				if (!(agentList instanceof AgentList)) {
					agentList = new AgentList(x, y)
				}
				nextState.set(x, y, new AgentList(x, y))
			}
		}
		for (let y = 0; y < this.height; y += 1) {
			for (let x = 0; x < this.width; x += 1) {
				let agentList = this.storage.get(x, y)
				if (!agentList || !(agentList instanceof AgentList)) {
					agentList = new AgentList(x, y)
				}
				Map.agentCount += agentList.getSource().getCharge() !== 0
				Map.agentCount += agentList.getCorpuscle().getCharge() !== 0
				Map.agentCount += agentList.getField().getCharge() !== 0
				agentList.evaluate(this.storage, nextState)
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
		if (!(agentList instanceof AgentList)) {
			agentList = new AgentList(agent.x, agent.y)
		}
		agentList.push(agent)
		storage.set(agent.x, agent.y, agentList)
	}

	seed(config) {
		for (let x = 0; x < this.width; x += 1) {
			for (let y = 0; y < this.height; y +=1 ) {
				this.storage.set(new AgentList(x, y))
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
				if (!agentList || !(agentList instanceof AgentList)) {
					agentList = new AgentList(x, y)
				}
				snapshot.setPixelColor(x, y, (converter)(agentList))
			}
		}
		snapshot.fillImageData()
		return snapshot
	}
}