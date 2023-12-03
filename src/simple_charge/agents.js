import {Matrix} from "../libs/js/matrix/matrix";
import {Map} from "../libs/js/map/map";
import {Agent} from "../libs/js/map/agent";

export class SimpleAgent extends Agent{
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

export class Charge extends Agent
{
	constructor(x, y, agentData) {
		super(x, y, agentData);
		if (!this.agentData.charge && this.agentData.charge !== 0) {
			throw new Error('У источника, частицы или поля обязан быть заряд!')
		}
	}

	getCharge() {
		if (!this.agentData.charge && this.agentData.charge !== 0) {
			throw new Error('У источника, частицы или поля обязан быть заряд!')
		}
		return this.agentData.charge
	}

	setCharge(charge) {
		this.agentData.charge = charge
	}
}

export class Source extends Charge
{
	evaluate(currentState, nextState) {
		super.evaluate(currentState, nextState);
		const sd = Math.floor(Math.random() * 8)
		const d = (sd >= 4 ? sd + 1 : sd) - 4
		const dx = d % 3
		const dy = (d / 3) | 0
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

export class Corpuscle extends Charge
{
	evaluate(currentState, nextState) {
		super.evaluate(currentState, nextState);
		for (let i = 0; i < this.agentData.count; i += 1) {
			let vector = this.getVectorMinimalField(currentState)
			Map.addAgentToStorage(new Corpuscle(this.x + vector.dx, this.y + vector.dy, {
				count: 1,
				x: this.x + vector.dx,
				y: this.y + vector.dy,
				charge: this.getCharge()
			}), nextState)
		}
		Field.fillArea({x: this.x, y: this.y}, 1, this.getCharge(), currentState, nextState)
	}

	getVectorMinimalField(currentState) {
		let vector = {energy: 1000000, x: 0, y: 0}
		for (let x = this.x - 5; x <= this.x + 5; x += 1) {
			for (let y = this.y - 5; y <= this.y + 5; y += 1) {
				let agentList = currentState.get(x, y)
				if (!Array.isArray(agentList)) {
					continue
				}
				agentList.forEach((agent) => {
					const energy = agent.agentData.energy * (1 + Math.random() / 10)
					if (
						agent instanceof Field
						&& (
							(vector.energy > energy && agent.getCharge() === this.getCharge())
							|| (vector.energy < energy && agent.getCharge() !== this.getCharge())
						)
					) {
						vector = {
							energy: energy,
							dx: x - this.x,
							dy: y - this.y
						}
					}
				})
			}
		}
		vector.dx = Math.sign(vector.dx)
		vector.dy = Math.sign(vector.dy)
		return vector
	}
}

export class Field extends Charge
{
	evaluate(currentState, nextState) {
		super.evaluate(currentState, nextState);
		Field.fillArea({x: this.x, y: this.y}, this.agentData.energy, this.agentData.charge, currentState, nextState)
	}

	static fillArea(center, currentEnergy, charge, currentState, nextState) {
		const dE = 1 * currentEnergy / 121
		for (let x = center.x - 5; x <= center.x + 5; x += 1) {
			for (let y = center.y - 5; y <= center.y + 5; y += 1) {
				Map.addAgentToStorage(new Field(x, y, {
					energy: dE,
					charge: charge
				}), nextState)
			}
		}
	}
}