export class Location
{
    protected size: number = 1

    constructor() {
    }

    draw(context: CanvasRenderingContext2D) {

    }

    setSize(size: number) {
        this.size = size
        return this
    }

    getSize() {
        return this.size
    }
}
