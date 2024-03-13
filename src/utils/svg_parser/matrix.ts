export function buildArray(n: number, m: number, value?: number) { // 构建一个n*m的二维数组
    const result: number[][] = []
    for (let i = 0; i < n; i++) {
        result[i] = []
        if (value === undefined) {
            result[i].length = m
            continue;
        }
        for (let j = 0; j < m; j++) {
            result[i][j] = value
        }
    }
    return result
}

export function buildIdentityArray(m: number, n: number = m) { // 构建m*n数组，n默认为m，主元为1，其余元素为0
    const result: number[][] = buildArray(m, n, 0)
    const rank = Math.min(m, n)
    for (let i = 0; i < rank; i++) result[i][i] = 1
    return result
}

export class Matrix { // 矩阵
    data: number[][]

    constructor(data: number[][], skipCheck = false) {
        this.data = data
        if (skipCheck) return;

        if (!Array.isArray(data)) throw new Error("矩阵数据必须是二维数组");

        const rowCount = data.length
        const columnCount = data[0]?.length || 0
        if (rowCount === 0 || columnCount === 0) throw new Error("矩阵数据不能为空");

        // 空元素用0填充
        for (let i = 0; i < data.length; i++) {
            data[i].length = columnCount
            for (let j = 0; j < columnCount; j++) {
                if (typeof data[i][j] !== "number") data[i][j] = 0;
            }
        }
    }

    static build(m: number, n: number, fillValue?: number) { // 构建m*n的矩阵
        return new Matrix(buildArray(m, n, fillValue), true)
    }

    static buildIdentity(m: number, n: number) { // 构建m*n的单位矩阵
        return new Matrix(buildIdentityArray(m, n), true)
    }

    clone() {
        return new Matrix(this.data.map(item => item.slice()), true)
    }

    get dimension() { // 矩阵的阶数
        return [this.data.length, this.data[0].length]
    }

    get isSquare() { // 判断是否为方阵
        return this.data.length === this.data[0].length
    }

    get isIdentity() { // 判断是否为单位矩阵
        const [m, n] = this.dimension
        if (m !== n) return false;
        for (let i = 0; i < m; i++) for (let j = 0; j < n; j++) if (i === j && this.data[i][j] !== 1 || i !== j && this.data[i][j] !== 0) return false;
        return true
    }

    get isDiagonal() { // 判断是否为对角矩阵
        const [m, n] = this.dimension
        if (m !== n) return false;
        for (let i = 0; i < m; i++) for (let j = 0; j < n; j++) if (i !== j && this.data[i][j] !== 0) return false;
        return true
    }

    get isSymmetric() { // 判断是否为对称矩阵
        const [m, n] = this.dimension
        if (m !== n) return false;
        for (let i = 0; i < m; i++) for (let j = i + 1; j < m; j++) if (this.data[i][j] !== this.data[j][i]) return false;
        return true
    }

    get isUpperTriangular() { // 判断是否为上三角矩阵
        const [m, n] = this.dimension
        if (m !== n) return false;
        for (let i = 0; i < m; i++) for (let j = 0; j < i; j++) if (this.data[i][j] !== 0) return false;
        return true
    }

    get isLowerTriangular() { // 判断是否为下三角矩阵
        const [m, n] = this.dimension
        if (m !== n) return false;
        for (let i = 0; i < m; i++) for (let j = i + 1; j < n; j++) if (this.data[i][j] !== 0) return false;
        return true
    }

    resize(m?: number, n?: number, fillValue: number = 0) { // 调整矩阵的大小，返回新矩阵
        const [m0, n0] = this.dimension
        if (m === undefined) m = m0;
        if (n === undefined) n = n0;
        const result: number[][] = buildArray(m, n, fillValue)
        for (let i = 0; i < Math.min(m, m0); i++) {
            for (let j = 0; j < Math.min(n, n0); j++) {
                result[i][j] = this.data[i][j]
            }
        }
        return new Matrix(result, true)
    }

    forEach(callback: (value: number, row: number, column: number) => void) { // 遍历（横向优先）
        const [m, n] = this.dimension
        for (let i = 0; i < n; i++) for (let j = 0; j < m; j++) callback(this.data[j][i], j, i);
    }

    flat() { // 转为一维数组（横向优先）
        return this.data.reduce((prev, curr) => prev.concat(curr), [])
    }

    static ColVec(data: number[]) { // 构建列向量
        return new Matrix(data.map(item => [item]), true)
    }

    static RowVec(data: number[]) { // 构建行向量
        return new Matrix([data], true)
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
        const result: number[][] = buildArray(m, n)
        for (let i = 0; i < n; i++) {
            const vector = vectors[i]
            if (vector.dimension[0] !== m) throw new Error("列向量的维度不匹配");
            for (let j = 0; j < m; j++) result[j][i] = vector.data[j][0]
        }
        return new Matrix(result, true)
    }

    static FromRows(vectors: Matrix[]) { // 从行向量构建矩阵
        const m = vectors.length
        const n = vectors[0].dimension[1]
        const result: number[][] = buildArray(m, n)
        for (let i = 0; i < m; i++) {
            const vector = vectors[i]
            if (vector.dimension[1] !== n) throw new Error("行向量的维度不匹配");
            for (let j = 0; j < n; j++) result[i][j] = vector.data[0][j]
        }
        return new Matrix(result, true)
    }

    col(n: number) { // 获取第n列列向量
        if (n < 0 || n >= this.dimension[1]) throw new Error("列数越界");
        return Matrix.ColVec(this.data.map(item => item[n]))
    }

    cols(n0: number, n1?: number) { // 获取第n0列到第n1列的列向量
        const [m, n] = this.dimension
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

    row(m: number) { // 获取第n行行向量
        if (m < 0 || m >= this.dimension[0]) throw new Error("行数越界");
        return Matrix.RowVec(this.data[m])
    }

    rows(m0: number, m1?: number) { // 获取第m0行到第m1行的行向量
        const [m, n] = this.dimension
        if (m1 === undefined) m1 = m;
        if (m0 < 0 || m1 < 0 || m0 >= m || m1 >= m) throw new Error("行数越界");
        if (m0 > m1) throw new Error("行数范围错误");
        const result: Matrix[] = []
        for (let i = m0; i <= m1; i++) result.push(this.row(i).clone());
        return result
    }

    allRow() { // 获取所有行向量
        return this.rows(0)
    }

    insertCols(cols: Matrix, index?: number) { // 插入多列，不修改原矩阵，返回新矩阵
        const [m0, n0] = this.dimension
        const [m1, n1] = cols.dimension
        if (m0 !== m1) throw new Error("矩阵行数不匹配，无法插入");
        if (index === undefined) index = n0;
        const result: number[][] = buildArray(m0, n0 + n1)
        for (let i = 0; i < m0; i++) for (let j = 0; j < index; j++) result[i][j] = this.data[i][j];
        for (let i = 0; i < m1; i++) for (let j = 0; j < n1; j++) result[i][index + j] = cols.data[i][j];
        for (let i = 0; i < m0; i++) for (let j = index; j < n0; j++) result[i][j + n1] = this.data[i][j];
        return new Matrix(result, true)
    }

    insertRows(rows: Matrix, index?: number) { // 插入多行，不修改原矩阵，返回新矩阵
        const [m0, n0] = this.dimension
        const [m1, n1] = rows.dimension
        if (n0 !== n1) throw new Error("矩阵列数不匹配，无法插入");
        if (index === undefined) index = m0;
        const result: number[][] = buildArray(m0 + m1, n0)
        for (let i = 0; i < index; i++) for (let j = 0; j < n0; j++) result[i][j] = this.data[i][j];
        for (let i = 0; i < m1; i++) for (let j = 0; j < n1; j++) result[index + i][j] = rows.data[i][j];
        for (let i = index; i < m0; i++) for (let j = 0; j < n0; j++) result[i + m1][j] = this.data[i][j];
        return new Matrix(result, true)
    }

    transpose() { // 转置，不修改原矩阵，返回新矩阵
        const [m, n] = this.dimension
        const result: number[][] = buildArray(n, m)
        for (let i = 0; i < m; i++) {
            for (let j = 0; j < n; j++) {
                result[j][i] = this.data[i][j]
            }
        }
        return new Matrix(result, true)
    }

    add(matrix: Matrix, row: number = 0, column: number = 0) { // 矩阵相加，将本矩阵的特定区域与matrix相加，不修改原矩阵，返回新矩阵
        const [m0, n0] = this.dimension
        const [m1, n1] = matrix.dimension
        if (row + m1 > m0 || column + n1 > n0) throw new Error("矩阵阶数不匹配，无法相加");
        const result: number[][] = buildArray(m0, n0)
        for (let i = 0; i < m0; i++) for (let j = 0; j < n0; j++) result[i][j] = this.data[i][j]; // 复制原矩阵
        for (let i = 0; i < m1; i++) for (let j = 0; j < n1; j++) result[row + i][column + j] += matrix.data[i][j];
        return new Matrix(result, true)
    }

    subtract(matrix: Matrix, row: number = 0, column: number = 0) { // 矩阵相减，将本矩阵的特定区域与matrix相减，不修改原矩阵，返回新矩阵
        const [m0, n0] = this.dimension
        const [m1, n1] = matrix.dimension
        if (row + m1 > m0 || column + n1 > n0) throw new Error("矩阵阶数不匹配，无法相减");
        const result: number[][] = buildArray(m0, n0)
        for (let i = 0; i < m0; i++) for (let j = 0; j < n0; j++) result[i][j] = this.data[i][j]; // 复制原矩阵
        for (let i = 0; i < m1; i++) for (let j = 0; j < n1; j++) result[row + i][column + j] -= matrix.data[i][j];
        return new Matrix(result, true)
    }

    multiplyByNumber(number: number) { // 矩阵数乘，不修改原矩阵，返回新矩阵
        const [m, n] = this.dimension
        const result: number[][] = buildArray(m, n)
        for (let i = 0; i < m; i++) for (let j = 0; j < n; j++) result[i][j] = this.data[i][j] * number
        return new Matrix(result, true)
    }

    multiply(matrix: Matrix) { // 矩阵相乘，右乘matrix，不修改原矩阵，返回新矩阵
        const [m0, n0] = this.dimension
        const [m1, n1] = matrix.dimension
        if (n0 !== m1) throw new Error("矩阵阶数不匹配，无法相乘");

        const result: number[][] = buildArray(m0, n1)
        for (let i = 0; i < m0; i++) {
            for (let j = 0; j < n1; j++) {
                let sum = 0
                for (let k = 0; k < n0; k++) {
                    sum += this.data[i][k] * matrix.data[k][j]
                }
                result[i][j] = sum
            }
        }
        return new Matrix(result, true)
    }

    multiplyRight(matrix: Matrix) { // 矩阵右乘，不修改原矩阵，返回新矩阵
        return this.multiply(matrix)
    }

    multiplyLeft(matrix: Matrix) { // 矩阵左乘，不修改原矩阵，返回新矩阵
        return matrix.multiply(this)
    }

    inverse(): Matrix | undefined { // 求逆矩阵（消元法），不修改原矩阵，返回新矩阵
        if (!this.isSquare) return; // 矩阵不是方阵，无逆矩阵

        const n = this.dimension[0] // 矩阵的阶数
        const result: number[][] = buildIdentityArray(n) // 单位矩阵数组
        const data = this.data.map(item => item.slice()) // 原矩阵的副本

        for (let i = 0; i < n; i++) {
            if (data[i][i] === 0) { // 行首为0，要进行行交换
                let j = i + 1 // 从下一行开始找到行首不为0的行
                for (; j < n; j++) if (data[j][i] !== 0) break;
                if (j === n) return; // 此列的第i行及以下行全为0，矩阵不可逆
                for (let k = 0; k < n; k++) { // 交换行
                    [data[i][k], data[j][k]] = [data[j][k], data[i][k]];
                    [result[i][k], result[j][k]] = [result[j][k], result[i][k]];
                }
            }
            const factor = data[i][i] // 主元
            for (let j = 0; j < n; j++) { // 第i行除以factor，使主元为1
                data[i][j] /= factor
                result[i][j] /= factor
            }
            // 其余行减去对应倍数的第i行，使第i列除了主元外全为0
            for (let j = 0; j < n; j++) {
                if (i === j) continue; // 跳过自身
                const factor = data[j][i]
                for (let k = 0; k < n; k++) {
                    data[j][k] -= factor * data[i][k]
                    result[j][k] -= factor * result[i][k]
                }
            }
        }
        return new Matrix(result, true)
    }

    rank(): number { // 求矩阵的秩（消元法）
        const [m, n] = this.dimension // 矩阵的阶数
        const data = this.data.map(item => item.slice()) // 原矩阵的副本
        const maxRank = Math.min(m, n) // 秩的最大值
        let rank = 0 // 秩
        for (let i = 0; i < n; i++) { // 遍历列
            // 从第rank行开始，找到第一个非0元素，交换行
            let j = rank
            for (; j < m; j++) if (data[j][i] !== 0) break;
            if (j === m) continue; // 该列全为0
            // 非本行，交换行
            if (j !== rank) for (let k = 0; k < n; k++) [data[rank][k], data[j][k]] = [data[j][k], data[rank][k]];
            // 本行除以data[rank][i]，使主元为1
            const factor = data[rank][i]
            for (let k = 0; k < n; k++) data[rank][k] /= factor;
            // 其余行减去对应倍数的第rank行，使第i列除了主元外全为0
            for (let j = 0; j < m; j++) {
                if (j === rank) continue; // 跳过自身
                const factor = data[j][i]
                for (let k = i; k < n; k++) data[j][k] -= factor * data[rank][k];
            }
            if (++rank === maxRank) break; // 秩达到最大值，结束
        }
        return rank
    }

    determinant(): number | undefined { // 求矩阵的行列式（递归降阶法）
        if (!this.isSquare) return; // 矩阵不是方阵，无行列式
        const [m, n] = this.dimension // 矩阵的阶数
        if (m === 1) return this.data[0][0] // 1阶矩阵的行列式
        if (m === 2) return this.data[0][0] * this.data[1][1] - this.data[0][1] * this.data[1][0] // 2阶矩阵的行列式
        let result = 0
        for (let i = 0; i < n; i++) {
            const factor = this.data[0][i] // 第0行第i列的元素
            if (factor === 0) continue; // 该元素为0，跳过
            const subMatrixData = this.data.slice(1).map(item => item.slice(0, i).concat(item.slice(i + 1))) // 去掉第0行第i列的子矩阵
            const subMatrix = new Matrix(subMatrixData, true) // 子矩阵
            const subDeterminant = subMatrix.determinant() // 子矩阵的行列式
            if (subDeterminant === undefined) return; // 子矩阵的行列式不存在，行列式不存在
            result += (i % 2 === 0 ? 1 : -1) * factor * subDeterminant // 递归计算行列式
        }
        return result
    }

    adjoint(): Matrix | undefined { // 求矩阵的伴随矩阵
        if (!this.isSquare) return; // 矩阵不是方阵，无伴随矩阵
        const [m, n] = this.dimension // 矩阵的阶数
        const result: number[][] = buildArray(m, n)
        for (let i = 0; i < m; i++) {
            for (let j = 0; j < n; j++) {
                const subMatrixData = this.data.slice(0, i).concat(this.data.slice(i + 1)).map(item => item.slice(0, j).concat(item.slice(j + 1))) // 去掉第i行第j列的子矩阵
                const subMatrix = new Matrix(subMatrixData, true) // 子矩阵
                const subDeterminant = subMatrix.determinant() // 子矩阵的行列式
                if (subDeterminant === undefined) return; // 子矩阵的行列式不存在，伴随矩阵不存在
                result[i][j] = (i + j) % 2 === 0 ? subDeterminant : -subDeterminant // 伴随矩阵的元素
            }
        }
        return new Matrix(result, true)
    }

    normalize() { // 将矩阵的每一列化为单位向量，不修改原矩阵，返回新矩阵
        const [m, n] = this.dimension
        const result: number[][] = buildArray(m, n)
        for (let i = 0; i < n; i++) {
            let sum = 0
            for (let j = 0; j < m; j++) sum += this.data[j][i] ** 2
            sum = Math.sqrt(sum)
            for (let j = 0; j < m; j++) result[j][i] = this.data[j][i] / sum
        }
        return new Matrix(result, true)
    }

    normalizeRow() { // 将矩阵的每一行化为单位向量，不修改原矩阵，返回新矩阵
        return this.transpose().normalize().transpose()
    }

    toString() { // 转为字符串
        return this.data.map(item => item.join(", ")).join("\n")
    }
}
