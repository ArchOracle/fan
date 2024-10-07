import {ImagePixels} from "../image/image";
import {AgentList} from "./agentList";
import {Agent} from "./agent";
import {Seeder} from "./seeder";
import {State} from "./state";
import {ChargeList} from "../../../simple_charge/charges/chargelist"

export class Map {
	state: State
	height: number
	width: number
	static agentCount: number = 0
	static maxEnergy: number = 0

	static instance: Map

	protected currentSnapshot?: ImagePixels

	constructor(
		height: number,
		width: number,
		seedConfig: Array<Seeder> = []
	) {
		this.height = height
		this.width = width
		this.state = this.createStorage(height, width)//new Matrix(height, width, Array)
		if (seedConfig.length > 0) {
			this.seed(seedConfig)
		}
		Map.instance = this
	}

	evaluate() {
		let nextState = this.createStorage(this.height, this.width)//new Matrix(this.height, this.width, Array)
		Map.agentCount = 0
		for (let y = 0; y < this.height; y += 1) {
			for (let x = 0; x < this.width; x += 1) {
				let agentList = this.loadAgentList(x, y)//this.storage.get(x, y)
				Map.agentCount += agentList.getCountExistsAgent()
				agentList.evaluate(this.state, nextState)
			}
		}
		this.state = nextState
	}

	addAgent(agent: Agent) {
		this.loadAgentList(agent.getX(), agent.getY()).push(agent).save(this.state)
	}

	seed(seeders: Array<Seeder>) {
		for (let x = 0; x < this.width; x += 1) {
			for (let y = 0; y < this.height; y +=1 ) {
				seeders.forEach((seeder) => {
					if (seeder.isNeedCreate(x, y, this.state)) {
						this.addAgent(seeder.getAgent(x, y))
					}
				})
			}
		}
	}

	getSnapshot() {
		this.currentSnapshot = ImagePixels.create(this.height, this.width)
		for (let x = 0; x < this.width; x += 1) {
			for (let y = 0; y < this.height; y +=1 ) {
				this.currentSnapshot.setPixelColor(x, y, this.loadAgentList(x, y).getPixel())
			}
		}
		this.currentSnapshot.fillImageData()
		return this.currentSnapshot
	}

	createStorage(height: number, width: number): State {
		return State.create(
			height,
			width,
			Array,
			this,
			ChargeList
		)
	}

	loadAgentList(x: number, y: number): AgentList {
		return this.state.loadAgentList(x, y)
	}
}