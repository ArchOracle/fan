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
			if (agentList.getCorpuscle().getCharge() > 0) {
				pixel.red = 255
			} else if (agentList.getCorpuscle().getCharge() < 0) {
				pixel.green = 255
			}
		}
		if (!!field) {
			if (!corpuscle) {
				pixel.blue = Math.min(Math.floor(Math.abs(agentList.getField().agentData.energy) * 100), 100)
				if (agentList.getField().getCharge() > 0) {
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
				this.x += vector.dx
				this.y += vector.dy
				this.agentData.x += vector.dx
				this.agentData.y += vector.dy
				Map.addAgentToStorage(this, nextState)
				Field.fillArea({x: this.x, y: this.y}, 1, this.getCharge(), currentState, nextState)
			} else {
				let c1 = new Corpuscle(
					this.x + vector.dx,
					this.y,
					{
						x: this.x + vector.dx,
						y: this.y,
						count: this.agentData.count / 2,
						charge: this.getCharge()
					}
				)
				Map.addAgentToStorage(c1, nextState)
				Field.fillArea({
					x: c1.getX(),
					y: c1.getY()
				}, c1.agentData.count, c1.getCharge(), currentState, nextState)
				let c2 = new Corpuscle(
					this.x,
					this.y + vector.dy,
					{
						x: this.x,
						y: this.y + vector.dy,
						count: this.agentData.count / 2,
						charge: this.getCharge()
					}
				)
				Map.addAgentToStorage(c2, nextState)
				Field.fillArea({
					x: c2.getX(),
					y: c2.getY()
				}, c2.agentData.count, c2.getCharge(), currentState, nextState)
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
		return (this.getX() > 3) &&
			(this.getY() > 3) &&
			(this.getX() < 197) &&
			(this.getY() < 197)
			// AgentList.loadFromMatrix(state).getField()
	}

	getVectorMinimalField(currentState) {
		const radius = 17
		let vector = {
			energy: 1000000, x: 50, y: 50,
			dx: 0, dy: 0,
			charge: this.getCharge()
		}
		if (this.x - radius < radius) {
			vector.dx = 2
			return vector
		}
		if (this.x + radius > 198 - radius) {
			vector.dx = -2
			return vector
		}
		if (this.y - radius < radius) {
			vector.dy = 2
			return vector
		}
		if (this.y + radius > 198 - radius) {
			vector.dy = -2
			return vector
		}
		// if (this.x - radius < 0 || this.x + radius > 99) {
		// 	return vector
		// }
		// if (this.y - radius < 0 || this.y + radius > 99) {
		// 	return vector
		// }
		//return vector
		for (let x = this.x - radius; x <= this.x + radius; x += 1) {
			for (let y = this.y - radius; y <= this.y + radius; y += 1) {
				let agentList = AgentList.loadFromMatrix(currentState, x, y)
				const field = Charge.getFieldFromAgentList(agentList)
				const energy = field.getEnergy() + (2 * Math.random() - 1)
				const charge = field.getCharge()
				if (
					// vector.energy * vector.charge > field.getCharge() * energy
					vector.energy > energy
					// || (vector.charge !== charge)
					|| this.getCharge() * charge === -1
				) {
					vector = {
						energy: energy, x: x, y: y,
						dx: x - this.x,
						dy: y - this.y,
						charge: charge
					}
				}
			}
		}
		vector.dx = Math.sign(vector.dx)
		vector.dy = Math.sign(vector.dy)
		return vector
	}
}

export class Field extends Charge {
	evaluate(currentState, nextState) {
		super.evaluate(currentState, nextState);
		Field.fillArea({x: this.x, y: this.y}, this.agentData.energy / 2, this.agentData.charge, currentState, nextState)
	}

	getEnergy() {
		return this.agentData.energy
	}

	static fillArea(center, currentEnergy, charge, currentState, nextState) {
		const pe = 3//Math.ceil(1 + 15 * Math.random())
		const dE = 2 * currentEnergy / ((2 * pe + 1) * (2 * pe + 1))
		if (center.x - pe < 0 || center.x + pe > 198) {
			//console.log(center.x)
			return
		}
		if (center.y - pe < 0 || center.y + pe > 198) {
			//console.log(center.y)
			return
		}

		if (charge === 0) {
			return;
		}
		for (let x = center.x - pe; x <= center.x + pe; x += 1) {
			for (let y = center.y - pe; y <= center.y + pe; y += 1) {
				let agentList = AgentList.loadFromMatrix(nextState, x, y)//nextState.get(x,y).getField()
				let field = agentList.getField()//nextState.get(x,y).getField()
				if (field.getCharge() === 0) {
					field.agentData.energy += dE * charge
					field.setCharge(Math.sign(field.agentData.energy))
				} else {
					field.agentData.energy += dE * ((field.getCharge() * charge) > 0 ? 1 : -1)
					field.setCharge(Math.sign(field.agentData.energy) * field.getCharge())
				}
				field.agentData.energy = Math.abs(field.agentData.energy)
				let maxEnergy = Map.maxEnergy
				if (field.agentData.energy > (maxEnergy)) {
					Map.maxEnergy = field.agentData.energy
				}
				agentList.saveToMatrix(nextState)
			}
		}
	}
}

export class AgentList
{
	#x
	#y
	#source
	#corpuscle
	#field

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
		if (this.getField().getCharge() !== 0) {
			this.getField().evaluate(storage, state)
		}
	}

	push(agent) {
		if (agent instanceof Source) {
			this.getSource().setCharge(this.getSource().getCharge() + agent.getCharge())
			this.getSource().agentData.count = this.getSource().agentData.count + agent.agentData.count
		}
		if (agent instanceof Corpuscle) {
			const otherCharge =  agent.getCharge()
			const otherCount =  agent.agentData.count

			let newCount = this.getCorpuscle().getCharge() * this.getCorpuscle().agentData.count + otherCharge * otherCount

			this.getCorpuscle().setCharge(Math.sign(newCount))
			this.getCorpuscle().agentData.count = Math.abs(newCount)
		}
		if (agent instanceof Field) {
			this.getField().setCharge(this.getField().getCharge() + agent.getCharge())
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
		return this
	}

	saveToMatrix(matrix) {
		if (
			this.getSource().getCharge() !== 0 ||
			this.getCorpuscle().getCharge() !== 0 ||
			this.getField().getCharge() !== 0
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