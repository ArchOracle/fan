import {Point} from "../location/point";
import {Link} from "../location/link";
import {Vector} from "../tools/math/vector";
import {Intersect} from "../tools/math/intersect";
import {Line} from "../tools/math/primitive/line";
import {Circle} from "../tools/math/primitive/circle";

export class Generator {
    private readonly context: CanvasRenderingContext2D;
    protected pointList: Array<Point> = []
    protected linkList: Array<Link> = []
    protected evaluateProcessed: boolean = false
    protected fixGenerationCount = 0
    protected fixGenerationMax = 55

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
                    new Vector(750 + (Math.random()-0.5) * 375, 500 + (Math.random()-0.5) * 250),
                    new Vector(),
                    new Vector()
                ).setSize(Point.getRandomSize())
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
                )).setSize(Link.getRandomSize())
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
            }, 5)
        } else {
            this.fixGenerate()
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
        // return this.fixIntersectCircle()
        let isIL = this.fixIntersectLink()
        let isPL = this.fixIntersectCircle()

        this.pointList.forEach((point) => {
            if (point.getLinkList().length < 3) {
                this.addRandomLinkForPoint(point)
            }
        })
        return isIL || isPL
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
            // this.splitIntersectLines(intersectPair)
            this.removeIntersectLinks(intersectPair)
        })

        this.clearEqualLink()

        // alert(intersectPairList.length)
        // this.draw()
        return intersectPairList.length > 0
    }

    fixIntersectCircle() {
        let intersectPairList: Array<IntersectCirclePair> = []
        for (let i = 0; i < this.pointList.length; i += 1) {
            for (let j = i + 1; j < this.pointList.length; j++) {
                let from = this.pointList[i], to = this.pointList[j]
                let intersectCircleList = (new Intersect()).checkIntersectCircleWithCircle(
                    new Circle(from.position, from.getSize()),
                    new Circle(to.position, to.getSize()),
                ).intersectCircleList
                if (intersectCircleList.length > 0) {
                    intersectPairList.push({
                        first: from,
                        second: to
                    })
                }
            }
        }

        intersectPairList.forEach((intersectPair) => {
            //this.unionIntersectCircles(intersectPair)
            this.removeIntersectPoints(intersectPair)
        })
        // this.draw()

        return intersectPairList.length > 0
    }

    removeIntersectLinks(intersectPair: IntersectLinePair) {
        let linksForFirstLink = intersectPair.first.getPointStart().getLinkList().length +
            intersectPair.first.getPointEnd().getLinkList().length
        let linksForSecondLink = intersectPair.second.getPointStart().getLinkList().length +
            intersectPair.second.getPointEnd().getLinkList().length
        if (linksForFirstLink < linksForSecondLink) {
            this.removeLinkList([intersectPair.first])
        } else {
            this.removeLinkList([intersectPair.second])
        }
    }

    removeIntersectPoints(intersectPair: IntersectCirclePair) {
        let removedPoint: Point, livePoint: Point
        if (intersectPair.first.getLinkList().length < intersectPair.second.getLinkList().length) {
            removedPoint = intersectPair.first
            livePoint = intersectPair.second
        } else {
            removedPoint = intersectPair.second
            livePoint = intersectPair.first
        }
        for (let j = 0; j < removedPoint.getLinkList().length; j += 1) {
            this.addRandomLinkForPoint(livePoint)
        }
        this.removePoint(removedPoint)
        this.pointList.forEach((point) => {
            if (point.getLinkList().length < 2) {
                this.addRandomLinkForPoint(point)
            }
        })
    }

    addRandomLinkForPoint(point: Point) {
        let i = Math.round(Math.random() * (this.pointList.length - 1))
        i = i < (this.pointList.length - 1) ? i : i - 1
        let newPoint = this.pointList[i]
        newPoint = newPoint === point ? this.pointList[i + 1] : newPoint
        let newLink = (new Link(point, newPoint)).setSize(Link.getRandomSize())
        this.linkList.push(newLink)
        point.addLink(newLink)
        newPoint.addLink(newLink)
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

        let sizeMultiplier = Math.random()

        let sizeNewLink = (intersectPoint.getSize() * 0 + intersectPair.first.getCurrentSize()) * sizeMultiplier
        let minSizeLink = 100
        sizeNewLink = sizeNewLink > minSizeLink ? sizeNewLink : minSizeLink
        this.linkList.push(
            (new Link(firstStart, intersectPoint))
                .setSize(sizeNewLink)
        )
        sizeNewLink = (intersectPoint.getSize() * 0 + intersectPair.first.getCurrentSize()) * (1- sizeMultiplier)
        sizeNewLink = sizeNewLink > minSizeLink ? sizeNewLink : minSizeLink
        this.linkList.push(
            (new Link(firstEnd, intersectPoint))
                .setSize(sizeNewLink)
        )
        sizeNewLink = (intersectPoint.getSize() * 0 + intersectPair.second.getCurrentSize()) * sizeMultiplier
        sizeNewLink = sizeNewLink > minSizeLink ? sizeNewLink : minSizeLink
        this.linkList.push(
            (new Link(secondStart, intersectPoint))
                .setSize(sizeNewLink)
        )
        sizeNewLink = (intersectPoint.getSize() *0 + intersectPair.second.getCurrentSize()) * (1 - sizeMultiplier)
        sizeNewLink = sizeNewLink > minSizeLink ? sizeNewLink : minSizeLink
        this.linkList.push(
            (new Link(secondEnd, intersectPoint))
                .setSize(sizeNewLink)
        )

        this.linkList = this.linkList.filter((link) => {
            return link != intersectPair.first.remove() && link != intersectPair.second.remove()
        })
    }

    unionIntersectCircles(intersectCircles: IntersectCirclePair) {
        let from: Circle = new Circle(intersectCircles.first.position, intersectCircles.first.getSize()),
            to: Circle = new Circle(intersectCircles.second.position, intersectCircles.second.getSize())

        let newCenter = from.center.copy().add(to.center.copy()).multipleOnScalar(0.5),
            newSize = from.size + to.size

        let newPoint = Point.create(newCenter, new Vector(), new Vector()).setSize(newSize/2)

        intersectCircles.first.getLinkList().forEach((link) => {
            this.changePointInLink(link, intersectCircles.first, newPoint)
        })

        intersectCircles.second.getLinkList().forEach((link) => {
            this.changePointInLink(link, intersectCircles.second, newPoint)
        })

        this.removePoint(intersectCircles.first)
        this.removePoint(intersectCircles.second)

        this.pointList.push(newPoint)

        this.clearEqualLink()

    }

    changePointInLink(link: Link, oldPoint: Point, newPoint: Point) {
        if (link.getPointStart() === oldPoint) {
            link.setPointStart(newPoint)
            oldPoint.removeLink(link)
        }
        if (link.getPointEnd() === oldPoint) {
            link.setPointEnd(newPoint)
            oldPoint.removeLink(link)
        }
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

    removePoint(removingPoint: Point) {
        this.removeLinkList(removingPoint.getLinkList())
        this.pointList = this.pointList.filter((point) => {
            return point != removingPoint
        })
    }

    removeLinkList(removingLinkList: Array<Link>) {
        removingLinkList.forEach((removingLink) => {
            this.linkList = this.linkList.filter((link) => {
                return link != removingLink.remove()
            })
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
export type IntersectCirclePair = {first: Point, second: Point}