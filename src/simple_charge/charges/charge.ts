import {Agent} from "../../libs/ts/map/agent";
import {ChargeList} from "./chargelist";

export class Charge extends Agent {
    constructor(x: number, y: number, protected charge: number, agentData: object) {
        super(x, y, agentData);
    }

    getCharge() {
        return this.charge
    }

    setCharge(charge: number) {
        this.charge = charge
        return this
    }

    static postHandler(agentList: ChargeList) {
        return agentList
    }
}