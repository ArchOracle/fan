import {Matrix} from "../../ts/matrix/matrix";

export class Agent {
	x
	y
	agentData
	constructor(x, y, agentData) {
		this.x = x
		this.y = y
		this.agentData = agentData
	}

	evaluate(currentState, nextState) {
		if (!(currentState instanceof Matrix) || !(nextState instanceof Matrix)) {
			throw new Error('Состояния должны быть матрицами!')
		}
	}

	getX() {
		return this.x
	}

	setX(x) {
		this.x = x
		return this
	}

	getY() {
		return this.y
	}

	setY(y) {
		this.y = y
		return this
	}
}