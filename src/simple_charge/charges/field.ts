import {Map} from "../../libs/ts/map/map";
import {Charge} from "./charge";
import {ChargeList} from "./chargelist";
import {State} from "../../libs/ts/map/state";

export class Field extends Charge {
    protected energy: number = 0
    evaluate(currentState: State, nextState: State) {
        super.evaluate(currentState, nextState);
        Field.fillArea({x: this.x, y: this.y}, this.getEnergy(), this.getCharge(), currentState, nextState)
    }

    getEnergy() {
        return this.energy
    }

    setEnergy(energy: number) {
        this.energy = energy
        return this
    }

    static fillArea(center: {x: number, y: number}, currentEnergy: number, charge: number, currentState: State, nextState: State) {
        const pe = 1//Math.ceil(1 + 15 * Math.random())
        if (center.x - pe < 0 || center.x + pe > Map.instance.height - 2) {
            //console.log(center.x)
            return
        }
        if (center.y - pe < 0 || center.y + pe > Map.instance.height - 2) {
            //console.log(center.y)
            return
        }

        if (charge === 0) {
            return;
        }
        const dE = currentEnergy / ((2 * pe + 1) * (2 * pe + 1))
        let agentList: (ChargeList|null), field, energy
        const minX = center.x - pe, maxX = center.x + pe
        const minY = center.y - pe, maxY = center.y + pe
        for (let x = minX; x <= maxX; x += 1) {
            for (let y = minY; y <= maxY; y += 1) {
                agentList = <ChargeList>(<unknown>nextState.loadAgentList(x, y))//ChargeList.loadFromMatrix(nextState, x, y)//nextState.get(x,y).getField()
                field = agentList.getField()//nextState.get(x,y).getField()
                energy = agentList.getFieldEnergy() * agentList.getFieldCharge() + dE * charge
                field
                    .setCharge(Math.sign(energy))
                    .setEnergy(Math.abs(energy))
                if (field.getEnergy() > Map.maxEnergy) {
                    Map.maxEnergy = Math.abs(energy)
                }
                agentList
                    .saveField()
                    .save(nextState)
            }
        }
        agentList = null
        field = null
        energy = null
    }
}