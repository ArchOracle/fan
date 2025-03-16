export class Vector {
    constructor(public x: number = 0, public y: number = 0) {
    }

    add(addition: Vector) {
        this.x += addition.x
        this.y += addition.y
        return this
    }

    sub(sub: Vector) {
        this.x -= sub.x
        this.y -= sub.y
        return this
    }

    multipleOnScalar(scalar: number) {
        this.x *= scalar
        this.y *= scalar
        return this
    }

    getLength() {
        return Math.sqrt(
            (this.x)**2 +
            (this.y)**2
        )
    }
}