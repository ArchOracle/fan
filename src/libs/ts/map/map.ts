import {Matrix} from "../matrix/matrix";
import {ImagePixels} from "../image/image";
import {AgentList} from "./agentList";
import {Agent} from "./agent";
import {Seeder} from "./seeder";

export class Map {
	storage: Matrix
	height: number
	width: number
	postHandler
	static agentCount: number = 0
	static maxEnergy: number = 0

	static instance: Map

	constructor(
		height: number,
		width: number,
		seedConfig: Array<Seeder> = [],
		postHandler = (agentList: AgentList): AgentList => {return agentList}
	) {
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
				Map.agentCount += agentList.getCountExistsAgent()
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

	addAgent(agent: Agent) {
		Map.addAgentToStorage(agent, this.storage)
	}

	static addAgentToStorage(agent: Agent, storage: Matrix) {
		let agentList = AgentList.loadFromMatrix(storage, agent.getX(), agent.getY())
		agentList.push(agent)
		agentList.saveToMatrix(storage)
	}

	seed(seeders: Array<Seeder>) {
		for (let x = 0; x < this.width; x += 1) {
			for (let y = 0; y < this.height; y +=1 ) {
				(new AgentList(x, y)).saveToMatrix(this.storage)
				seeders.forEach((seeder) => {
					if (seeder.isNeedCreate(x, y, this.storage)) {
						this.addAgent(seeder.getAgent(x, y))
					}
				})
			}
		}
	}

	getSnapshot() {
		let snapshot = ImagePixels.create(this.height, this.width)
		for (let x = 0; x < this.width; x += 1) {
			for (let y = 0; y < this.height; y +=1 ) {
				snapshot.setPixelColor(x, y, AgentList.loadFromMatrix(this.storage, x, y).getPixel())
			}
		}
		snapshot.fillImageData()
		return snapshot
	}

	createStorage(height: number, width: number): Matrix {
		return new Matrix(height, width, Array)
		// return new M2(height, width)
	}
}