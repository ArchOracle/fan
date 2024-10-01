import {Matrix} from "../libs/js/matrix/matrix";
import {Map} from "../libs/js/map/map";
import {Agent} from "../libs/js/map/agent";

export class SimpleAgent extends Agent {
	constructor(x, y, agentData) {
		super(x, y, agentData);
	}

	evaluate(currentState, nextState) {
		super.evaluate(currentState, nextState)
		const ox = currentState.width / 2
		const oy = currentState.height / 2
		const xx = (this.agentData.x - ox)
		const yy = (this.agentData.y - oy)
		const s = (xx ** 2 + yy ** 2) ** 0.5
		const v = s / ((ox ** 2 + oy ** 2) ** 0.5)
		const dx = this.agentData.dx - (v * xx / 20)
		const dy = this.agentData.dx - (v * yy / 20)
		const newX = ox + xx + dx
		const newY = oy + yy + dy
		if (newX > 1 && newX < 599 && newY > 1 && newY < 599) {
			this.x = Math.round(newX)
			this.y = Math.round(newY)
			this.agentData = {
				x: newX,
				y: newY,
				dx: dx,
				dy: dy
			}
			Map.addAgentToStorage(this, nextState)
		}
	}
}

export class Charge extends Agent {
	constructor(x, y, agentData) {
		super(x, y, agentData);
		if (typeof this.agentData.charge !== 'number') {
			throw new Error('У источника, частицы или поля обязан быть заряд!')
		}
	}

	getCharge() {
		if (typeof this.agentData.charge !== 'number') {
			throw new Error('У источника, частицы или поля обязан быть заряд!')
		}
		return this.agentData.charge
	}

	setCharge(charge) {
		this.agentData.charge = charge
	}

	static postHandler(agentList) {
		return agentList
	}

	static converter(agentList) {
		let pixel = {
			red: 0,
			green: 0,
			blue: 0,
			alpha: 255,
		}
		const corpuscle = agentList.getCorpuscle() instanceof Corpuscle && agentList.getCorpuscle().getCharge() !== 0
		const field = agentList.getField() instanceof Field && agentList.getField().getCharge() !== 0
		if (corpuscle) {
			const charge = agentList.getCorpuscle().getCharge()
			pixel.red = 255 * charge
			pixel.green = -255 * charge

			if (agentList.getCorpuscle().agentData.count > 1) {
				pixel.blue = 255
			}
		}
		if (!!field) {
			if (!corpuscle) {
				pixel.blue = Math.min(Math.floor(agentList.getField().agentData.energy * 100), 100)
				if (agentList.getFieldCharge() > 0) {
					pixel.red = pixel.blue
				} else {
					pixel.green = pixel.blue
				}
			}
		}
		if (agentList.getSource() instanceof Source && agentList.getSource().getCharge() !== 0) {
			pixel.red = 155
			pixel.green = 155
			pixel.blue = 155
		}
		return pixel
	}

	static getFieldFromAgentList(agentList) {
		return agentList.getField()
	}
}

export class Source extends Charge {
	evaluate(currentState, nextState) {
		super.evaluate(currentState, nextState);
		const px = Math.random()
		const dx = px < 0.34 ? -1 : (px > 0.67 ? 1 : 0)
		const py = Math.random()
		const dy = py < 0.34 ? -1 : (py > 0.67 ? 1 : 0)

		Map.addAgentToStorage(this, nextState)

		Map.addAgentToStorage(new Corpuscle(this.x + dx, this.y + dy, {
			count: 1,
			x: this.x + dx,
			y: this.y + dy,
			charge: this.getCharge()
		}), nextState)
		Field.fillArea({x: this.x, y: this.y}, 10, this.getCharge(), currentState, nextState)
	}
}

export class Corpuscle extends Charge {
	evaluate(currentState, nextState) {
		super.evaluate(currentState, nextState);
		let vector = this.getVectorMinimalField(currentState)
		if (this.isNeedEvaluate(currentState)) {
			if (this.agentData.count < 2) {
				this.agentData.x += vector.dx
				this.agentData.y += vector.dy
				this.x = Math.ceil(this.agentData.x)
				this.y = Math.ceil(this.agentData.y)
				Map.addAgentToStorage(this, nextState)
				Field.fillArea({x: this.x, y: this.y}, 1, this.getCharge(), currentState, nextState)
			} else {
				for (let i = 1; i <= this.agentData.count; i += 1) {
					const x = this.x + Math.ceil(Math.random() * 20 - 10)
					const y = this.y + Math.ceil(Math.random() * 20 - 10)
					let c1 = new Corpuscle(
						x,
						y,
						{
							x: x,
							y: y,
							count: 1,
							charge: this.getCharge()
						}
					)
					Map.addAgentToStorage(c1, nextState)
				}
			}
		} else {
			for (let i = 1; i <= this.agentData.count; i += 1) {
				const x = Math.ceil(Math.random() * 100 + 50)
				const y = Math.ceil(Math.random() * 150 + 50)
				let c1 = new Corpuscle(
					x,
					y,
					{
						x: x,
						y: y,
						count: 1,
						charge: this.getCharge()
					}
				)
				Map.addAgentToStorage(c1, nextState)
			}
		}
		// Map.addAgentToStorage(new Corpuscle(
		// 	this.x + 1,//vector.dx,
		// 	this.y + 2,//vector.dy,
		// 	{
		// 	count: this.agentData.count,
		// 	x: this.x + 1,//vector.dx,
		// 	y: this.y + 2,//vector.dy,
		// 	charge: this.getCharge()
		// }), nextState)
	}

	isNeedEvaluate(state) {
		return (this.getX() > 10) &&
			(this.getY() > 10) &&
			(this.getX() < 190) &&
			(this.getY() < 190)// && (Math.random() < 0.995)
			// AgentList.loadFromMatrix(state).getField()
	}

	getVectorMinimalField(currentState) {
		const radius = 40
		let isBreak = false;
		let vector = {
			energy: 1000200,
			dx: 0, dy: 0,
			charge: this.getCharge()
		}
		if (this.x - 4 < radius / 2) {
			vector.dx = 2
			isBreak = true
		}
		if (this.x + 4 > Map.instance.width - radius / 2) {
			vector.dx = -2
			isBreak = true
		}
		if (this.y - 4 < radius / 2) {
			vector.dy = 2
			isBreak = true
		}
		if (this.y + 4 > Map.instance.height - radius / 2) {
			vector.dy = -2
			isBreak = true
		}
		if (false && isBreak) {
			return vector
		}
		// if (this.x - radius < 0 || this.x + radius > 99) {
		// 	return vector
		// }
		// if (this.y - radius < 0 || this.y + radius > 99) {
		// 	return vector
		// }
		//return vector
		isBreak = false;
		for (let x = this.x - radius; x <= this.x + radius; x += 1) {
			for (let y = this.y - radius; y <= this.y + radius; y += 1) {
				let agentList = AgentList.loadFromMatrix(currentState, x, y)
				const charge = agentList.getFieldCharge()
				const energy = agentList.getFieldEnergy() * (this.getCharge() * charge) + (1 + Math.random() * 15)
				if (
					this.isNeedVector(vector, charge, energy)
				) {
					vector = {
						energy: energy,
						dx: x - this.x,
						dy: y - this.y,
						charge: charge
					}
					// isBreak = this.getCharge() + charge === 0
				}
				if (isBreak) {
					break
				}
			}
			if (isBreak) {
				break
			}
		}
		vector.dx = Math.sign(vector.dx)
		vector.dy = Math.sign(vector.dy)
		return vector
	}

	isNeedVector(vector, charge, energy) {
		if (vector.charge * charge === -1) {
			return vector.energy > energy
		} else if (vector.charge * charge === 1) {
			return vector.energy > energy
		} else {
			return Math.random() > 0.7
		}
	}
}

export class Field extends Charge {
	evaluate(currentState, nextState) {
		super.evaluate(currentState, nextState);
		Field.fillArea({x: this.x, y: this.y}, 1 * this.agentData.energy, this.agentData.charge, currentState, nextState)
	}

	getEnergy() {
		return this.agentData.energy
	}

	static fillArea(center, currentEnergy, charge, currentState, nextState) {
		const pe = 1//Math.ceil(1 + 15 * Math.random())
		if (center.x - pe < 0 || center.x + pe > Map.instance.height - 2) {
			//console.log(center.x)
			return
		}
		if (center.y - pe < 0 || center.y + pe > Map.instance.height - 2) {
			//console.log(center.y)
			return
		}

		if (charge === 0) {
			return;
		}
		const dE = 1 * currentEnergy / ((2 * pe + 1) * (2 * pe + 1))
		for (let x = center.x - pe; x <= center.x + pe; x += 1) {
			for (let y = center.y - pe; y <= center.y + pe; y += 1) {
				let agentList = AgentList.loadFromMatrix(nextState, x, y)//nextState.get(x,y).getField()
				let field = agentList.getField()//nextState.get(x,y).getField()
				const localCharge = agentList.getFieldCharge()
				let energy = field.agentData.energy * localCharge
				energy += dE * charge
				field.setCharge(Math.sign(energy))
				field.agentData.energy = Math.abs(energy)
				if (field.agentData.energy > Map.maxEnergy) {
					Map.maxEnergy = field.agentData.energy
				}
				agentList.saveField()
				agentList.saveToMatrix(nextState)
			}
		}
	}
}

export class AgentList {
	#x
	#y
	#source
	#corpuscle
	#field
	#fieldCharge = 0
	#fieldEnergy = 0

	constructor(x, y) {
		this.#x = x
		this.#y = y
		this.#source = new Source(x, y, {
			charge: 0,
			count: 0,
			x: this.#x,
			y: this.#y
		})
		this.#corpuscle = new Corpuscle(x, y, {
			charge: 0,
			count: 0,
			x: this.#x,
			y: this.#y
		})
		this.#field = new Field(x, y, {
			charge: 0,
			energy: 0,
			x: this.#x,
			y: this.#y
		})
	}

	evaluate(storage, state) {
		if (this.getSource().getCharge() !== 0) {
			this.getSource().evaluate(storage, state)
		}
		if (this.getCorpuscle().getCharge() !== 0) {
			this.getCorpuscle().evaluate(storage, state)
		}
		if (this.getFieldCharge() !== 0) {
			this.getField().evaluate(storage, state)
		}
	}

	push(agent) {
		if (agent instanceof Source) {
			this.getSource().setCharge(this.getSource().getCharge() + agent.getCharge())
			this.getSource().agentData.count = this.getSource().agentData.count + agent.agentData.count
		}
		if (agent instanceof Corpuscle) {
			const otherCharge = agent.getCharge()
			const otherCount = agent.agentData.count

			let newCount = this.getCorpuscle().getCharge() * this.getCorpuscle().agentData.count + otherCharge * otherCount

			this.getCorpuscle().setCharge(Math.sign(newCount))
			this.getCorpuscle().agentData.count = Math.abs(newCount)
		}
		if (agent instanceof Field) {
			const charge = this.getFieldCharge() + agent.getCharge()
			this.getField().setCharge(charge)
			this.#fieldCharge = charge
		}
	}

	getX() {
		return this.#x
	}

	getY() {
		return this.#y
	}

	getSource() {
		return this.#source
	}

	getCorpuscle() {
		return this.#corpuscle
	}

	getField() {
		return this.#field
	}

	getFieldCharge() {
		return this.#fieldCharge
	}

	getFieldEnergy() {
		return this.#fieldEnergy
	}

	setSource(source) {
		this.#source = source
		return this
	}

	setCorpuscle(corpuscle) {
		this.#corpuscle = corpuscle
		return this
	}

	setField(field) {
		this.#field = field
		this.#fieldCharge = field.getCharge()
		this.#fieldEnergy = field.agentData.energy
		return this
	}

	saveField() {
		this.#fieldCharge = this.#field.getCharge()
		this.#fieldEnergy = this.#field.agentData.energy
	}

	saveToMatrix(matrix) {
		if (
			this.getSource().getCharge() !== 0 ||
			this.getCorpuscle().getCharge() !== 0 ||
			this.getFieldCharge() !== 0
		) {
			matrix.set(this.getX(), this.getY(), this)
		}
	}

	static loadFromMatrix(matrix, x, y) {
		let agentList = matrix.get(x, y)
		if (!(agentList instanceof AgentList)) {
			agentList = new AgentList(x, y)
		}
		return agentList
	}
}