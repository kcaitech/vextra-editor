import { Context } from "@/context"
import { Shape, creator as shapeCreator, GroupShape, ShapeFrame, Artboard, Path } from "@kcdesign/data"

function buildArray(n: number, m: number, value?: number) { // 构建一个n*m的二维数组
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

function buildIdentityArray(m: number, n: number = m) { // 构建m*n数组，n默认为m，主元为1，其余元素为0
    const result: number[][] = buildArray(m, n, 0)
    const rank = Math.min(m, n)
    for (let i = 0; i < rank; i++) result[i][i] = 1
    return result
}

class Matrix { // 矩阵
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

    copy() {
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

    static colVec(data: number[]) { // 构建列向量
        return new Matrix(data.map(item => [item]), true)
    }

    static rowVec(data: number[]) { // 构建行向量
        return new Matrix([data], true)
    }

    static colVec3D(x: number, y: number, z: number) { // 构建三维列向量
        return Matrix.colVec([x, y, z])
    }

    static rowVec3D(x: number, y: number, z: number) { // 构建三维行向量
        return Matrix.rowVec([x, y, z])
    }

    static fromColumnVectors(vectors: Matrix[]) { // 从列向量构建矩阵
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

    static fromRowVectors(vectors: Matrix[]) { // 从行向量构建矩阵
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

    colVec(n: number) { // 获取第n列列向量
        if (n < 0 || n >= this.dimension[1]) throw new Error("列数越界");
        return Matrix.colVec(this.data.map(item => item[n]))
    }

    colVectors() { // 获取所有列向量
        const n = this.dimension[1]
        const result: Matrix[] = []
        for (let i = 0; i < n; i++) result.push(Matrix.colVec(this.data.map(item => item[n])));
        return result
    }

    rowVec(m: number) { // 获取第n行行向量
        if (m < 0 || m >= this.dimension[0]) throw new Error("行数越界");
        return Matrix.rowVec(this.data[m])
    }

    rowVectors() { // 获取所有行向量
        return this.data.map(item => Matrix.rowVec(item))
    }

    colExtend(matrix: Matrix) { // 列扩展，不修改原矩阵，返回新矩阵
        const [m0, n0] = this.dimension
        const [m1, n1] = matrix.dimension
        if (m0 !== m1) throw new Error("矩阵行数不匹配，无法扩展");
        const result: number[][] = buildArray(m0, n0 + n1)
        for (let i = 0; i < m0; i++) {
            for (let j = 0; j < n0; j++) result[i][j] = this.data[i][j]
            for (let j = 0; j < n1; j++) result[i][n0 + j] = matrix.data[i][j]
        }
        return new Matrix(result, true)
    }

    rowExtend(matrix: Matrix) { // 行扩展，不修改原矩阵，返回新矩阵
        const [m0, n0] = this.dimension
        const [m1, n1] = matrix.dimension
        if (n0 !== n1) throw new Error("矩阵列数不匹配，无法扩展");
        const result: number[][] = buildArray(m0 + m1, n0)
        for (let i = 0; i < m0; i++) for (let j = 0; j < n0; j++) result[i][j] = this.data[i][j]
        for (let i = 0; i < m1; i++) for (let j = 0; j < n1; j++) result[m0 + i][j] = matrix.data[i][j]
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

    add(matrix: Matrix) { // 矩阵相加，不修改原矩阵，返回新矩阵
        const [m0, n0] = this.dimension
        const [m1, n1] = matrix.dimension
        if (m0 !== m1 || n0 !== n1) throw new Error("矩阵阶数不匹配，无法相加");
        const result: number[][] = buildArray(m0, n0)
        for (let i = 0; i < m0; i++) for (let j = 0; j < n0; j++) result[i][j] = this.data[i][j] + matrix.data[i][j]
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

    toString() { // 转为字符串
        return this.data.map(item => item.join(", ")).join("\n")
    }
}

class Transform3D { // 变换
    /** 变换矩阵
     * | a b c tx |
     * | d e f ty |
     * | g h i tz |
     * | 0 0 0 1  |
     */
    matrix: Matrix

    constructor(matrix?: Matrix) {
        this.matrix = matrix || new Matrix(buildIdentityArray(4), true)
    }

    clone() {
        return new Transform3D(this.matrix.copy())
    }

    transform(points: Matrix) { // 对多个三维点（列向量）进行变换
        const [m, n] = points.dimension
        if (m !== 3) throw new Error("点必须是3维向量");
        return this.matrix.multiply(points.rowExtend(Matrix.build(1, n, 1))).resize(3, points.dimension[1])
    }

    transformPoint(x: number, y: number, z: number) { // 对一个三维点（列向量）进行变换
        return this.transform(Matrix.colVec3D(x, y, z))
    }

    translate(x: number, y: number, z: number) { // 平移，会修改原变换
        const matrix = new Matrix([
            [1, 0, 0, x],
            [0, 1, 0, y],
            [0, 0, 1, z],
            [0, 0, 0, 1],
        ], true)
        this.matrix = matrix.multiply(this.matrix)
        return this
    }

    scale(xScale: number, yScale: number, zScale: number) { // 缩放，会修改原变换
        const matrix = new Matrix([
            [xScale, 0, 0, 0],
            [0, yScale, 0, 0],
            [0, 0, zScale, 0],
            [0, 0, 0, 1],
        ], true)
        this.matrix = matrix.multiply(this.matrix)
        return this
    }

    _rotate(matrix: Matrix, ignoreTranslation = true) { // 旋转缩放等，会修改原变换，ignoreTranslation=true：进行旋转缩放等操作时忽略平移
        const translateVector = this.matrix.colVec(3)
        this.matrix = matrix.multiply(this.matrix.resize(3, 3)).rowExtend(Matrix.build(1, 3, 0)).colExtend(translateVector)
        return this
    }

    rotateX(angle: number, ignoreTranslation = true) { // 绕x轴旋转，会修改原变换
        const sin = Math.sin(angle)
        const cos = Math.cos(angle)
        const matrix = new Matrix([
            [1, 0, 0],
            [0, cos, -sin],
            [0, sin, cos],
        ], true)
        return this._rotate(matrix, ignoreTranslation)
    }

    rotateY(angle: number, ignoreTranslation = true) { // 绕y轴旋转，会修改原变换
        const sin = Math.sin(angle)
        const cos = Math.cos(angle)
        const matrix = new Matrix([
            [cos, 0, sin],
            [0, 1, 0],
            [-sin, 0, cos],
        ], true)
        return this._rotate(matrix, ignoreTranslation)
    }

    rotateZ(angle: number, ignoreTranslation = true) { // 绕z轴旋转，会修改原变换
        const sin = Math.sin(angle)
        const cos = Math.cos(angle)
        const matrix = new Matrix([
            [cos, -sin, 0],
            [sin, cos, 0],
            [0, 0, 1],
        ], true)
        return this._rotate(matrix, ignoreTranslation)
    }

    rotate(axis: Matrix, angle: number, ignoreTranslation = true) { // 绕任意轴旋转，axis为旋转轴的单位向量，会修改原变换
        if (axis.dimension[0] !== 3 || axis.dimension[1] !== 1) throw new Error("旋转轴必须是3维向量");
        axis = axis.normalize() // axis化为单位向量
        const [x, y, z] = axis.data.map(item => item[0])
        const c = Math.cos(angle)
        const s = Math.sin(angle)
        const t = 1 - c
        const matrix = new Matrix([
            [t * x * x + c, t * x * y - s * z, t * x * z + s * y],
            [t * x * y + s * z, t * y * y + c, t * y * z - s * x],
            [t * x * z - s * y, t * y * z + s * x, t * z * z + c],
        ], true)
        return this._rotate(matrix, ignoreTranslation)
    }

    rotateAt(axis: Matrix, point: Matrix, angle: number, ignoreTranslation = true) { // 绕任意旋转点和旋转轴旋转，axis为旋转轴的单位向量，point为旋转点，会修改原变换
        this.translate(-point.data[0][0], -point.data[1][0], -point.data[2][0])
        this.rotate(axis, angle, ignoreTranslation)
        this.translate(point.data[0][0], point.data[1][0], point.data[2][0])
        return this
    }

    hasRotation() { // 判断是否有旋转
        return !this.matrix.resize(3, 3).isDiagonal
    }

    addTransform(transform: Transform3D, ignoreTranslationWhenRotate = true) { // 叠加另一个变换（先执行本变换，再执行另一个变换），会修改原变换，ignoreTranslationWhenRotate=true：叠加旋转缩放等操作时忽略平移
        const translateVector = transform.matrix.colVec(3)
        const rotateMatrix = transform.matrix.resize(3, 3)
        this._rotate(rotateMatrix, ignoreTranslationWhenRotate)
        this.translate(translateVector.data[0][0], translateVector.data[1][0], translateVector.data[2][0])
        return this
    }

    decomposeMatrix() { // 分解出平移、旋转、缩放矩阵
        const m = this.matrix.data
        const sx = Math.sqrt(m[0][0] ** 2 + m[1][0] ** 2 + m[2][0] ** 2)
        const sy = Math.sqrt(m[0][1] ** 2 + m[1][1] ** 2 + m[2][1] ** 2)
        const sz = Math.sqrt(m[0][2] ** 2 + m[1][2] ** 2 + m[2][2] ** 2)
        return {
            translate: new Matrix([
                [1, 0, 0, m[0][3]],
                [0, 1, 0, m[1][3]],
                [0, 0, 1, m[2][3]],
                [0, 0, 0, 1],
            ], true),
            rotate: new Matrix([
                [m[0][0] / sx, m[1][0] / sy, m[2][0] / sz, 0],
                [m[0][1] / sx, m[1][1] / sy, m[2][1] / sz, 0],
                [m[0][2] / sx, m[1][2] / sy, m[2][2] / sz, 0],
                [0, 0, 0, 1],
            ], true),
            scale: new Matrix([
                [sx, 0, 0, 0],
                [0, sy, 0, 0],
                [0, 0, sz, 0],
                [0, 0, 0, 1],
            ], true),
        }
    }

    // 旋转矩阵转欧拉角
    // 维基百科：https://en.wikipedia.org/wiki/Euler_angles
    // 维基中的旋转矩阵R与Transform3D中的旋转矩阵matrix的行列定义相反，matrix是维基百科中R的转置
    // 欧拉角的“序”与实际操作顺序相反，例如ZXY序指的是先绕y轴旋转，再绕x轴旋转，最后绕z轴旋转
    // 维基百科中的α、β、γ分别对应Transform3D中的z、x、y
    // https://zhuanlan.zhihu.com/p/45404840?from=groupmessage
    static decomposeEulerYXZ(matrix: Matrix) { // 通过旋转矩阵分解出欧拉角（ZXY序），返回值的单位为弧度
        const m = matrix.data
        const x = Math.asin(m[1][2])
        let y, z
        if (x === Math.PI / 2 || x === -Math.PI / 2) {
            y = Math.atan2(m[2][0], m[0][0])
            z = 0
        } else {
            y = Math.atan2(-m[0][2], m[2][2])
            z = Math.atan2(-m[1][0], m[1][1])
        }
        return {
            x: x,
            y: y,
            z: z,
        }
    }

    decomposeToEulerZXY() { // 分解出平移、欧拉角（ZXY序）、缩放矩阵
        const decompose = this.decomposeMatrix()
        return {
            translate: {
                x: decompose.translate.data[0][3],
                y: decompose.translate.data[1][3],
                z: decompose.translate.data[2][3],

            },
            rotate: Transform3D.decomposeEulerYXZ(decompose.rotate),
            scale: {
                x: decompose.scale.data[0][0],
                y: decompose.scale.data[1][1],
                z: decompose.scale.data[2][2],

            },
        }
    }

    clearRotation() { // 清除旋转操作，会修改原变换
        const m = this.matrix.data
        m[0][0] = m[1][1] = m[2][2] = 1
        m[0][1] = m[0][2] = m[1][0] = m[1][2] = m[2][0] = m[2][1] = 0
        return this
    }

    clearScale() { // 清除缩放操作，会修改原变换
        this.matrix = this.matrix.resize(4, 3).normalize().colExtend(this.matrix.colVec(3))
        return this
    }

    clearTranslate() { // 清除平移操作，会修改原变换
        const m = this.matrix.data
        m[0][3] = m[1][3] = m[2][3] = 0
        return this
    }

    decomposeToRotate() { // 分解出旋转矩阵
        return this.clone().clearScale().clearTranslate()
    }

    decomposeToScale() { // 分解出缩放矩阵
        return this.clone().clearRotation().clearTranslate()
    }

    decomposeToTranslate() { // 分解出平移矩阵
        return this.clone().clearRotation().clearScale()
    }

    toString() {
        return this.matrix.toString()
    }
}

// 获取一个矩形的包围盒的lt和rb坐标
function getRectLTAndRB(x: number, y: number, w: number, h: number, transform: Transform3D) {
    if (!transform.hasRotation()) return {
        lt: { x: x, y: y },
        rb: { x: x + w, y: y + h },
    };
    transform = transform.decomposeToRotate()
    // 矩形中心为原点的情况下，矩形的四个顶点坐标
    const points = Matrix.fromColumnVectors([
        Matrix.colVec3D(-w / 2, -h / 2, 0), // 左上
        Matrix.colVec3D(w / 2, -h / 2, 0), // 右上
        Matrix.colVec3D(w / 2, h / 2, 0), // 右下
        Matrix.colVec3D(-w / 2, h / 2, 0), // 左下
    ])
    // 变换后的四个顶点坐标
    const newPoints = transform.transform(points)
    // 右下角坐标
    const maxX = Math.max(...newPoints.data[0])
    const maxY = Math.max(...newPoints.data[1])
    // 从中心点平移回原点
    return {
        lt: { x: -maxX + w / 2 + x, y: -maxY + h / 2 + y },
        rb: { x: maxX + w / 2 + x, y: maxY + h / 2 + y },
    }
}

type FunctionCall = [
    string, // 函数名
    string, // 参数
]

// 获取所有函数调用。获取所有xxx(...)格式的匹配项，返回函数名和括号内的参数
function getAllFunctionCallFromString(content: string): FunctionCall[] {
    const regexp = /(\w+)\(([^)]+)\)/g
    const result: [string, string][] = []
    for (; ;) {
        const match = regexp.exec(content)
        if (!match) break;
        result.push([match[1], match[2]])
    }
    return result
}

// 获取style属性中的所有key:value
function getAllStyleFromString(content: string) {
    const result: { [key: string]: string } = {}
    const items = content.split(";")
    for (const item of items) {
        const [key, value] = item.split(":").map(item => item.trim())
        if (key && value) result[key] = value
    }
    return result
}

function parseTransform(transform: string, isCssStyle = false) { // 解析transform属性，isCssStyle为false时，transform为svg的transform属性，为true时，transform为css的transform属性
    const functionCalls = getAllFunctionCallFromString(transform)
    const transform3D = new Transform3D()
    for (const [name, args] of functionCalls) {
        const argList = args.split(",")
        const numArgList = argList.map(angle => {
            if (angle.includes("deg")) return parseFloat(angle.replace("deg", "")) * Math.PI / 180;
            else if (angle.includes("rad")) return parseFloat(angle.replace("rad", ""));
            else if (angle.includes("grad")) return parseFloat(angle.replace("grad", "")) * Math.PI / 200;
            else if (angle.includes("turn")) return parseFloat(angle.replace("turn", "")) * Math.PI * 2;
            else return parseFloat(angle);
        })
        if (name === "matrix") {
            const matrix = new Matrix([
                [numArgList[0], numArgList[2], 0, numArgList[4]],
                [numArgList[1], numArgList[3], 0, numArgList[5]],
                [0, 0, 1, 0],
                [0, 0, 0, 1],
            ], true)
            transform3D.addTransform(new Transform3D(matrix))
        } else if (name.startsWith("rotate")) {
            if (name === "rotate") {
                transform3D.rotateZ(numArgList[0])
            } else if (name === "rotateX") {
                transform3D.rotateX(numArgList[0])
            } else if (name === "rotateY") {
                transform3D.rotateY(numArgList[0])
            } else if (name === "rotateZ") {
                transform3D.rotateZ(numArgList[0])
            } else if (name === "rotate3d") {
                transform3D.rotate(Matrix.colVec([numArgList[0], numArgList[1], numArgList[2]]), numArgList[3])
            }
        } else if (name === "scale") {
            transform3D.scale(numArgList[0], numArgList[1], numArgList[2] || 1)
        } else if (name === "translate") {
            transform3D.translate(numArgList[0], numArgList[1], numArgList[2] || 0)
        } else {
            console.log("不支持的变换函数", name, args)
        }
    }
    return transform3D
}

type Attributes = { // 从元素的attributes中解析出来的属性
    x?: number,
    y?: number,
    width?: number,
    height?: number,
    transform?: string,
    styleTransform?: string,
}

// 将父元素的属性合并到子元素
function mergeAttributes(parent: BaseShapeCreator, child: BaseShapeCreator) {
    const parentShape = parent.that.shape
    const childShape = child.that.shape
    if (!parentShape || !childShape) return;

    // 合并transform
    child.that.transform = parent.that.transform.clone().addTransform(child.that.transform)
    child.that.updateShapeAttrByTransform()
}

interface ShapeCreator {
    make(): BaseShapeCreator // 重载make方法，可返回另一类型的creator代替自身
    create(): Shape | undefined // 创建shape
    afterChildrenCreated(): void // 所有子节点create之后
    afterSiblingCreated(): void // 所有兄弟节点create之后
    afterAllCreated(): void // 所有节点create之后
}

class BaseShapeCreator implements ShapeCreator {
    root: BaseShapeCreator | undefined
    parent: BaseShapeCreator | undefined
    children: BaseShapeCreator[] = []
    svgRoot: Element
    svgNode: Element
    svgNodeTagName: string
    shape: Shape | undefined = undefined
    that: BaseShapeCreator = this

    attributes: Attributes = {}
    transform = new Transform3D()

    constructor(root: BaseShapeCreator | undefined, parent: BaseShapeCreator | undefined, svgRoot: Element, svgNode: Element) {
        this.root = root
        this.parent = parent
        this.svgRoot = svgRoot
        this.svgNode = svgNode
        this.svgNodeTagName = svgNode.tagName
        this.parseAttributes()
        this.shape = this.create()
        this.updateShapeAttr()
    }

    make(): BaseShapeCreator {
        return this
    }

    setThat(that: BaseShapeCreator) {
        while (that.that !== that) that = that.that;
        this.that = that
    }

    parseAttributes() {
        const x = this.svgNode.getAttribute("x")
        if (x) this.attributes.x = parseFloat(x);
        const y = this.svgNode.getAttribute("y")
        if (y) this.attributes.y = parseFloat(y);

        const width = this.svgNode.getAttribute("width")
        if (width) this.attributes.width = parseFloat(width);
        const height = this.svgNode.getAttribute("height")
        if (height) this.attributes.height = parseFloat(height);

        const style = this.svgNode.getAttribute("style")

        let transform
        if (style) {
            const styleAttributes = getAllStyleFromString(style)
            this.attributes.styleTransform = styleAttributes.transform
            transform = this.attributes.styleTransform
        }
        if (!transform) {
            this.attributes.transform = this.svgNode.getAttribute("transform") ?? undefined
            transform = this.attributes.transform
        }
        if (transform) {
            this.transform.addTransform(parseTransform(transform))
        }
    }

    updateShapeAttrByTransform() { // 根据transform更新shape的属性
        const shape = this.shape
        if (!shape) return;

        const { translate, rotate } = this.transform.decomposeToEulerZXY()

        // 设置xy
        shape.frame.x = translate.x
        shape.frame.y = translate.y

        // 设置旋转
        shape.rotation = rotate.z * 180 / Math.PI

        // 设置翻转，绝对值大于179度时认为是翻转
        shape.isFlippedVertical = Math.abs(rotate.x) * 180 / Math.PI > 179
        shape.isFlippedHorizontal = Math.abs(rotate.y) * 180 / Math.PI > 179
    }

    updateShapeAttr() { // 设置shape的属性
        const shape = this.shape
        if (!shape) return;

        // 叠加xy
        let x = this.attributes.x || 0
        let y = this.attributes.y || 0
        if (this.parent instanceof SvgShapeCreator && this.parent.viewBox) { // viewBox偏移
            x -= this.parent.viewBox[0]
            y -= this.parent.viewBox[1]
        }
        if (x !== 0 || y !== 0) this.transform.translate(x, y, 0)

        this.updateShapeAttrByTransform()
    }

    create(): Shape | undefined {
        return
    }

    afterChildrenCreated(): void {

    }

    afterSiblingCreated(): void {

    }

    afterAllCreated(): void {

    }
}

class NoneShapeCreator extends BaseShapeCreator {

}

class GroupShapeCreator extends BaseShapeCreator {
    create(): Shape | undefined {
        return shapeCreator.newGroupShape("编组")
    }

    afterChildrenCreated(): void {
        if (!this.shape) return;
        const children: {
            shape: Shape,
            creator: BaseShapeCreator,
        }[] = this.children.filter(child => child.that.shape).map(child => {
            return {
                shape: child.that.shape!,
                creator: child.that,
            }
        })
        if (children.length === 0) {
            this.that = new NoneShapeCreator(this.root, this.parent, this.svgRoot, this.svgNode)
            return
        }
        if (children.length === 1) {
            mergeAttributes(this, children[0].creator)
            this.setThat(children[0].creator)
            return
        }

        const groupShape = this.shape as GroupShape
        groupShape.childs.push(...children.map(child => child.shape))

        // 根据子元素的包围盒，更新groupShape的宽高
        let ltX = groupShape.frame.x
        let ltY = groupShape.frame.y
        let rbX = groupShape.frame.x + groupShape.frame.width
        let rbY = groupShape.frame.y + groupShape.frame.height

        for (const child of children) {
            const childShape = child.shape
            const childCreator = child.creator
            const childLTRB = getRectLTAndRB(childShape.frame.x, childShape.frame.y, childShape.frame.width, childShape.frame.height, childCreator.transform)
            // 超出左、上边界的偏移量
            const ltXDiff = -childLTRB.lt.x
            const ltYDiff = -childLTRB.lt.y
            // 若超出左、上边界，整体向右、下偏移
            const childRbX = childLTRB.rb.x + Math.max(0, ltXDiff) + ltX
            const childRbY = childLTRB.rb.y + Math.max(0, ltYDiff) + ltY
            // 拓展右下边界
            if (childRbX > rbX) rbX = childRbX;
            if (childRbY > rbY) rbY = childRbY;
        }

        groupShape.frame.x = ltX
        groupShape.frame.y = ltY
        groupShape.frame.width = rbX - ltX
        groupShape.frame.height = rbY - ltY
    }
}

class SvgShapeCreator extends BaseShapeCreator {
    viewBox: [number, number, number, number] | undefined

    create(): Shape | undefined {
        const viewBox = this.svgNode.getAttribute("viewBox")
        if (viewBox) {
            const viewBoxSplitRes = viewBox.split(" ").map(item => parseFloat(item))
            if (viewBoxSplitRes.length === 4) {
                this.viewBox = viewBoxSplitRes as [number, number, number, number]
            }
        }
        const width = (this.viewBox ? this.viewBox[2] : this.attributes.width) || 0
        const height = (this.viewBox ? this.viewBox[3] : this.attributes.height) || 0
        return shapeCreator.newArtboard("容器", new ShapeFrame(0, 0, width, height))
    }

    afterChildrenCreated(): void {
        if (!this.shape) return;
        const svgShape = this.shape as Artboard
        const childrenShapes = this.children.filter(item => item.that.shape).map(item => item.that.shape!)
        if (childrenShapes.length === 0) {
            this.that = new NoneShapeCreator(this.root, this.parent, this.svgRoot, this.svgNode)
            return
        }
        svgShape.childs.push(...childrenShapes)
    }
}

const hiddenSvgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg")
hiddenSvgElement.setAttribute("width", "100%")
hiddenSvgElement.setAttribute("height", "100%")
hiddenSvgElement.setAttribute("style", "position:absolute;top:-100%;left:-100%;visibility:hidden")

function getHiddenSvgElement() {
    if (!document.contains(hiddenSvgElement)) document.body.appendChild(hiddenSvgElement);
    if (hiddenSvgElement.childElementCount > 100) hiddenSvgElement.innerHTML = "";
    return hiddenSvgElement
}

function getPathWHFromD(d: string): { width: number, height: number } {
    const svg = getHiddenSvgElement()
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path")
    path.setAttribute("d", d)
    svg.appendChild(path)
    const box = path.getBBox()
    return { width: box.width, height: box.height }
}

class PathShapeCreator extends BaseShapeCreator {
    create(): Shape | undefined {
        const d = this.svgNode.getAttribute("d")
        if (!d) return;
        const x = this.attributes.x || 0
        const y = this.attributes.y || 0
        const { width, height } = getPathWHFromD(d)
        const path = new Path(d);
        path.translate(-x, -y);
        return shapeCreator.newPathShape("路径", new ShapeFrame(x, y, width, height), path)
    }
}

class Parser {
    svgRoot: Element
    context: any = {}

    constructor(root: Element) {
        this.svgRoot = root
    }

    create(node: Element) { // 处理svg元素内的一个节点，并返回其子节点
        const children = Array.from(node.children)
        let creatorConstruction: typeof BaseShapeCreator
        if (node.tagName === "g") {
            creatorConstruction = GroupShapeCreator
        } else if (node.tagName === "svg") {
            creatorConstruction = SvgShapeCreator
        } else if (node.tagName === "path") {
            creatorConstruction = PathShapeCreator
        } else {
            creatorConstruction = NoneShapeCreator
        }
        (node as any).creator = new creatorConstruction(
            (this.svgRoot as any).creator, // root
            (node.parentElement as any)?.creator, // parent
            this.svgRoot, // svgRoot
            node, // svgNode
        ).make()
        return children
    }

    parse(): Shape | undefined {
        const stack = [this.svgRoot]
        const stack1: [ // 保存遍历树时的路径信息
            Element, // 已create的元素
            number, // 其子节点的数量
        ][] = []

        while (stack.length) {
            const node = stack.pop()!
            const children = this.create(node)

            const creator = (node as any).creator as BaseShapeCreator

            const parentNode = node.parentElement
            if (parentNode) {
                const parentCreator = (parentNode as any).creator as BaseShapeCreator
                parentCreator.children.push(creator)
            }

            if (children.length) {
                stack.push(...children.reverse())
                stack1.push([node, children.length])
            } else {
                creator.afterChildrenCreated()

                if (stack1.length === 0 && node !== this.svgRoot) throw new Error("svg root元素不匹配");

                let currentNode = node
                while (stack1.length > 0) {
                    const parentStack1 = stack1[stack1.length - 1]
                    if (parentStack1[0] !== currentNode.parentElement) throw new Error("svg父级元素不匹配");

                    if (--parentStack1[1] > 0) break;
                    stack1.pop()
                    currentNode = parentStack1[0]

                    const svgParent = parentStack1[0]
                    for (const child of svgParent.children) {
                        const childCreator = (child as any).creator as BaseShapeCreator
                        childCreator.afterSiblingCreated()
                    }

                    const parentCreator = (svgParent as any).creator as BaseShapeCreator
                    parentCreator.afterChildrenCreated()
                }
            }
        }

        const rootCreator = (this.svgRoot as any).creator as BaseShapeCreator
        const stack2 = [rootCreator]
        while (stack2.length) { // 再遍历一次，处理afterAllCreated
            const creator = stack2.pop()!
            creator.afterAllCreated()
            stack2.push(...creator.children)
        }

        return rootCreator.shape
    }
}

export function insert(context: Context, svgString: string) {
    const parser = new DOMParser()
    const svgDocument = parser.parseFromString(svgString, "image/svg+xml")
    const svgElement = svgDocument.documentElement
    const svgParser = new Parser(svgElement)
    const shape = svgParser.parse()
    const page = context.selection.selectedPage?.data
    const repo = context.coopRepo
    if (shape && page) {
        const api = repo.start("parseSvgInsert")
        try {
            api.shapeInsert(page, page, shape, page.childs.length)
            repo.commit()
        } catch (error) {
            console.log(error)
            repo.rollback()
        }
    }

    ;(window as any).svgElement = svgElement // eslint-disable-line
}
