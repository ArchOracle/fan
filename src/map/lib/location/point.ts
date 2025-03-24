import {Location} from "./location";
import {Vector} from "../tools/math/vector";
import {Link} from "./link";

export class Point extends Location
{
    get force(): Vector {
        return this._force;
    }

    set force(value: Vector) {
        this._force = value;
    }
    get speed(): Vector {
        return this._speed;
    }

    set speed(value: Vector) {
        this._speed = value;
    }
    get position(): Vector {
        return this._position;
    }

    set position(value: Vector) {
        this._position = value;
    }
    protected _position: Vector
    protected _speed: Vector
    protected _force: Vector
    protected linkList: Array<Link> = []

    constructor() {
        super();
        this._position = new Vector()
        this._speed = new Vector()
        this._force = new Vector()
    }

    static create(position: Vector, speed: Vector, force: Vector) {
        let point = new Point()
        point.position = position
        point.speed = speed
        point.force = force
        return point
    }

    evaluate() {
        this.position.add(this.speed)
        this.speed.add(this.force.multipleOnScalar(1 / this.size)).multipleOnScalar(0.9)
    }

    draw(context: CanvasRenderingContext2D) {
        context.beginPath()
        context.arc(this.position.x, this.position.y, this.size, 0, 2 * Math.PI)
        context.stroke()
    }

    addLink(link: Link) {
        this.linkList.push(link)
        return this
    }

    removeLink(removingLink: Link) {
        this.linkList = this.linkList.filter((link) => {
            return link != removingLink
        })
        return this
    }

    getLinkList() {
        return this.linkList
    }

    static checkIntersection(first: Point, second: Point) {

    }
}