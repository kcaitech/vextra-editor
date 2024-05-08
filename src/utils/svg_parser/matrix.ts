import {NumberArray2D} from "./number_array"

export function buildArray(m: number, n: number, fillValue: number = 0) { // 构建一个n*m的二维数组
    return new NumberArray2D([m, n], fillValue, true)
}

export function buildIdentityArray(m: number, n: number = m) { // 构建m*n数组，n默认为m，主元为1，其余元素为0
    const result = buildArray(m, n, 0)
    const rank = Math.min(m, n)
    for (let i = 0; i < rank; i++) result.set([i, i], 1)
    return result
}

export class Matrix { // 矩阵
    data: NumberArray2D

    constructor(data: NumberArray2D) {
        if (data.dimension !== 2) throw new Error("data必须是二维数组");
        this.data = data
    }

    static build(m: number, n: number, fillValue?: number) { // 构建m*n的矩阵
        return new Matrix(buildArray(m, n, fillValue))
    }

    static buildIdentity(m: number, n: number) { // 构建m*n的单位矩阵
        return new Matrix(buildIdentityArray(m, n))
    }

    clone() {
        return new Matrix(this.data.clone())
    }

    get dimension() { // 矩阵的阶数
        return [...this.data.dimensionLength]
    }

    get isSquare() { // 判断是否为方阵
        return this.data.dimensionLength[0] === this.data.dimensionLength[1]
    }

    get isIdentity() { // 判断是否为单位矩阵
        const [m, n] = this.dimension
        if (m !== n) return false;
        for (let i = 0; i < m; i++) for (let j = 0; j < n; j++) if (this.data.get([i, j]) !== (i === j ? 1 : 0)) return false;
        return true
    }

    get isDiagonal() { // 判断是否为对角矩阵
        const [m, n] = this.dimension
        if (m !== n) return false;
        for (let i = 0; i < m; i++) for (let j = 0; j < n; j++) if (i !== j && this.data.get([i, j]) !== 0) return false;
        return true
    }

    get isSymmetric() { // 判断是否为对称矩阵
        const [m, n] = this.dimension
        if (m !== n) return false;
        for (let i = 0; i < m; i++) for (let j = i + 1; j < m; j++) if (this.data.get([i, j]) !== this.data.get([j, i])) return false;
        return true
    }

    get isUpperTriangular() { // 判断是否为上三角矩阵
        const [m, n] = this.dimension
        if (m !== n) return false;
        for (let i = 0; i < m; i++) for (let j = 0; j < i; j++) if (this.data.get([i, j]) !== 0) return false;
        return true
    }

    get isLowerTriangular() { // 判断是否为下三角矩阵
        const [m, n] = this.dimension
        if (m !== n) return false;
        for (let i = 0; i < m; i++) for (let j = i + 1; j < n; j++) if (this.data.get([i, j]) !== 0) return false;
        return true
    }

    resize(m?: number, n?: number, fillValue: number = 0) { // 调整矩阵的大小
        const [m0, n0] = this.dimension
        if (m === undefined) m = m0;
        if (n === undefined) n = n0;

        if (m0 > m) this.data.deleteRows(m, m0 - m);
        else if (m0 < m) this.data.insertRows(buildArray(m - m0, n, fillValue).data, m0, true);

        if (n0 > n) this.data.deleteCols(n, n0 - n);
        else if (n0 < n) this.data.insertCols(buildArray(m, n - n0, fillValue).data, n0, true);

        return this
    }

    forEach(callback: (value: number, row: number, column: number) => void) { // 遍历（横向优先）
        const [m, n] = this.dimension
        for (let i = 0; i < m; i++) for (let j = 0; j < n; j++) callback(this.data.get([i, j]), i, j);
    }

    flat() { // 转为一维数组（横向优先）
        return this.data.data.slice()
    }

    static ColVec(data: number[]) { // 构建列向量
        return new Matrix(new NumberArray2D([data.length, 1], data, true))
    }

    static RowVec(data: number[]) { // 构建行向量
        return new Matrix(new NumberArray2D([1, data.length], data, true))
    }

    static ColVec3D(x: number, y: number, z: number) { // 构建三维列向量
        return Matrix.ColVec([x, y, z])
    }

    static RowVec3D(x: number, y: number, z: number) { // 构建三维行向量
        return Matrix.RowVec([x, y, z])
    }

    static FromCols(vectors: Matrix[]) { // 从列向量构建矩阵
        const n = vectors.length
        const m = vectors[0].dimension[0]
        const result = buildArray(m, n)
        for (let i = 0; i < n; i++) {
            const vector = vectors[i]
            if (vector.dimension[0] !== m) throw new Error("列向量的维度不匹配");
            for (let j = 0; j < m; j++) result.set([j, i], vector.data.get([j, 0]));
        }
        return new Matrix(result)
    }

    static FromRows(vectors: Matrix[]) { // 从行向量构建矩阵
        const m = vectors.length
        const n = vectors[0].dimension[1]
        const result = buildArray(m, n)
        for (let i = 0; i < m; i++) {
            const vector = vectors[i]
            if (vector.dimension[1] !== n) throw new Error("行向量的维度不匹配");
            for (let j = 0; j < n; j++) result.set([i, j], vector.data.get([0, j]));
        }
        return new Matrix(result)
    }

    col(n: number) { // 获取第n列列向量
        const [_, n0] = this.dimension
        if (n < 0 || n >= n0) throw new Error("列数越界");
        return Matrix.ColVec(this.data.col(n))
    }

    cols(n0: number, n1?: number) { // 获取第n0列到第n1列的列向量（包含第n1列）
        const [_, n] = this.dimension
        if (n1 === undefined) n1 = n;
        if (n0 < 0 || n1 < 0 || n0 >= n || n1 >= n) throw new Error("列数越界");
        if (n0 > n1) throw new Error("列数范围错误");
        const result: Matrix[] = []
        for (let i = n0; i <= n1; i++) result.push(this.col(i));
        return result
    }

    allCol() { // 获取所有列向量
        return this.cols(0)
    }

    toXYZ() { // 列向量转为三维坐标
        const [m, n] = this.dimension
        if (m < 3 || n < 1) throw new Error(`${m+1}*${n+1}矩阵不能转为三维坐标`);
        return { x: this.data.get([0, 0]), y: this.data.get([1, 0]), z: this.data.get([2, 0]) }
    }

    row(m: number) { // 获取第n行行向量
        if (m < 0 || m >= this.dimension[0]) throw new Error("行数越界");
        return Matrix.RowVec(this.data.row(m))
    }

    rows(m0: number, m1?: number) { // 获取第m0行到第m1行的行向量（包含第m1行）
        const [m, n] = this.dimension
        if (m1 === undefined) m1 = m;
        if (m0 < 0 || m1 < 0 || m0 >= m || m1 >= m) throw new Error("行数越界");
        if (m0 > m1) throw new Error("行数范围错误");
        const result: Matrix[] = []
        for (let i = m0; i <= m1; i++) result.push(this.row(i));
        return result
    }

    allRow() { // 获取所有行向量
        return this.rows(0)
    }

    insertCols(colsData: number[], col?: number, skipFillValueCheck = false) { // 插入多列
        this.data.insertCols(colsData, col, skipFillValueCheck)
        return this
    }

    insertRows(rowsData: number[], row?: number, skipFillValueCheck = false) { // 插入多行
        this.data.insertRows(rowsData, row, skipFillValueCheck)
        return this
    }

    transpose() { // 转置
        const [m, n] = this.dimension
        for (let i = 0; i < m; i++) {
            for (let j = i + 1; j < n; j++) {
                const temp = this.data.get([i, j])
                this.data.set([i, j], this.data.get([j, i]))
                this.data.set([j, i], temp)
            }
        }
        return this
    }

    add(matrix: Matrix, row: number = 0, column: number = 0) { // 矩阵相加，将本矩阵的特定区域与matrix相加
        const [m0, n0] = this.dimension
        const [m1, n1] = matrix.dimension
        if (row + m1 > m0 || column + n1 > n0) throw new Error("矩阵阶数不匹配，无法相加");
        for (let i = 0; i < m1; i++) for (let j = 0; j < n1; j++) this.data.set([row + i, column + j], this.data.get([row + i, column + j]) + matrix.data.get([i, j]));
        return this
    }

    subtract(matrix: Matrix, row: number = 0, column: number = 0) { // 矩阵相减，将本矩阵的特定区域与matrix相减
        const [m0, n0] = this.dimension
        const [m1, n1] = matrix.dimension
        if (row + m1 > m0 || column + n1 > n0) throw new Error("矩阵阶数不匹配，无法相减");
        for (let i = 0; i < m1; i++) for (let j = 0; j < n1; j++) this.data.set([row + i, column + j], this.data.get([row + i, column + j]) - matrix.data.get([i, j]));
        return this
    }

    multiplyByNumber(number: number) { // 矩阵数乘
        const [m, n] = this.dimension
        for (let i = 0; i < m; i++) for (let j = 0; j < n; j++) this.data.set([i, j], this.data.get([i, j]) * number);
        return this
    }

    _getMultiply(matrix: Matrix) {
        const [m0, n0] = this.dimension
        const [m1, n1] = matrix.dimension
        if (n0 !== m1) throw new Error("矩阵阶数不匹配，无法相乘");

        const result = buildArray(m0, n1)
        for (let i = 0; i < m0; i++) {
            for (let j = 0; j < n1; j++) {
                let sum = 0
                for (let k = 0; k < n0; k++) {
                    sum += this.data.get([i, k]) * matrix.data.get([k, j])
                }
                result.set([i, j], sum)
            }
        }
        return result
    }

    getMultiply(matrix: Matrix) { // 矩阵相乘，右乘matrix，不修改原矩阵，返回新矩阵
        return new Matrix(this._getMultiply(matrix))
    }


    multiply(matrix: Matrix) { // 矩阵相乘，右乘matrix，会修改原矩阵
        this.data = this._getMultiply(matrix)
        return this
    }

    multiplyRight(matrix: Matrix) { // 矩阵右乘
        return this.multiply(matrix)
    }

    multiplyLeft(matrix: Matrix) { // 矩阵左乘
        this.data = matrix.clone().multiply(this).data
        return this
    }

    getInverse(): Matrix | undefined { // 求逆矩阵（消元法），不修改原矩阵，返回新矩阵
        if (!this.isSquare) return; // 矩阵不是方阵，无逆矩阵

        const n = this.dimension[0] // 矩阵的阶数
        const result = buildIdentityArray(n) // 单位矩阵数组
        const data = this.data.clone() // 原矩阵的副本

        for (let i = 0; i < n; i++) {
            if (data.get([i, i]) === 0) { // 行首为0，要进行行交换
                let j = i + 1 // 从下一行开始找到行首不为0的行
                for (; j < n; j++) if (data.get([j, i]) !== 0) break;
                if (j === n) return; // 此列的第i行及以下行全为0，矩阵不可逆
                for (let k = 0; k < n; k++) { // 交换行
                    let temp = data.get([i, k])
                    data.set([i, k], data.get([j, k]))
                    data.set([j, k], temp)
                    temp = result.get([i, k])
                    result.set([i, k], result.get([j, k]))
                }
            }
            const factor = data.get([i, i]) // 主元
            // 第i行除以factor，使主元为1
            data.set([i, i], 1)
            for (let j = i + 1; j < n; j++) {
                data.set([i, j], data.get([i, j]) / factor)
                result.set([i, j], result.get([i, j]) / factor)
            }
            // 其余行减去对应倍数的第i行，使第i列除了主元外全为0
            for (let j = 0; j < n; j++) {
                if (j === i) continue; // 跳过自身
                const factor = data.get([j, i])
                data.set([j, i], 0)
                for (let k = i + 1; k < n; k++) {
                    data.set([j, k], data.get([j, k]) - data.get([i, k]) * factor)
                    result.set([j, k], result.get([j, k]) - result.get([i, k]) * factor)
                }
            }
        }
        this.data = result
        return this
    }

    rank(): number { // 求矩阵的秩（消元法）
        const [m, n] = this.dimension // 矩阵的阶数
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
            data.set([rank, i], 1)
            for (let k = i + 1; k < n; k++) data.set([rank, k], data.get([rank, k]) / factor);
            // 其余行减去对应倍数的第rank行，使第i列除了主元外全为0
            for (let j = 0; j < m; j++) {
                if (j === rank) continue; // 跳过自身
                const factor = data.get([j, i])
                data.set([j, i], 0)
                for (let k = i + 1; k < n; k++) data.set([j, k], data.get([j, k]) - data.get([rank, k]) * factor);
            }
            if (++rank === maxRank) break; // 秩达到最大值，结束
        }
        return rank
    }

    determinant(): number | undefined { // 求矩阵的行列式（递归降阶法）
        if (!this.isSquare) return; // 矩阵不是方阵，无行列式
        const [m, n] = this.dimension // 矩阵的阶数
        if (m === 1) return this.data.get([0, 0]); // 1阶矩阵的行列式
        if (m === 2) return this.data.get([0, 0]) * this.data.get([1, 1]) - this.data.get([0, 1]) * this.data.get([1, 0]); // 2阶矩阵的行列式
        let result = 0
        for (let i = 0; i < n; i++) {
            const factor = this.data.get([0, i]) // 第0行第i列的元素
            if (factor === 0) continue; // 该元素为0，跳过
            const subMatrixData = this.data.clone().deleteRows(0).deleteCols(i) // 去掉第0行和第i列的子矩阵
            const subMatrix = new Matrix(subMatrixData) // 子矩阵
            const subDeterminant = subMatrix.determinant() // 子矩阵的行列式
            if (subDeterminant === undefined) return; // 子矩阵的行列式不存在，行列式不存在
            result += (i % 2 === 0 ? 1 : -1) * factor * subDeterminant // 递归计算行列式
        }
        return result
    }

    getAdjoint(): Matrix | undefined { // 求矩阵的伴随矩阵
        if (!this.isSquare) return; // 矩阵不是方阵，无伴随矩阵
        const [m, n] = this.dimension // 矩阵的阶数
        const result = buildArray(m, n)
        for (let i = 0; i < m; i++) {
            for (let j = 0; j < n; j++) {
                const subMatrixData = this.data.clone().deleteRows(i).deleteCols(j) // 去掉第i行第j列的子矩阵
                const subMatrix = new Matrix(subMatrixData) // 子矩阵
                const subDeterminant = subMatrix.determinant() // 子矩阵的行列式
                if (subDeterminant === undefined) return; // 子矩阵的行列式不存在，伴随矩阵不存在
                result.set([i, j], (i + j) % 2 === 0 ? subDeterminant : -subDeterminant) // 伴随矩阵的元素
            }
        }
        return new Matrix(result)
    }

    normalize() { // 将矩阵的每一列化为单位向量
        const [m, n] = this.dimension
        for (let i = 0; i < n; i++) {
            let sum = 0
            for (let j = 0; j < m; j++) sum += this.data.get([j, i]) ** 2
            sum = Math.sqrt(sum)
            for (let j = 0; j < m; j++) this.data.set([i, i], this.data.get([j, i]) / sum)
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
