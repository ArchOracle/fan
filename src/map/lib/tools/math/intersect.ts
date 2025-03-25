import {Vector} from "./vector";
import {Line} from "./primitive/line";
import {Circle} from "./primitive/circle";

export class Intersect {
    public intersectPointList: Array<Vector> = []
    public intersectCircleList: Array<Circle> = []

    checkIntersectLineWithLine(from: Line, to: Line) {
        let fromStartX: number = from.start.x
        let fromStartY: number = from.start.y
        let fromEndX: number = from.end.x
        let fromEndY: number = from.end.y

        let toStartX: number = to.start.x
        let toStartY: number = to.start.y
        let toEndX: number = to.end.x
        let toEndY: number = to.end.y

        let Ax = (toStartX - fromStartX) / (fromEndX - fromStartX)
        let Bx = (toEndX - toStartX) / (fromEndX - fromStartX)

        let Ay = (toStartY - fromStartY) / (fromEndY - fromStartY)
        let By = (toEndY - toStartY) / (fromEndY - fromStartY)

        let t2 = (Ay - Ax) / (Bx - By)

        let t1x = Ax + Bx * t2
        let t1y = Ay + By * t2

        if (
            Math.abs(t1x - t1y) < 1e-6 &&
            t1x > 1e-3 && t1x < 1 - 1e-3 &&
            t2 > 1e-3 && t2 < 1 - 1e-3
        ) {
            this.intersectPointList.push(
                new Vector(
                    fromStartX + t1x * (fromEndX - fromStartX),
                    fromStartY + t1y * (fromEndY - fromStartY),
                )
            )
        }

        return this
    }

    checkIntersectCircleWithCircle(from: Circle, to: Circle) {
        let distance = from.center.copy().sub(to.center.copy()).getLength()
        if (distance < from.size + to.size) {
            this.intersectCircleList.push(from, to)
        }
        return this
    }
}