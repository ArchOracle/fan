import {Matrix} from "../matrix/matrix";
import {Agent} from "./agent";

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