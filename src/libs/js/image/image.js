import {Matrix} from "../matrix/matrix";

export class ImagePixels {
	height = 0
	width = 0
	imageData
	redMatrix
	greenMatrix
	blueMatrix
	alphaMatrix

	constructor(height, width, imageData) {
		this.height = height
		this.width = width
		this.imageData = imageData
	}

	fillMatrixes() {
		this.redMatrix = new Matrix(this.height, this.width, Uint8ClampedArray)
		this.greenMatrix = new Matrix(this.height, this.width, Uint8ClampedArray)
		this.blueMatrix = new Matrix(this.height, this.width, Uint8ClampedArray)
		this.alphaMatrix = new Matrix(this.height, this.width, Uint8ClampedArray)

		for (let y = 0; y < this.height; y += 1) {
			for (let x = 0; x < this.width; x += 1) {
				this.redMatrix.set(x, y, this.imageData.data[y * this.width * 4 + x * 4])
				this.greenMatrix.set(x, y, this.imageData.data[y * this.width * 4 + x * 4 + 1])
				this.blueMatrix.set(x, y, this.imageData.data[y * this.width * 4 + x * 4 + 2])
				this.alphaMatrix.set(x, y, this.imageData.data[y * this.width * 4 + x * 4 + 3])
			}
		}
	}
}