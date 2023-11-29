import {Matrix} from "../matrix/matrix";

export class Agent {
	x
	y
	constructor(x, y, agentData) {
		this.x = x
		this.y = y
	}

	evaluate(thisState, nextState) {
		if (!(thisState instanceof Matrix) || !(nextState instanceof Matrix)) {
			throw new Error('Состояния должны быть матрицами!')
		}
	}
}