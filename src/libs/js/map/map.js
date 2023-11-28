import {Matrix} from "../matrix/matrix";

export class Map {
	storage
	height
	width

	constructor(height, width) {
		this.height = height
		this.width = width
		this.storage = new Matrix(height, width, Array)
	}

	evaluate() {
		let nextState = new Matrix(this.height, this.width, Array)
		for (let y = 0; y < this.height; y += 1) {
			for (let x = 0; x < this.width; x += 1) {
				this.storage.get(x, y).forEach((agent) => {
					agent.evaluate(this.storage, nextState)
				})
			}
		}
	}
}