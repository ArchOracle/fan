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

	}
}