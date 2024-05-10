import {NumberArray2D} from "./number_array"

export class Matrix { // 矩阵
    data: NumberArray2D

    constructor(data: NumberArray2D) {
        if (data.dimension !== 2) throw new Error("data必须是二维数组");
        this.data = data
    }

    static Build(m: number, n: number, fillValue?: number) { // 构建m*n的矩阵
        return new Matrix(new NumberArray2D([m, n], fillValue))
    }

    static BuildIdentity(m: number, n?: number) { // // 构建m*n矩阵，n默认为m，主元为1，其余元素为0
        return new Matrix(NumberArray2D.BuildIdentity(m, n))
    }

    get(indexes: number[]): number {
        return this.data.get(indexes)
    }

    set(indexes: number[], value: number) {
        this.data.set(indexes, value)
    }

    clone() {
        return new Matrix(this.data.clone())
    }

    get rawData() {
        return this.data.data
    }

    get m00() {
        return this.data.m00
    }

    set m00(value: number) {
        this.data.m00 = value
    }

    get m01() {
        return this.data.m01
    }

    set m01(value: number) {
        this.data.m01 = value
    }

    get m02() {
        return this.data.m02
    }

    set m02(value: number) {
        this.data.m02 = value
    }

    get m03() {
        return this.data.m03
    }

    set m03(value: number) {
        this.data.m03 = value
    }

    get m10() {
        return this.data.m10
    }

    set m10(value: number) {
        this.data.m10 = value
    }

    get m11() {
        return this.data.m11
    }

    set m11(value: number) {
        this.data.m11 = value
    }

    get m12() {
        return this.data.m12
    }

    set m12(value: number) {
        this.data.m12 = value
    }

    get m13() {
        return this.data.m13
    }

    set m13(value: number) {
        this.data.m13 = value
    }

    get m20() {
        return this.data.m20
    }

    set m20(value: number) {
        this.data.m20 = value
    }

    get m21() {
        return this.data.m21
    }

    set m21(value: number) {
        this.data.m21 = value
    }

    get m22() {
        return this.data.m22
    }

    set m22(value: number) {
        this.data.m22 = value
    }

    get m23() {
        return this.data.m23
    }

    set m23(value: number) {
        this.data.m23 = value
    }

    get m30() {
        return this.data.m30
    }

    set m30(value: number) {
        this.data.m30 = value
    }

    get m31() {
        return this.data.m31
    }

    set m31(value: number) {
        this.data.m31 = value
    }

    get m32() {
        return this.data.m32
    }

    set m32(value: number) {
        this.data.m32 = value
    }

    get m33() {
        return this.data.m33
    }

    set m33(value: number) {
        this.data.m33 = value
    }

    get size() { // 矩阵的大小
        return [...this.data.sizeForDimension]
    }

    get isSquare() { // 判断是否为方阵
        return this.data.sizeForDimension[0] === this.data.sizeForDimension[1]
    }

    get isIdentity() { // 判断是否为单位矩阵
        const [m, n] = this.size
        if (m !== n) return false;
        for (let i = 0; i < m; i++) for (let j = 0; j < n; j++) if (this.get([i, j]) !== (i === j ? 1 : 0)) return false;
        return true
    }

    get isDiagonal() { // 判断是否为对角矩阵
        const [m, n] = this.size
        if (m !== n) return false;
        for (let i = 0; i < m; i++) for (let j = 0; j < n; j++) if (i !== j && this.get([i, j]) !== 0) return false;
        return true
    }

    get isSymmetric() { // 判断是否为对称矩阵
        const [m, n] = this.size
        if (m !== n) return false;
        for (let i = 0; i < m; i++) for (let j = i + 1; j < m; j++) if (this.get([i, j]) !== this.get([j, i])) return false;
        return true
    }

    get isUpperTriangular() { // 判断是否为上三角矩阵
        const [m, n] = this.size
        if (m !== n) return false;
        for (let i = 0; i < m; i++) for (let j = 0; j < i; j++) if (this.get([i, j]) !== 0) return false;
        return true
    }

    get isLowerTriangular() { // 判断是否为下三角矩阵
        const [m, n] = this.size
        if (m !== n) return false;
        for (let i = 0; i < m; i++) for (let j = i + 1; j < n; j++) if (this.get([i, j]) !== 0) return false;
        return true
    }

    resize(m?: number, n?: number, fillValue: number = 0) { // 调整矩阵的大小
        const [m0, n0] = this.size
        if (m === undefined) m = m0;
        if (n === undefined) n = n0;

        if (m0 > m) this.data.deleteRows(m, m0 - m);
        else if (m0 < m) this.data.insertRows(new NumberArray2D([m - m0, n], fillValue), m0, true);

        if (n0 > n) this.data.deleteCols(n, n0 - n);
        else if (n0 < n) this.data.insertCols(new NumberArray2D([m, n - n0], fillValue), n0, true);

        return this
    }

    forEach(callback: (value: number, row: number, column: number) => void) { // 遍历（横向优先）
        const [m, n] = this.size
        for (let i = 0; i < m; i++) for (let j = 0; j < n; j++) callback(this.get([i, j]), i, j);
    }

    flat() { // 转为一维数组（横向优先）
        return this.data.data.slice()
    }

    static FromCols(vectors: ColVector[]) { // 从列向量构建矩阵
        const n = vectors.length
        const m = vectors[0].size[0]
        const result = new NumberArray2D([m, n])
        for (let i = 0; i < n; i++) {
            const vector = vectors[i]
            if (vector.size[0] !== m) throw new Error("列向量的维度不匹配");
            for (let j = 0; j < m; j++) result.set([j, i], vector.get([j, 0]));
        }
        return new Matrix(result)
    }

    static FromRows(vectors: RowVector[]) { // 从行向量构建矩阵
        const m = vectors.length
        const n = vectors[0].size[1]
        const result = new NumberArray2D([m, n])
        for (let i = 0; i < m; i++) {
            const vector = vectors[i]
            if (vector.size[1] !== n) throw new Error("行向量的维度不匹配");
            for (let j = 0; j < n; j++) result.set([i, j], vector.get([0, j]));
        }
        return new Matrix(result)
    }

    col(n: number) { // 获取第n列列向量
        const [_, n0] = this.size
        if (n < 0 || n >= n0) throw new Error("列数越界");
        return new ColVector(this.data.col(n))
    }

    cols(n0: number, count?: number) { // 从第n0列开始，获取count列
        const [_, n] = this.size
        if (count === undefined) count = n - n0;
        if (n0 < 0 || n0 + count > n) throw new Error("列索引越界");
        if (count < 0) throw new Error("列数范围错误");
        const result: Matrix[] = []
        for (let i = n0; i < n0 + count; i++) result.push(this.col(i));
        return result
    }

    allCol() { // 获取所有列向量
        return this.cols(0)
    }

    toXYZ() { // 列向量转为三维坐标
        const [m, n] = this.size
        if (m < 3 || n < 1) throw new Error(`${m + 1}*${n + 1}矩阵不能转为三维坐标`);
        return {x: this.m00, y: this.m10, z: this.m20}
    }

    row(m: number) { // 获取第n行行向量
        if (m < 0 || m >= this.size[0]) throw new Error("行数越界");
        return new RowVector(this.data.row(m))
    }

    rows(m0: number, count?: number) { // 从第m0行开始，获取count行
        const [m, n] = this.size
        if (count === undefined) count = m - m0;
        if (m0 < 0 || m0 + count > m) throw new Error("行索引越界");
        if (count < 0) throw new Error("行数范围错误");
        const result: Matrix[] = []
        for (let i = m0; i < m0 + count; i++) result.push(this.row(i));
        return result
    }

    allRow() { // 获取所有行向量
        return this.rows(0)
    }

    subMatrix(start: [number, number], dimension: [number, number]) { // 获取子矩阵
        const startRow = start[0]
        const startCol = start[1]
        const [m0, n0] = this.size
        const [m1, n1] = dimension
        if (m1 < 0 || n1 < 0) throw new Error("子矩阵大小不能为负");
        if (startRow < 0 || startCol < 0 || startRow + m1 > m0 || startCol + n1 > n0) throw new Error("子矩阵范围越界");

        const result = new NumberArray2D(dimension)
        for (let i = 0; i < m1; i++) for (let j = 0; j < n1; j++) result.set([i, j], this.get([i + startRow, j + startCol]));
        return new Matrix(result)
    }

    setSubMatrix(start: [number, number], matrix: Matrix) { // 设置子矩阵
        const startRow = start[0]
        const startCol = start[1]
        const [m0, n0] = this.size
        const [m1, n1] = matrix.size
        if (startRow < 0 || startCol < 0 || startRow + m1 > m0 || startCol + n1 > n0) throw new Error("子矩阵范围越界");
        for (let i = 0; i < m1; i++) for (let j = 0; j < n1; j++) this.set([i + startRow, j + startCol], matrix.get([i, j]));
        return this
    }

    get col0(): ColVector {
        return this.col(0)
    }

    set col0(value: ColVector | number[]) {
        if (!(value instanceof ColVector)) value = new ColVector(value);
        this.setSubMatrix([0, 0], value)
    }

    get col1(): ColVector {
        return this.col(1)
    }

    set col1(value: ColVector | number[]) {
        if (!(value instanceof ColVector)) value = new ColVector(value);
        this.setSubMatrix([0, 1], value)
    }

    get col2(): ColVector {
        return this.col(2)
    }

    set col2(value: ColVector | number[]) {
        if (!(value instanceof ColVector)) value = new ColVector(value);
        this.setSubMatrix([0, 2], value)
    }

    get col3(): ColVector {
        return this.col(3)
    }

    set col3(value: ColVector | number[]) {
        if (!(value instanceof ColVector)) value = new ColVector(value);
        this.setSubMatrix([0, 3], value)
    }

    get row0(): ColVector {
        return this.row(0)
    }

    set row0(value: RowVector | number[]) {
        if (!(value instanceof RowVector)) value = new RowVector(value);
        this.setSubMatrix([0, 0], value)
    }

    get row1(): ColVector {
        return this.row(1)
    }

    set row1(value: RowVector | number[]) {
        if (!(value instanceof RowVector)) value = new RowVector(value);
        this.setSubMatrix([1, 0], value)
    }

    get row2(): ColVector {
        return this.row(2)
    }

    set row2(value: RowVector | number[]) {
        if (!(value instanceof RowVector)) value = new RowVector(value);
        this.setSubMatrix([2, 0], value)
    }

    get row3(): ColVector {
        return this.row(3)
    }

    set row3(value: RowVector | number[]) {
        if (!(value instanceof RowVector)) value = new RowVector(value);
        this.setSubMatrix([3, 0], value)
    }

    insertCols(colsData: number[] | NumberArray2D, col?: number, skipFillValueCheck = false) { // 插入多列
        this.data.insertCols(colsData, col, skipFillValueCheck)
        return this
    }

    insertRows(rowsData: number[] | NumberArray2D, row?: number, skipFillValueCheck = false) { // 插入多行
        this.data.insertRows(rowsData, row, skipFillValueCheck)
        return this
    }

    transpose() { // 转置
        const [m, n] = this.size
        for (let i = 0; i < m; i++) {
            for (let j = i + 1; j < n; j++) {
                const temp = this.get([i, j])
                this.set([i, j], this.get([j, i]))
                this.set([j, i], temp)
            }
        }
        return this
    }

    transposeSubMatrix(start: [number, number], dimension: number) { // 子矩阵转置
        const startRow = start[0]
        const startCol = start[1]
        const [m0, n0] = this.size
        const m1 = dimension, n1 = dimension
        if (m1 < 0) throw new Error("子矩阵大小不能为负");
        if (startRow < 0 || startCol < 0 || startRow + m1 > m0 || startCol + n1 > n0) throw new Error("子矩阵范围越界");
        for (let i = 0; i < m1; i++) for (let j = i + 1; j < n1; j++) {
            const temp = this.get([i + startRow, j + startCol])
            this.set([i + startRow, j + startCol], this.get([j + startRow, i + startCol]))
            this.set([j + startRow, i + startCol], temp)
        }
        return this
    }

    add(matrix: Matrix, row: number = 0, column: number = 0) { // 矩阵相加，将本矩阵的特定区域与matrix相加
        const [m0, n0] = this.size
        const [m1, n1] = matrix.size
        if (row + m1 > m0 || column + n1 > n0) throw new Error("矩阵阶数不匹配，无法相加");
        for (let i = 0; i < m1; i++) for (let j = 0; j < n1; j++) this.set([row + i, column + j], this.get([row + i, column + j]) + matrix.get([i, j]));
        return this
    }

    subtract(matrix: Matrix, row: number = 0, column: number = 0) { // 矩阵相减，将本矩阵的特定区域与matrix相减
        const [m0, n0] = this.size
        const [m1, n1] = matrix.size
        if (row + m1 > m0 || column + n1 > n0) throw new Error("矩阵阶数不匹配，无法相减");
        for (let i = 0; i < m1; i++) for (let j = 0; j < n1; j++) this.set([row + i, column + j], this.get([row + i, column + j]) - matrix.get([i, j]));
        return this
    }

    multiplyByNumber(number: number) { // 矩阵数乘
        const [m, n] = this.size
        for (let i = 0; i < m; i++) for (let j = 0; j < n; j++) this.set([i, j], this.get([i, j]) * number);
        return this
    }

    multiplyByNumberSubMatrix(start: [number, number], dimension: [number, number], number: number) { // 子矩阵数乘
        const startRow = start[0]
        const startCol = start[1]
        const [m0, n0] = this.size
        const [m1, n1] = dimension
        if (m1 < 0 || n1 < 0) throw new Error("子矩阵大小不能为负");
        if (startRow < 0 || startCol < 0 || startRow + m1 > m0 || startCol + n1 > n0) throw new Error("子矩阵范围越界");
        for (let i = 0; i < m1; i++) for (let j = 0; j < n1; j++) this.set([i + startRow, j + startCol], this.get([i + startRow, j + startCol]) * number);
        return this
    }

    _getMultiply(matrix: Matrix) {
        const [m0, n0] = this.size
        const [m1, n1] = matrix.size
        if (n0 !== m1) throw new Error("矩阵阶数不匹配，无法相乘");

        const result = new NumberArray2D([m0, n1])
        for (let i = 0; i < m0; i++) {
            for (let j = 0; j < n1; j++) {
                let sum = 0
                for (let k = 0; k < n0; k++) {
                    sum += this.get([i, k]) * matrix.get([k, j])
                }
                result.set([i, j], sum)
            }
        }
        return result
    }

    getMultiply(matrix: Matrix) { // 矩阵相乘，右乘matrix，不修改原矩阵，返回新矩阵
        return new Matrix(this._getMultiply(matrix))
    }

    getMultiplySubMatrix(start: [number, number], dimension: [number, number], matrix: Matrix) { // 子矩阵相乘，右乘matrix，不修改原矩阵，返回新矩阵
        const startRow = start[0]
        const startCol = start[1]
        const [m0, n0] = this.size
        const [m1, n1] = dimension
        const [_, n2] = matrix.size
        if (m1 < 0 || n1 < 0) throw new Error("子矩阵大小不能为负");
        if (startRow < 0 || startCol < 0 || startRow + m1 > m0 || startCol + n1 > n0) throw new Error("子矩阵范围越界");
        if (n2 !== n1) throw new Error("矩阵阶数不匹配，无法相乘");
        return new Matrix(this.subMatrix(start, dimension)._getMultiply(matrix))
    }

    multiply(matrix: Matrix) { // 矩阵相乘，右乘matrix，会修改原矩阵
        this.data = this._getMultiply(matrix)
        return this
    }

    multiplySubMatrix(start: [number, number], dimension: [number, number], matrix: Matrix) { // 子矩阵相乘，右乘matrix，会修改原矩阵
        const startRow = start[0]
        const startCol = start[1]
        const [m0, n0] = this.size
        const [m1, n1] = dimension
        const [_, n2] = matrix.size
        if (m1 < 0 || n1 < 0) throw new Error("子矩阵大小不能为负");
        if (startRow < 0 || startCol < 0 || startRow + m1 > m0 || startCol + n1 > n0) throw new Error("子矩阵范围越界");
        if (n2 !== n1) throw new Error("矩阵阶数不匹配，无法相乘");
        this.setSubMatrix(start, this.subMatrix(start, dimension).multiply(matrix))
        return this
    }

    multiplyRight(matrix: Matrix) { // 矩阵右乘
        return this.multiply(matrix)
    }

    multiplyRightSubMatrix(start: [number, number], dimension: [number, number], matrix: Matrix) { // 子矩阵右乘
        return this.multiplySubMatrix(start, dimension, matrix)
    }

    multiplyLeft(matrix: Matrix) { // 矩阵左乘
        this.data = matrix.clone().multiply(this).data
        return this
    }

    multiplyLeftSubMatrix(start: [number, number], dimension: [number, number], matrix: Matrix) { // 子矩阵左乘
        const startRow = start[0]
        const startCol = start[1]
        const [m0, n0] = this.size
        const [m1, n1] = dimension
        const [m2, _] = matrix.size
        if (m1 < 0 || n1 < 0) throw new Error("子矩阵大小不能为负");
        if (startRow < 0 || startCol < 0 || startRow + m1 > m0 || startCol + n1 > n0) throw new Error("子矩阵范围越界");
        if (m2 !== m1) throw new Error("矩阵阶数不匹配，无法相乘");
        this.setSubMatrix(start, matrix.clone().multiply(this.subMatrix(start, dimension)))
        return this
    }

    getInverse(): Matrix | undefined { // 求逆矩阵（消元法），不修改原矩阵，返回新矩阵
        if (!this.isSquare) throw new Error("矩阵不是方阵，无逆矩阵");

        const m = this.size[0] // 矩阵的阶数
        const result = NumberArray2D.BuildIdentity(m) // 单位矩阵数组
        const data = this.data.clone() // 原矩阵的副本

        for (let i = 0; i < m; i++) {
            if (data.get([i, i]) === 0) { // 行首为0，要进行行交换
                let j = i + 1 // 从下一行开始找到行首不为0的行
                for (; j < m; j++) if (data.get([j, i]) !== 0) break;
                if (j === m) return; // 此列的第i行及以下行全为0，矩阵不可逆
                for (let k = 0; k < m; k++) { // 交换行
                    let temp = data.get([i, k])
                    data.set([i, k], data.get([j, k]))
                    data.set([j, k], temp)
                    temp = result.get([i, k])
                    result.set([i, k], result.get([j, k]))
                }
            }
            const factor = data.get([i, i]) // 主元
            // 第i行除以factor，使主元为1
            if (factor !== 1) {
                data.set([i, i], 1)
                result.set([i, i], result.get([i, i]) / factor)
                for (let j = i + 1; j < m; j++) {
                    data.set([i, j], data.get([i, j]) / factor)
                    result.set([i, j], result.get([i, j]) / factor)
                }
            }
            // 其余行减去对应倍数的第i行，使第i列除了主元外全为0
            for (let j = 0; j < m; j++) {
                if (j === i) continue; // 跳过自身
                const factor = data.get([j, i])
                if (factor === 0) continue; // 本身为0，不需要处理
                data.set([j, i], 0)
                result.set([j, i], -factor)
                for (let k = i + 1; k < m; k++) {
                    data.set([j, k], data.get([j, k]) - data.get([i, k]) * factor)
                    result.set([j, k], result.get([j, k]) - result.get([i, k]) * factor)
                }
            }
        }
        return new Matrix(result)
    }

    negate() { // 取反
        return this.multiplyByNumber(-1)
    }

    getNegate() { // 获取取反后的矩阵，不修改原矩阵，返回新矩阵
        return this.clone().negate()
    }

    rank(): number { // 求矩阵的秩（消元法）
        const [m, n] = this.size // 矩阵的阶数
        const data = this.data.clone() // 原矩阵的副本
        const maxRank = Math.min(m, n) // 秩的最大值
        let rank = 0 // 秩
        for (let i = 0; i < n; i++) { // 遍历列
            // 从第rank行开始，找到第一个非0元素，交换行
            let j = rank
            for (; j < m; j++) if (data.get([j, i]) !== 0) break;
            if (j === m) continue; // 该列全为0
            // 非本行，交换行
            if (j !== rank) for (let k = 0; k < n; k++) {
                const temp = data.get([rank, k])
                data.set([rank, k], data.get([j, k]))
                data.set([j, k], temp)
            }
            // 本行除以data[rank][i]，使主元为1
            const factor = data.get([rank, i])
            if (factor !== 1) {
                data.set([rank, i], 1)
                for (let k = i + 1; k < n; k++) data.set([rank, k], data.get([rank, k]) / factor);
            }
            // 其余行减去对应倍数的第rank行，使第i列除了主元外全为0
            for (let j = 0; j < m; j++) {
                if (j === rank) continue; // 跳过自身
                const factor = data.get([j, i])
                if (factor === 0) continue; // 本身为0，不需要处理
                data.set([j, i], 0)
                for (let k = i + 1; k < n; k++) data.set([j, k], data.get([j, k]) - data.get([rank, k]) * factor);
            }
            if (++rank === maxRank) break; // 秩达到最大值，结束
        }
        return rank
    }

    determinant(): number { // 求矩阵的行列式（递归降阶法）
        if (!this.isSquare) throw new Error("矩阵不是方阵，无行列式");
        const [m, n] = this.size // 矩阵的阶数
        if (m === 1) return this.m00; // 1阶矩阵的行列式
        if (m === 2) return this.m00 * this.m11 - this.m01 * this.m10; // 2阶矩阵的行列式
        let result = 0
        for (let i = 0; i < n; i++) {
            const factor = this.get([0, i]) // 第0行第i列的元素
            if (factor === 0) continue; // 该元素为0，跳过
            const subMatrixData = this.data.clone().deleteRows(0).deleteCols(i) // 去掉第0行和第i列的子矩阵
            const subMatrix = new Matrix(subMatrixData) // 子矩阵
            const subDeterminant = subMatrix.determinant() // 子矩阵的行列式
            result += (i % 2 === 0 ? 1 : -1) * factor * subDeterminant // 递归计算行列式
        }
        return result
    }

    getAdjoint(): Matrix { // 求矩阵的伴随矩阵
        if (!this.isSquare) throw new Error("矩阵不是方阵，无伴随矩阵");
        const [m, n] = this.size // 矩阵的阶数
        const result = new NumberArray2D([m, n])
        for (let i = 0; i < m; i++) {
            for (let j = 0; j < n; j++) {
                const subMatrixData = this.data.clone().deleteRows(i).deleteCols(j) // 去掉第i行第j列的子矩阵
                const subMatrix = new Matrix(subMatrixData) // 子矩阵
                const subDeterminant = subMatrix.determinant() // 子矩阵的行列式
                result.set([i, j], (i + j) % 2 === 0 ? subDeterminant : -subDeterminant) // 伴随矩阵的元素
            }
        }
        return new Matrix(result)
    }

    normalize() { // 将矩阵的每一列化为单位向量
        const [m, n] = this.size
        for (let i = 0; i < n; i++) {
            let sum = 0
            for (let j = 0; j < m; j++) sum += this.get([j, i]) ** 2
            sum = Math.sqrt(sum)
            for (let j = 0; j < m; j++) this.set([i, i], this.get([j, i]) / sum)
        }
        return this
    }

    normalizeRow() { // 将矩阵的每一行化为单位向量
        return this.transpose().normalize().transpose()
    }

    toString() { // 转为字符串
        return this.data.toString()
    }
}

export class Vector extends Matrix { // 向量
    constructor(data: NumberArray2D) {
        super(data)
        if (data.sizeForDimension[0] !== 1 && data.sizeForDimension[1] !== 1) throw new Error("向量的大小必须是n * 1或1 * n");
    }

    static FromMatrix(matrix: Matrix, isCol = true) {
        return new Vector(matrix.data.resize(isCol ? [matrix.data.data.length, 1] : [1, matrix.data.data.length]))
    }

    clone() {
        return new Vector(this.data.clone())
    }

    dot(vector: Vector) { // 点积
        const [m, n] = this.size
        const [m1, n1] = vector.size
        if (m !== m1 || n !== n1) throw new Error("向量维度不匹配");
        let result = 0
        for (let i = 0; i < m; i++) result += this.get([i, 0]) * vector.get([i, 0]);
        return result
    }

    cross(vector: Vector) { // 叉积
        const [m, n] = this.size
        const [m1, n1] = vector.size
        if (m !== m1 || n !== n1) throw new Error("向量维度不匹配");
        const dim = m !== 1 ? m : n
        if (dim !== 2 && dim !== 3) throw new Error("叉积只能用于二维向量或三维向量");
        // 二维向量叉积是标量，三维向量叉积是向量
        const isCol = n === 1
        if (isCol) {
            if (dim === 2) return this.m00 * vector.m10 - vector.m00 * this.m10; // x1 * y2 - x2 * y1
            else return new Vector(new NumberArray2D([3, 1], [
                this.m10 * vector.m20 - vector.m10 * this.m20, // y1 * z2 - y2 * z1
                this.m20 * vector.m00 - vector.m20 * this.m00, // z1 * x2 - z2 * x1
                this.m00 * vector.m10 - vector.m00 * this.m10, // x1 * y2 - x2 * y1
            ], true));
        } else {
            if (dim === 2) return this.m00 * vector.m01 - vector.m00 * this.m01; // x1 * y2 - x2 * y1
            else return new Vector(new NumberArray2D([3, 1], [
                this.m01 * vector.m02 - vector.m01 * this.m02, // y1 * z2 - y2 * z1
                this.m02 * vector.m00 - vector.m02 * this.m00, // z1 * x2 - z2 * x1
                this.m00 * vector.m01 - vector.m00 * this.m01, // x1 * y2 - x2 * y1
            ], true));
        }
    }

    get norm() { // 模
        return Math.sqrt(this.dot(this))
    }
}

export class ColVector extends Vector { // 列向量
    constructor(data: number[] | NumberArray2D) {
        if (!(data instanceof NumberArray2D)) data = new NumberArray2D([data.length, 1], data, true);
        super(data)
        if (data.sizeForDimension[1] !== 1) throw new Error("列向量必须是n * 1的矩阵");
    }

    static FromMatrix(matrix: Matrix) {
        if (matrix instanceof ColVector) return matrix;
        return new ColVector(matrix.data.resize([matrix.data.data.length, 1]))
    }

    clone() {
        return new ColVector(this.data.clone())
    }

    get x() {
        return this.m00
    }

    set x(value: number) {
        this.m00 = value
    }

    get y() {
        return this.m10
    }

    set y(value: number) {
        this.m10 = value
    }

    get z() {
        return this.m20
    }

    set z(value: number) {
        this.m20 = value
    }

    get m0() {
        return this.m00
    }

    set m0(value: number) {
        this.m00 = value
    }

    get m1() {
        return this.m10
    }

    set m1(value: number) {
        this.m10 = value
    }

    get m2() {
        return this.m20
    }

    set m2(value: number) {
        this.m20 = value
    }

    get m3() {
        return this.m30
    }

    set m3(value: number) {
        this.m30 = value
    }
}

export class ColVector2D extends ColVector { // 二维列向量
    constructor(data: number[] | NumberArray2D) {
        super(data)
        if (this.size[0] !== 2) throw new Error("二维列向量必须是2 * 1的矩阵");
    }

    static FromMatrix(matrix: Matrix) {
        if (matrix instanceof ColVector2D) return matrix;
        return new ColVector2D(matrix.data.resize([2, 1]))
    }

    clone() {
        return new ColVector2D(this.data.clone())
    }
}

export class ColVector3D extends ColVector { // 三维列向量
    constructor(data: number[] | NumberArray2D) {
        super(data)
        if (this.size[0] !== 3) throw new Error("三维列向量必须是3 * 1的矩阵");
    }

    static FromMatrix(matrix: Matrix) {
        if (matrix instanceof ColVector3D) return matrix;
        return new ColVector3D(matrix.data.resize([3, 1]))
    }

    clone() {
        return new ColVector3D(this.data.clone())
    }
}

export class ColVector4D extends ColVector { // 四维列向量
    constructor(data: number[] | NumberArray2D) {
        super(data)
        if (this.size[0] !== 4) throw new Error("四维列向量必须是4 * 1的矩阵");
    }

    static FromMatrix(matrix: Matrix) {
        if (matrix instanceof ColVector4D) return matrix;
        return new ColVector4D(matrix.data.resize([4, 1]))
    }

    clone() {
        return new ColVector4D(this.data.clone())
    }
}

export class RowVector extends Vector { // 行向量
    constructor(data: number[] | NumberArray2D) {
        if (!(data instanceof NumberArray2D)) data = new NumberArray2D([1, data.length], data, true);
        super(data)
        if (data.sizeForDimension[0] !== 1) throw new Error("行向量必须是1 * n的矩阵");
    }

    static FromMatrix(matrix: Matrix) {
        if (matrix instanceof RowVector) return matrix;
        return new RowVector(matrix.data.resize([1, matrix.data.data.length]))
    }

    clone() {
        return new RowVector(this.data.clone())
    }

    get x() {
        return this.m00
    }

    set x(value: number) {
        this.m00 = value
    }

    get y() {
        return this.m01
    }

    set y(value: number) {
        this.m01 = value
    }

    get z() {
        return this.m02
    }

    set z(value: number) {
        this.m02 = value
    }

    get m0() {
        return this.m00
    }

    set m0(value: number) {
        this.m00 = value
    }

    get m1() {
        return this.m01
    }

    set m1(value: number) {
        this.m01 = value
    }

    get m2() {
        return this.m02
    }

    set m2(value: number) {
        this.m02 = value
    }

    get m3() {
        return this.m03
    }

    set m3(value) {
        this.m03 = value
    }
}

export class RowVector2D extends RowVector { // 二维行向量
    constructor(data: number[] | NumberArray2D) {
        super(data)
        if (this.size[1] !== 2) throw new Error("二维行向量必须是1 * 2的矩阵");
    }

    static FromMatrix(matrix: Matrix) {
        if (matrix instanceof RowVector2D) return matrix;
        return new RowVector2D(matrix.data.resize([1, 2]))
    }

    clone() {
        return new RowVector2D(this.data.clone())
    }
}

export class RowVector3D extends RowVector { // 三维行向量
    constructor(data: number[] | NumberArray2D) {
        super(data)
        if (this.size[1] !== 3) throw new Error("三维行向量必须是1 * 3的矩阵");
    }

    static FromMatrix(matrix: Matrix) {
        if (matrix instanceof RowVector3D) return matrix;
        return new RowVector3D(matrix.data.resize([1, 3]))
    }

    clone() {
        return new RowVector3D(this.data.clone())
    }
}

export class RowVector4D extends RowVector { // 四维行向量
    constructor(data: number[] | NumberArray2D) {
        super(data)
        if (this.size[1] !== 4) throw new Error("四维行向量必须是1 * 4的矩阵");
    }

    static FromMatrix(matrix: Matrix) {
        if (matrix instanceof RowVector4D) return matrix;
        return new RowVector4D(matrix.data.resize([1, 4]))
    }

    clone() {
        return new RowVector4D(this.data.clone())
    }
}

export class Point extends ColVector { // 点
    constructor(data: number[] | NumberArray2D) {
        super(data)
    }

    static FromMatrix(matrix: Matrix) {
        if (matrix instanceof Point) return matrix;
        return new Point(matrix.data.resize([matrix.data.data.length, 1]))
    }

    clone() {
        return new Point(this.data.clone())
    }
}

export class Point2D extends Point { // 二维点
    constructor(data: number[] | NumberArray2D) {
        super(data)
        if (this.size[0] !== 2) throw new Error("二维点必须是2 * 1的列向量");
    }

    static FromMatrix(matrix: Matrix) {
        if (matrix instanceof Point2D) return matrix;
        return new Point2D(matrix.data.resize([2, 1]))
    }

    clone() {
        return new Point2D(this.data.clone())
    }
}

export class Point3D extends Point { // 三维点
    constructor(data: number[] | NumberArray2D) {
        super(data)
        if (this.size[0] !== 3) throw new Error("三维点必须是3 * 1的列向量");
    }

    static FromMatrix(matrix: Matrix) {
        if (matrix instanceof Point3D) return matrix;
        return new Point3D(matrix.data.resize([3, 1]))
    }

    clone() {
        return new Point3D(this.data.clone())
    }
}
