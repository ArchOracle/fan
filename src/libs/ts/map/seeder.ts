import {Matrix} from "../matrix/matrix";
import {Agent} from "./agent";

export class Seeder {
    constructor(
        protected condition: {(x: number, y: number, currentState: Matrix): boolean},
        protected agentCreator: {(x: number, y: number): Agent}
    ) {
    }

    isNeedCreate(x: number, y: number, currentState: Matrix): boolean {
        return this.condition.apply(this, [x, y, currentState])
    }

    getAgent(x: number, y: number) {
        return this.agentCreator(x, y)
    }
}