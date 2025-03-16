import {Location} from "./location";
import {Point} from "./point";
import {Vector} from "../tools/math/vector";

export class Link extends Location{
    constructor(protected pointStart: Point, protected pointEnd: Point) {
        super();
        pointStart.addLink(this)
        pointEnd.addLink(this)
    }

    applyForce() {
        this.pointStart.force = this.getCenter().sub(this.pointStart.position).multipleOnScalar(this.getScalarForce())
        this.pointEnd.force = this.getCenter().sub(this.pointEnd.position).multipleOnScalar(this.getScalarForce())
    }

    getScalarForce() {
        return (this.getCurrentSize() - this.getSize()) / 1000
    }

    getCenter() {
        return new Vector(
            (this.pointEnd.position.x + this.pointStart.position.x) / 2,
            (this.pointEnd.position.y + this.pointStart.position.y) / 2
        )
    }

    getCurrentSize() {
        return Math.sqrt(
            (this.pointEnd.position.x - this.pointStart.position.x)**2 +
            (this.pointEnd.position.y - this.pointStart.position.y)**2
        )
    }

    getPointStart() {
        return this.pointStart
    }

    getPointEnd() {
        return this.pointEnd
    }

    draw(context: CanvasRenderingContext2D) {
        context.beginPath()
        context.moveTo(this.pointStart.position.x, this.pointStart.position.y)
        context.lineTo(this.pointEnd.position.x, this.pointEnd.position.y)
        context.stroke()
    }
}