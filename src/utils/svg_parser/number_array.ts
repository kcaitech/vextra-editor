export class NumberArray { // 任意维数的Number数组
    dimension: number // 维数
    dimensionLength: number[] // 各维度的长度
    data: number[]

    // skipFillValueCheck: 跳过填充值检查，用于在填充值为数组时不检查数组的元素类型
    constructor(dimensionLength: number[], fillValue: number | number[] = 0, skipFillValueCheck = false) {
        if (dimensionLength.findIndex(item => item < 0) !== -1) throw new Error("维数不能为负数");
        this.dimension = dimensionLength.length
        this.dimensionLength = dimensionLength
        const length = dimensionLength.reduce((a, b) => a * b, 1)
        const isFillValueArray = Array.isArray(fillValue)
        if (isFillValueArray) {
            if (fillValue.length !== length) throw new Error("填充数组长度不匹配");
            if (!skipFillValueCheck && fillValue.findIndex(item => typeof item !== "number") !== -1) throw new Error("填充数组元素类型不匹配");
            this.data = fillValue
        } else {
            if (typeof fillValue !== "number") throw new Error("填充值类型不匹配");
            this.data = new Array(length).fill(fillValue)
        }
    }

    getIndex(indexes: number[]): number {
        if (indexes.length !== this.dimension) throw new Error("维数不匹配");
        let i = 0
        for (let j = 0; j < indexes.length; j++) {
            const index = indexes[j]
            if (index < 0 || index >= this.dimensionLength[j]) throw new Error("索引越界");
            i = i * this.dimensionLength[j] + index
        }
        return i
    }

    get(indexes: number[]): number {
        return this.data[this.getIndex(indexes)]
    }

    set(indexes: number[], value: number) {
        this.data[this.getIndex(indexes)] = value
    }

    clone() {
        const array = new NumberArray(this.dimensionLength)
        array.data = this.data.slice()
        return array
    }

    resize(dimensionLength: number[], fillValue: number = 0) { // 重新设置维数和维度长度，复用底层原数据
        if (dimensionLength.findIndex(item => item < 0) !== -1) throw new Error("维数不能为负数");
        const length = dimensionLength.reduce((a, b) => a * b, 1)
        if (length < this.data.length) this.data = this.data.slice(0, length);
        else if (length > this.data.length) this.data = this.data.concat(new Array(length - this.data.length).fill(fillValue));
        this.dimension = dimensionLength.length
        this.dimensionLength = dimensionLength
        return this
    }

    _toString(indexes: number[]): string { // 从索引位置开始，将剩余维度的数组转换为字符串
        if (indexes.length > this.dimension) throw new Error("维数不匹配");
        if (indexes.length === this.dimension) return this.get(indexes).toString();
        let indent = "\n"
        if (indexes.length > 0) indent += " ".repeat(indexes.length * 2);
        return (indexes.length === 0 ? "" : indent) + "[" // 首行不换行
            + Array.from({length: this.dimensionLength[indexes.length]}, (_, i) => this._toString([...indexes, i]))
                .join("," + (indexes.length === this.dimension - 1 ? " " : "")) // 最后一维的元素分隔符额外加一个空格
            + (indexes.length === this.dimension - 1 ? "" : ",") // 除最后一维外，每个维度所有元素的末尾加一个逗号
            + (indexes.length === this.dimension - 1 ? "" : indent) + "]" // 除最后一维外，每个维度所有元素末尾的']'前要加换行缩进
    }

    toString() {
        return this._toString([])
    }
}

export class NumberArray2D extends NumberArray { // 二维Number数组
    constructor(dimensionLength: [number, number], fillValue: number | number[] = 0, skipFillValueCheck = false) {
        if (dimensionLength.length !== 2) throw new Error("必须为2维");
        super(dimensionLength, fillValue, skipFillValueCheck)
    }

    clone() {
        const newObj = super.clone()
        return new NumberArray2D(newObj.dimensionLength as [number, number], newObj.data, true)
    }

    getIndex(indexes: number[]): number {
        if (indexes.length !== 2) throw new Error("维数不匹配");
        return indexes[0] * this.dimensionLength[1] + indexes[1]
    }

    static FromNumberArray(numberArray: NumberArray) {
        if (numberArray instanceof NumberArray2D) return numberArray;
        if (numberArray.dimension !== 2) throw new Error("numberArray必须是二维数组");
        return new NumberArray2D(numberArray.dimensionLength as [number, number], numberArray.data, true)
    }

    rows(m0: number, m1?: number) { // 获取NumberArray中的第m0行到第m1行（包含第m1行）
        if (this.dimension !== 2) throw new Error("data必须是二维数组");
        const [m, n] = this.dimensionLength
        if (m1 === undefined) m1 = m;
        if (m0 < 0 || m1 < 0 || m0 >= m || m1 >= m) throw new Error("行索引越界");
        return this.data.slice(m0 * n, (m1 + 1) * n)
    }

    row(m: number) { // 获取NumberArray中的第m行
        return this.rows(m, m)
    }

    cols(n0: number, n1?: number) { // 获取NumberArray中的第n0列到第n1列（包含第n1列）
        if (this.dimension !== 2) throw new Error("data必须是二维数组");
        const [m, n] = this.dimensionLength
        if (n1 === undefined) n1 = n;
        if (n0 < 0 || n1 < 0 || n0 >= n || n1 >= n) throw new Error("列索引越界");
        const result = []
        for (let i = n0; i < n1 + 1; i++) for (let j = 0; j < m; j++) result.push(this.get([j, i]));
        return result
    }

    col(n: number) { // 获取NumberArray中的第n列
        return this.cols(n, n)
    }

    insertRows(rowsData: number[] | NumberArray, row?: number, skipFillValueCheck = false) { // 往NumberArray中插入多行
        if (this.dimension !== 2) throw new Error("data必须是二维数组");
        if (rowsData instanceof NumberArray) rowsData = rowsData.data;
        if (rowsData.length % this.dimensionLength[1] !== 0) throw new Error("行数据长度不匹配");
        if (row === undefined) row = this.dimensionLength[0];
        if (row < 0 || row > this.dimensionLength[0]) throw new Error("行索引越界");
        if (!skipFillValueCheck && rowsData.findIndex(item => typeof item !== "number") !== -1) throw new Error("填充数组元素类型不匹配");
        this.data.splice(row * this.dimensionLength[1], 0, ...rowsData)
        this.dimensionLength[0] += rowsData.length / this.dimensionLength[1]
        return this
    }

    insertCols(colsData: number[] | NumberArray, col?: number, skipFillValueCheck = false) { // 往NumberArray中插入多列
        if (this.dimension !== 2) throw new Error("data必须是二维数组");
        const [m, n] = this.dimensionLength
        if (colsData instanceof NumberArray) colsData = colsData.data;
        if (colsData.length % m !== 0) throw new Error("列数据长度不匹配");
        if (col === undefined) col = n;
        if (col < 0 || col > n) throw new Error("列索引越界");
        if (!skipFillValueCheck && colsData.findIndex(item => typeof item !== "number") !== -1) throw new Error("填充数组元素类型不匹配");
        for (let i = colsData.length - 1; i > 0; i--) {
            for (let j = 0; j < m; j++) {
                this.data.splice(j * n + col, 0, colsData[i * m + j])
            }
        }
        this.dimensionLength[1] += colsData.length / this.dimensionLength[0]
        return this
    }

    deleteRows(row: number, count = 1) { // 删除NumberArray的多行
        if (this.dimension !== 2) throw new Error("data必须是二维数组");
        if (row < 0 || row + count > this.dimensionLength[0]) throw new Error("行索引越界");
        this.data.splice(row * this.dimensionLength[1], count * this.dimensionLength[1])
        this.dimensionLength[0] -= count
        return this
    }

    deleteCols(col: number, count = 1) { // 删除NumberArray的多列
        if (this.dimension !== 2) throw new Error("data必须是二维数组");
        const [m, n] = this.dimensionLength
        if (col < 0 || col + count > n) throw new Error("列索引越界");
        for (let i = m - 1; i > 0; i--) {
            this.data.splice(i * n + col, count)
        }
        this.dimensionLength[1] -= count
        return this
    }

    get m00() {
        return this.get([0, 0])
    }

    set m00(value) {
        this.set([0, 0], value)
    }

    get m01() {
        return this.get([0, 1])
    }

    set m01(value) {
        this.set([0, 1], value)
    }

    get m02() {
        return this.get([0, 2])
    }

    set m02(value) {
        this.set([0, 2], value)
    }

    get m03() {
        return this.get([0, 3])
    }

    set m03(value) {
        this.set([0, 3], value)
    }

    get m10() {
        return this.get([1, 0])
    }

    set m10(value) {
        this.set([1, 0], value)
    }

    get m11() {
        return this.get([1, 1])
    }

    set m11(value) {
        this.set([1, 1], value)
    }

    get m12() {
        return this.get([1, 2])
    }

    set m12(value) {
        this.set([1, 2], value)
    }

    get m13() {
        return this.get([1, 3])
    }

    set m13(value) {
        this.set([1, 3], value)
    }

    get m20() {
        return this.get([2, 0])
    }

    set m20(value) {
        this.set([2, 0], value)
    }

    get m21() {
        return this.get([2, 1])
    }

    set m21(value) {
        this.set([2, 1], value)
    }

    get m22() {
        return this.get([2, 2])
    }

    set m22(value) {
        this.set([2, 2], value)
    }

    get m23() {
        return this.get([2, 3])
    }

    set m23(value) {
        this.set([2, 3], value)
    }

    get m30() {
        return this.get([3, 0])
    }

    set m30(value) {
        this.set([3, 0], value)
    }

    get m31() {
        return this.get([3, 1])
    }

    set m31(value) {
        this.set([3, 1], value)
    }

    get m32() {
        return this.get([3, 2])
    }

    set m32(value) {
        this.set([3, 2], value)
    }

    get m33() {
        return this.get([3, 3])
    }

    set m33(value) {
        this.set([3, 3], value)
    }

}
