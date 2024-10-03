import {Charge} from "./charge";
import {Field} from "./field";
import {State} from "../../libs/ts/map/state";
import {Corpuscle} from "./corpuscule";

export class Source extends Charge {
    protected count: number = 0
    evaluate(currentState: State, nextState: State) {
        super.evaluate(currentState, nextState);
        const px = Math.random()
        const dx = px < 0.34 ? -1 : (px > 0.67 ? 1 : 0)
        const py = Math.random()
        const dy = py < 0.34 ? -1 : (py > 0.67 ? 1 : 0)

        nextState.addAgent(this)

        nextState.addAgent(new Corpuscle(this.x + dx, this.y + dy, this.getCharge(), {
            count: 1,
            x: this.x + dx,
            y: this.y + dy,
            charge: this.getCharge()
        }))
        Field.fillArea({x: this.x, y: this.y}, 10, this.getCharge(), currentState, nextState)
    }

    getCount() {
        return this.count
    }

    setCount(count: number) {
        this.count = count
        return this
    }
}