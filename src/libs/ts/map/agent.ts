import {Matrix} from "../matrix/matrix";
import {State} from "./state";

export class Agent {
	constructor(
		protected x: number,
		protected y: number,
		protected agentData: object
	) {}

	evaluate(currentState: State, nextState: State) {

	}

	getX(): number {
		return this.x
	}

	setX(x: number): Agent {
		this.x = x
		return this
	}

	getY(): number {
		return this.y
	}

	setY(y: number): Agent {
		this.y = y
		return this
	}
}