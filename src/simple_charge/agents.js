import {Matrix} from "../libs/js/matrix/matrix";
import {Map} from "../libs/js/map/map";
import {Agent} from "../libs/js/map/agent";

export class SimpleAgent extends Agent{
	constructor(x, y, agentData) {
		super(x, x, agentData);
	}
	evaluate(thisState, nextState) {
		super.evaluate(thisState, nextState)
		this.x += (300 - this.x) / 10
		this.y += (300 - this.y) / 10
		Map.addAgentToStorage(this, nextState)
	}
}