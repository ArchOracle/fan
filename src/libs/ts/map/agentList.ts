import {Matrix} from "../matrix/matrix";
import {Agent} from "./agent";
import {Pixel} from "../image/pixel";
import {State} from "./state";

export class AgentList {
    protected agents: Array<Agent>
    constructor(
        protected x: number,
        protected y: number,
    ) {
        this.agents = []
    }

    evaluate(currentState: Matrix, nextState: Matrix) {
    }

    push(agent: Agent) {
        if (this.isNeedSaveAgent(agent)) {
            this.agents.push(agent)
        }
        return this
    }

    isNeedSaveAgent(agent: Agent): boolean {
        return true
    }

    getX(): number {
        return this.x
    }

    getY(): number {
        return this.y
    }

    getCountExistsAgent(): number {
        return this.agents.length
    }

    getPixel(): Pixel {
        return new Pixel(255, 0, 0, 0)
    }

    save(state: State) {
        if (this.isNeedSave()) {
            state.set(this.getX(), this.getY(), this)
        }
        return this
    }

    isNeedSave(): boolean {
        return true
    }
}