import {Matrix} from "../matrix/matrix";

export class ImagePixels {
	height = 0
	width = 0
	imageData
	redMatrix
	greenMatrix
	blueMatrix
	alphaMatrix

	static create(height, width) {
		return new ImagePixels(new ImageData(height, width))
	}

	constructor(imageData) {
		if (imageData instanceof ImageData) {
			this.height = imageData.height
			this.width = imageData.width
			this.imageData = imageData

			this.fillMatrixes()
		} else {
			throw new Error('Данные должны быть ImageData!')
		}
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

	fillImageData(context = null) {
		for (let y = 0; y < this.height; y += 1) {
			for (let x = 0; x < this.width; x += 1) {
				this.imageData.data[y * this.width * 4 + x * 4] = this.redMatrix.get(x, y)
				this.imageData.data[y * this.width * 4 + x * 4 + 1] = this.greenMatrix.get(x, y)
				this.imageData.data[y * this.width * 4 + x * 4 + 2] = this.blueMatrix.get(x, y)
				this.imageData.data[y * this.width * 4 + x * 4 + 3] = this.alphaMatrix.get(x, y)
			}
		}
		if (!!context && !!(context.putImageData)) {
			context.putImageData(this.imageData, 0, 0)
		}
	}

	getPixelColor(x, y) {
		return {
			alpha: this.alphaMatrix.get(x, y),
			red: this.redMatrix.get(x, y),
			green: this.greenMatrix.get(x, y),
			blue: this.blueMatrix.get(x, y),
		}
	}

	setPixelColor(x, y, color) {
		this.alphaMatrix.set(x, y, color.alpha)
		this.redMatrix.set(x, y, color.red)
		this.greenMatrix.set(x, y, color.green)
		this.blueMatrix.set(x, y, color.blue)
	}

	increaseSize(times = 1) {
		if (times === 1) {
			return this
		}
		//times = Math.round(times)
		let increaseImage = ImagePixels.create(times * this.height, times * this.width)
		for (let y = 0; y < increaseImage.height; y += 1) {
			for (let x = 0; x < increaseImage.width; x += 1) {
				const oldX = Math.ceil(x / times)
				const oldY = Math.ceil(y / times)
				increaseImage.alphaMatrix.set(x, y, this.alphaMatrix.get(oldX, oldY))
				increaseImage.redMatrix.set(x, y, this.redMatrix.get(oldX, oldY))
				increaseImage.greenMatrix.set(x, y, this.greenMatrix.get(oldX, oldY))
				increaseImage.blueMatrix.set(x, y, this.blueMatrix.get(oldX, oldY))
			}
		}
		increaseImage.fillImageData()
		return increaseImage
	}
}