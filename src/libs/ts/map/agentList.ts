import {Matrix} from "../matrix/matrix";
import {Agent} from "./agent";
import {Pixel} from "../image/pixel";

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

    saveToMatrix(matrix: Matrix) {
        if (this.isNeedSave()) {
            matrix.set(this.getX(), this.getY(), this)
        }
    }

    isNeedSave(): boolean {
        return true
    }

    static loadFromMatrix(matrix: Matrix, x: number, y: number): AgentList {
        let agentList = matrix.get(x, y)
        if (!(agentList instanceof AgentList)) {
            agentList = new AgentList(x, y)
        }
        return agentList
    }
}