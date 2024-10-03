import {Matrix} from "../matrix/matrix";
import {Agent} from "./agent";
import {AgentList} from "./agentList";
import {Map} from "./map";

export class State extends Matrix {
    protected map?: Map
    protected data: (Array<AgentList | undefined>)
    protected agentListType?: AgentListType

    static create(
        height: number = 0,
        width: number = 0,
        dataStorageType: new(length: number) => (Array<AgentList | undefined>),
        map: Map,
        agentListType: AgentListType
    ) {
        return (new State(height, width, dataStorageType)).setMap(map).setAgentListType(agentListType)
    }

    constructor(
        height: number = 0,
        width: number = 0,
        dataStorageType: new(length: number) => (Array<AgentList | undefined>)
    ) {
        super(height, width, dataStorageType);
        this.data = new (dataStorageType)(height * width);
    }

    getMap(): Map {
        return <Map>this.map;
    }

    setMap(value: Map) {
        this.map = value;
        return this
    }

    getAgentListType(): AgentListType {
        return <AgentListType>this.agentListType;
    }

    setAgentListType(value: AgentListType) {
        this.agentListType = value;
        return this
    }


    addAgent(agent: Agent): State {
        this.loadAgentList(agent.getX(), agent.getY()).push(agent).saveToMatrix(this)
        return this
    }

    loadAgentList(x: number, y: number): AgentList {
        let agentList = this.get(x, y)
        if (!(agentList instanceof (<AgentListType>this.agentListType).constructor)) {
            agentList = new (<AgentListType>this.agentListType)(x, y)
        }
        return agentList
    }
}

export type AgentListType = new(x: number, y: number) => AgentList