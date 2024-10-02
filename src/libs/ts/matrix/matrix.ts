export class Matrix {
    height: number = 0
    width: number = 0
    data: Array<any>
    dataStorageType: new(length: number) => Array<any>

    constructor(height: number, width: number, dataStorageType: new(length: number) => Array<any>) {
        this.dataStorageType = dataStorageType
        this.data = new (dataStorageType)(height * width);
        this.height = height
        this.width = width
    }

    get (x: number, y: number) {
        return this.data[y * this.width + x]
    }

    set (x: number, y: number, value: any) {
        this.data[y * this.width + x] = value
        return this
    }
}