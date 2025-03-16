import {Generator} from "./lib/generate/generator";

export class Index {
    public generator: Generator

    constructor() {
        this.generator = new Generator(
            15,
            17,
            document.querySelector('canvas#map')
        )
    }

    start() {
        document.addEventListener('DOMContentLoaded', () => {
            document.querySelector('button#generate')?.addEventListener('click', (event) => {
                this.generator.pointCount = <number><unknown>(<HTMLInputElement>document.getElementById('point_count')).value
                this.generator.linkCount = <number><unknown>(<HTMLInputElement>document.getElementById('link_count')).value
                this.generator.generate()
                this.generator.draw()
                // alert(document.querySelector('canvas')?.height)
            })
            document.querySelector('button#evaluate')?.addEventListener('click', (event) => {
                this.generator.evaluate()
                this.generator.draw()
                // alert(document.querySelector('canvas')?.height)
            })
        })
    }
}