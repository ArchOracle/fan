import {Vector} from "../vector";

export class Line {
    public start: Vector
    public end: Vector
    public vector: Vector

    constructor(start: Vector, end: Vector) {
        this.start = start
        this.end = end
        this.vector = start.copy().sub(end)
    }

    getLength() {
        return this.start.copy().sub(this.end).getLength()
    }
}