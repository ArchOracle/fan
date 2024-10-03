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

    setAlpha(alpha: number) {
        this.alpha = alpha
        return this
    }

    setRed(red: number) {
        this.red = red
        return this
    }

    setGreen(green: number) {
        this.green = green
        return this
    }

    setBlue(blue: number) {
        this.blue = blue
        return this
    }
}