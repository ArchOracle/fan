import {Matrix} from "../libs/js/matrix/matrix";
import {Map} from "../libs/js/map/map";

export class SimpleAgent {
	x
	y
	constructor(x, y) {
		this.x = x
		this.y = y
	}
	evaluate(thisState, nextState) {
		if (!(thisState instanceof Matrix) || !(nextState instanceof Matrix)) {
			throw new Error('Состояния должны быть матрицами!')
		}
		this.x += (300 - this.x) / 10
		this.y += (300 - this.y) / 10
		Map.addAgentToStorage(this, nextState)
	}
}