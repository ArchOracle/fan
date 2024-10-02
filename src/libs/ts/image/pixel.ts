export class Pixel {
    constructor(
        protected alpha: number,
        protected red: number,
        protected green: number,
        protected blue: number
    ) {
    }

    getAlpha() {
        return this.alpha
    }

    getRed() {
        return this.red
    }

    getGreen() {
        return this.green
    }

    getBlue() {
        return this.blue
    }
}