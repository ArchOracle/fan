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

export class Source extends Agent
{
	evaluate(currentState, nextState) {
		super.evaluate(currentState, nextState);

	}
}

export class Corpuscle extends Agent
{
	evaluate(currentState, nextState) {
		super.evaluate(currentState, nextState);
	}
}

export class Field extends Agent
{
	evaluate(currentState, nextState) {
		super.evaluate(currentState, nextState);
	}
}