export class Matrix {
    protected data: (Array<any> | Uint8ClampedArray)
    protected dataStorageType: new(length: number) => (Array<any> | Uint8ClampedArray)

    constructor(
        public height: number = 0,
        public width: number = 0,
        dataStorageType: new(length: number) => (Array<any> | Uint8ClampedArray)
    ) {
        this.dataStorageType = dataStorageType
        this.data = new (dataStorageType)(height * width);
    }

    get (x: number, y: number) {
        return this.data[y * this.width + x]
    }

    set (x: number, y: number, value: any) {
        this.data[y * this.width + x] = value
        return this
    }
}