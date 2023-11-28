export class Matrix {
	height = 0
	width = 0
	data
	dataStorageType

	constructor(height, width, dataStorageType) {
		this.dataStorageType = dataStorageType
		this.data = new (dataStorageType)(height * width);
		this.height = height
		this.width = width
	}

	get (x, y) {
		return this.data[y * this.width + x]
	}

	set (x, y, value) {
		this.data[y * this.width + x] = value
		return this
	}
}