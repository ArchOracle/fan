import {Point} from "../location/point";
import {Link} from "../location/link";
import {Vector} from "../tools/math/vector";

export class Generator {
    private readonly context: CanvasRenderingContext2D;
    protected pointList: Array<Point> = []
    protected linkList: Array<Link> = []
    protected evaluateProcessed: boolean = false

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

    checkNeedFixGeneration() {

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