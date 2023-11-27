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
}