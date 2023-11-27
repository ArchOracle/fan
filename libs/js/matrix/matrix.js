class Matrix {
	height = 0
	width = 0
	data = []

	constructor(height, width, data) {
		this.data = data;
		this.height = height
		this.width = width
	}

	get (x, y) {
		return this.data[x * this.width + y]
	}

	set (x, y, value) {
		this.data[x * this.width + y] = value
		return this
	}
}