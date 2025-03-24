import {Point} from "../location/point";
import {Link} from "../location/link";
import {Vector} from "../tools/math/vector";
import {Intersect} from "../tools/math/intersect";
import {Line} from "../tools/math/primitive/line";

export class Generator {
    private readonly context: CanvasRenderingContext2D;
    protected pointList: Array<Point> = []
    protected linkList: Array<Link> = []
    protected evaluateProcessed: boolean = false
    protected fixGenerationCount = 0
    protected fixGenerationMax = 2

    constructor(public pointCount: number = 10, public linkCount: number = 20, protected canvas: HTMLCanvasElement|null) {
        if (canvas === null) {
            throw new DOMException('canvas не создан!')
        } else {
            let context = canvas.getContext("2d");
            if (context === null) {
                throw new Error('context не существует!')
            } else {
                this.context = context
            }
        }
    }

    generate() {
        // alert('Генерация запущена!')
        // alert('Точек: ' + this.pointCount + '; связей : ' + this.linkCount)
        (<HTMLElement>document.getElementById('completed')).style.display = 'none'
        this.pointList = []
        this.linkList = []
        this.fixGenerationCount = 0
        let linkList = []
        for (let i = 0; i < this.pointCount; i++) {
            this.pointList.push(
                Point.create(
                    new Vector(600 + (Math.random()-0.5) * 200, 450 + (Math.random()-0.5) * 200),
                    new Vector(),
                    new Vector()
                ).setSize(5 * Math.round(Math.random() * 3) + 5)
            )
        }
        for (let i = 0; i < this.linkCount; i++) {
            let indexPointStart = Math.floor(Math.random() * this.pointCount)
            let indexPointEnd = Math.floor(Math.random() * this.pointCount)
            if (indexPointStart === indexPointEnd) {
                indexPointEnd = (indexPointEnd + 1) % this.pointList.length
            }
            linkList.push(
                (new Link(
                    this.pointList[indexPointStart],
                    this.pointList[indexPointEnd]
                )).setSize(Math.round(Math.random() * 300) + 50)
            )
        }

        this.pointList = this.pointList.filter((point) => {
            return point.getLinkList().length > 0
        })

        for (let i = 0; i < linkList.length; i++) {
            if (!(linkList[i] instanceof Link)) {
                continue
            }
            if (
                linkList[i].getPointEnd() === linkList[i].getPointStart() ||
                !(linkList[i].getPointEnd() instanceof Point) ||
                !(linkList[i].getPointStart() instanceof Point)
            ) {
                // this.linkList.splice(i, 1)
                delete linkList[i]
            }
        }

        let linkForDelete = [];
        for (let i = 0; i < linkList.length; i += 1) {
            for (let j = i + 1; j < linkList.length; j++) {
                let from = linkList[i], to = linkList[j]
                if (
                    from.getPointStart() === to.getPointStart() &&
                    from.getPointEnd() === to.getPointEnd()
                ) {
                    linkForDelete.push(j)
                }
            }
        }
        linkForDelete.forEach((index) => {
            delete linkList[index]
        })
        for (let i = 0; i < linkList.length; i++) {
            if (linkList[i] instanceof Link) {
                this.linkList.push(linkList[i])
            }
        }
        this.linkCount = this.linkList.length
    }

    evaluate() {
        this.evaluateProcessed = true;
        (<HTMLElement>document.getElementById('completed')).style.display = 'none'
        this.linkList.forEach((link) => {
            link.applyForce()
        })
        this.pointList.forEach((point) => {
            point.evaluate()
        })
        if (this.checkNeedEvaluate()) {
            setTimeout(() => {
                this.draw()
                this.evaluate()
            }, 10)
        } else {
            setTimeout(() => {
                this.fixGenerate()
            }, 1000)
            this.draw()
            this.evaluateProcessed = false;
            (<HTMLElement>document.getElementById('completed')).style.display = 'block'
        }
    }

    checkNeedEvaluate() {
        let movingPointCount = this.pointList.length
        this.pointList.forEach((point) => {
            if (
                Math.abs(point.speed.x) < 1 &&
                Math.abs(point.speed.y) < 1 &&
                Math.abs(point.force.x) < 0.001 &&
                Math.abs(point.force.y) < 0.001
            ) {
                movingPointCount -= 1
            }
        })
        return movingPointCount !== 0
    }

    fixGenerate() {
        this.fixGenerationCount += 1
        if (this.fixGenerationCount <= this.fixGenerationMax && this.fixIntersect()) {
            this.evaluate()
        }
    }

    fixIntersect() {
        return this.fixIntersectLink()
    }

    fixIntersectLink() {
        let intersectPairList: Array<IntersectLinePair> = []
        for (let i = 0; i < this.linkList.length; i += 1) {
            for (let j = i + 1; j < this.linkList.length; j++) {
                let from = this.linkList[i], to = this.linkList[j]
                let intersectPointList = (new Intersect()).checkIntersectLineWithLine(
                    new Line(from.getPointStart().position, from.getPointEnd().position),
                    new Line(to.getPointStart().position, to.getPointEnd().position),
                ).intersectPointList
                if (intersectPointList.length > 0) {
                    intersectPairList.push({
                        first: from,
                        second: to,
                        point: intersectPointList[0]
                    })
                }
            }
        }

        intersectPairList.forEach((intersectPair) => {
            this.splitIntersectLines(intersectPair)
        })

        this.clearEqualLink()

        // alert(intersectPairList.length)
        return intersectPairList.length > 0
    }

    splitIntersectLines(intersectPair: IntersectLinePair) {
        let firstStart = intersectPair.first.getPointStart()
        let firstEnd = intersectPair.first.getPointEnd()

        let secondStart = intersectPair.second.getPointStart()
        let secondEnd = intersectPair.second.getPointEnd()

        let intersectPoint = Point
            .create(intersectPair.point, new Vector(), new Vector())
            .setSize(5 * Math.round(Math.random() * 3) + 5)

        this.pointList.push(intersectPoint)

        let sizeMultiplier = -0.5

        this.linkList.push(
            (new Link(firstStart, intersectPoint))
                .setSize((intersectPoint.getSize() * 0 - intersectPair.first.getCurrentSize()) * sizeMultiplier)
        )
        this.linkList.push(
            (new Link(firstEnd, intersectPoint))
                .setSize((intersectPoint.getSize() * 0 - intersectPair.first.getCurrentSize()) * sizeMultiplier)
        )
        this.linkList.push(
            (new Link(secondStart, intersectPoint))
                .setSize((intersectPoint.getSize() * 0 - intersectPair.second.getCurrentSize()) * sizeMultiplier)
        )
        this.linkList.push(
            (new Link(secondEnd, intersectPoint))
                .setSize((intersectPoint.getSize() *0 - intersectPair.second.getCurrentSize()) * sizeMultiplier)
        )

        this.linkList = this.linkList.filter((link) => {
            return link != intersectPair.first.remove() && link != intersectPair.second.remove()
        })
    }

    clearEqualLink() {
        let linkForDelete = []
        for (let i = 0; i < this.linkList.length; i += 1) {
            for (let j = i+1; j < this.linkList.length; j++) {
                let from = this.linkList[i], to = this.linkList[j]
                if (
                    from instanceof Link && to instanceof Link &&
                    from.getPointStart() === to.getPointStart() &&
                    from.getPointEnd() === to.getPointEnd()
                ) {
                    delete this.linkList[j]
                }
            }
        }
        this.linkList = this.linkList.filter((link) => {
            return link instanceof Link
        })
    }

    draw() {
        // alert('Высота: ' + this.canvas?.height + '; ширина : ' + this.canvas?.width)
        this.context.clearRect(0, 0, <number>this.canvas?.width, <number>this.canvas?.height)
        this.pointList.forEach((point) => {
            point.draw(this.context)
        })
        this.linkList.forEach((link) => {
            link.draw(this.context)
        })
    }
}

export type IntersectLinePair = {first: Link, second: Link, point: Vector}