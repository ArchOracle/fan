import {Map} from "../../libs/ts/map/map";
import {Charge} from "./charge";
import {State} from "../../libs/ts/map/state";
import {Field} from "./field";
import {ChargeList} from "./chargelist";

export class Corpuscle extends Charge {
    protected count: number = 0

    evaluate(currentState: State, nextState: State) {
        super.evaluate(currentState, nextState);
        let vector = this.getVectorMinimalField(currentState)
        if (this.isNeedEvaluate(currentState)) {
            if (this.getCount() < 2) {
                this.x += vector.dx
                this.y += vector.dy
                nextState.addAgent(this)
                Field.fillArea({x: this.x, y: this.y}, 1, this.getCharge(), currentState, nextState)
            } else {
                for (let i = 1; i <= this.getCount(); i += 1) {
                    const x = this.x + Math.ceil(Math.random() * 20 - 10)
                    const y = this.y + Math.ceil(Math.random() * 20 - 10)
                    let c1 = new Corpuscle(
                        x,
                        y,
                        this.getCharge(),
                        {
                            x: x,
                            y: y,
                            count: 1,
                            charge: this.getCharge()
                        }
                    ).setCount(1)
                    nextState.addAgent(c1)
                }
            }
        } else {
            for (let i = 1; i <= this.getCount(); i += 1) {
                const x = Math.ceil(Math.random() * 100 + 50)
                const y = Math.ceil(Math.random() * 150 + 50)
                let c1 = new Corpuscle(
                    x,
                    y,
                    this.getCharge(),
                    {
                        x: x,
                        y: y,
                        count: 1,
                        charge: this.getCharge()
                    }
                ).setCount(1)
                nextState.addAgent(c1)
            }
        }
    }

    isNeedEvaluate(state: State) {
        return (this.getX() > 10) &&
            (this.getY() > 10) &&
            (this.getX() < 190) &&
            (this.getY() < 190)// && (Math.random() < 0.995)
    }

    getVectorMinimalField(currentState: State) {
        const radius = 40
        let isBreak = false;
        let vector = {
            energy: 1000200,
            dx: 0, dy: 0,
            charge: this.getCharge()
        }
        if (this.x - 4 < radius / 2) {
            vector.dx = 2
            isBreak = true
        }
        if (this.x + 4 > Map.instance.width - radius / 2) {
            vector.dx = -2
            isBreak = true
        }
        if (this.y - 4 < radius / 2) {
            vector.dy = 2
            isBreak = true
        }
        if (this.y + 4 > Map.instance.height - radius / 2) {
            vector.dy = -2
            isBreak = true
        }
        if (false && isBreak) {
            return vector
        }
        for (let x = this.x - radius; x <= this.x + radius; x += 1) {
            for (let y = this.y - radius; y <= this.y + radius; y += 1) {
                let agentList = <ChargeList>currentState.loadAgentList(x, y)
                const charge = agentList.getFieldCharge()
                const energy = agentList.getFieldEnergy() * (this.getCharge() * charge) + (1 + Math.random() * 15)
                if (
                    this.isNeedVector(vector, charge, energy)
                ) {
                    vector = {
                        energy: energy,
                        dx: x - this.x,
                        dy: y - this.y,
                        charge: charge
                    }
                }
            }
        }
        vector.dx = Math.sign(vector.dx)
        vector.dy = Math.sign(vector.dy)
        return vector
    }

    isNeedVector(vector: { energy: number, dx: number, dy: number, charge: number }, charge: number, energy: number) {
        if (vector.charge * charge === -1) {
            return vector.energy > energy
        } else if (vector.charge * charge === 1) {
            return vector.energy > energy
        } else {
            return Math.random() > 0.7
        }
    }

    getCount() {
        return this.count
    }

    setCount(count: number) {
        this.count = count
        return this
    }
}