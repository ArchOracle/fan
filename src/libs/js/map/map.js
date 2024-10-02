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

	static instance

	constructor(height, width, seedConfig = [], postHandler = (agentList) => {return agentList}) {
		this.height = height
		this.width = width
		this.storage = this.createStorage(height, width)//new Matrix(height, width, Array)
		if (seedConfig.length > 0) {
			this.seed(seedConfig)
		}
		this.postHandler = postHandler
		Map.instance = this
	}

	evaluate() {
		let nextState = this.createStorage(this.height, this.width)//new Matrix(this.height, this.width, Array)
		Map.agentCount = 0
		for (let y = 0; y < this.height; y += 1) {
			for (let x = 0; x < this.width; x += 1) {
				let agentList = AgentList.loadFromMatrix(this.storage, x, y)//this.storage.get(x, y)
				Map.agentCount += agentList.getSource().getCharge() !== 0
				Map.agentCount += agentList.getCorpuscle().getCharge() !== 0
				Map.agentCount += agentList.getFieldCharge() !== 0
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
		let agentList = AgentList.loadFromMatrix(storage, agent.x, agent.y)
		agentList.push(agent)
		agentList.saveToMatrix(storage)
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
				let agentList = AgentList.loadFromMatrix(this.storage, x, y)
				snapshot.setPixelColor(x, y, (converter)(agentList))
			}
		}
		snapshot.fillImageData()
		return snapshot
	}

	createStorage(height, width) {
		return new Matrix(height, width, Array)
		// return new M2(height, width)
	}
}