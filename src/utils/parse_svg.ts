import { Context } from "@/context"
import {
    Shape,
    creator as shapeCreator,
    GroupShape,
    ShapeFrame,
    Artboard,
    Path,
    Style,
    BasicArray,
    Border,
    Fill,
    FillType,
    Shadow,
    Color,
    ContextSettings,
    BlendMode,
    BorderStyle,
    BorderPosition,
    CurvePoint,
    CurveMode,
    ResourceMgr,
    getFormatFromBase64,
} from "@kcdesign/data"
import { v4 as uuid } from "uuid"

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

    rotateAt(axis: Matrix, point: Matrix, angle: number, ignoreTranslation = true) { // 绕任意不过原点的轴旋转，axis为旋转轴的单位向量，point为旋转轴上的一点，会修改原变换
        if (axis.dimension[0] !== 3 || axis.dimension[1] !== 1) throw new Error("旋转轴必须是3维向量");
        if (point.dimension[0] !== 3 || point.dimension[1] !== 1) throw new Error("旋转轴上的点必须是3维向量");
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

type TreeNodeTraverseHandler = (node: BaseTreeNode) => void

class BaseTreeNode {
    root: BaseTreeNode | undefined
    parent: BaseTreeNode | undefined
    children: BaseTreeNode[] = []

    index() { // 获取本节点在父节点中的位置
        if (!this.parent) return -1;
        return this.parent.children.indexOf(this)
    }

    prevSibling() { // 获取前一个兄弟节点
        const index = this.index()
        if (index <= 0) return;
        return this.parent!.children[index - 1]
    }

    nextSibling() { // 获取后一个兄弟节点
        const index = this.index()
        if (index === -1 || index === this.parent!.children.length - 1) return;
        return this.parent!.children[index + 1]
    }

    siblings() { // 获取所有兄弟节点（排除自身）
        const index = this.index()
        if (index === -1) return [];
        return this.parent!.children.filter((_, i) => i !== index)
    }

    isAncestorOf(node: BaseTreeNode) { // 判断本节点是否是指定节点的祖先
        let parent = node.parent
        while (parent) {
            if (parent === this) return true;
            parent = parent.parent
        }
        return false
    }

    isDescendantOf(node: BaseTreeNode) { // 判断本节点是否是指定节点的后代
        return node.isAncestorOf(this)
    }

    isOnTree() { // 判断本届点是否在树上
        if (!this.root) return false;
        return this.root.isAncestorOf(this)
    }

    isSiblingOf(node: BaseTreeNode) { // 判断本节点是否是指定节点的兄弟节点
        return this.parent === node.parent
    }

    getPath() { // 获取（从根节点到）本节点的路径
        const path: BaseTreeNode[] = []
        let node: BaseTreeNode | undefined = this
        while (node) {
            path.push(node)
            node = node.parent
        }
        return path.reverse()
    }

    remove() { // 移除自身
        const index = this.index()
        if (index === -1) return;
        this.parent!.children.splice(index, 1)
    }

    replaceWithChildren() { // 用自身子节点代替本节点原本的位置
        if (!this.parent) return;
        this.parent.insertChildesAfter(this, ...this.children)
        this.remove()
    }

    removeChildes(...childes: BaseTreeNode[]) { // 移除多个子节点
        for (const child of childes) child.remove();
    }

    appendChildes(...childes: BaseTreeNode[]) { // 添加多个子节点
        for (const child of childes) {
            child.remove()
            child.parent = this
            child.root = this.root
            this.children.push(child)
        }
    }

    insertChildes(index: number, ...childes: BaseTreeNode[]) { // 在指定位置插入多个子节点
        if (index < 0 || index > this.children.length) return;
        for (const child of childes) {
            child.remove()
            child.parent = this
            child.root = this.root
        }
        this.children.splice(index, 0, ...childes)
    }

    insertChildesBefore(reference: BaseTreeNode, ...childes: BaseTreeNode[]) { // 在reference节点前插入多个子节点
        const index = reference.index()
        if (index === -1) return;
        this.insertChildes(index, ...childes)
    }

    insertChildesAfter(reference: BaseTreeNode, ...childes: BaseTreeNode[]) { // 在reference节点后插入子节点
        const index = reference.index()
        if (index === -1) return;
        this.insertChildes(index + 1, ...childes)
    }

    // 遍历以本节点为根的树
    // 遍历顺序：do(根)-do(左)-afterChildrenDo(左)-do(右)-afterChildrenDo(右)-afterSiblingDo(左-右)-afterChildrenDo(根)-afterAllDo(根-左-右)
    traverse(handler: {
        do?: TreeNodeTraverseHandler,
        afterChildrenDo?: TreeNodeTraverseHandler,
        afterSiblingDo?: TreeNodeTraverseHandler,
        afterAllDo?: TreeNodeTraverseHandler,
    }) {
        const stack0: BaseTreeNode[] = [this]
        const stack1: [ // 保存遍历树时的路径信息
            BaseTreeNode, // 已do的元素
            number, // 其子节点的数量
        ][] = []
        while (stack0.length) {
            const creator = stack0.pop()!
            handler.do?.(creator)

            const children = creator.children
            if (children.length) {
                stack0.push(...children.slice(0).reverse())
                stack1.push([creator, children.length])
            } else {
                handler.afterChildrenDo?.(creator)

                if (stack1.length === 0 && creator !== this) throw new Error("rootTreeNode元素不匹配");

                let currentCreator = creator
                while (stack1.length > 0) {
                    const parentStack = stack1[stack1.length - 1]
                    if (parentStack[0] !== currentCreator.parent) throw new Error("treeNode父级元素不匹配");

                    if (--parentStack[1] > 0) break;
                    stack1.pop()

                    for (const child of parentStack[0].children) handler.afterSiblingDo?.(child);

                    const parentCreator = parentStack[0]
                    handler.afterChildrenDo?.(parentCreator)

                    currentCreator = parentCreator
                }
            }
        }

        // 再遍历一次，处理afterAllDo
        const stack2: BaseTreeNode[] = [this]
        if (handler.afterAllDo) while (stack2.length) {
            const creator = stack2.pop()!
            handler.afterAllDo?.(creator)
            stack2.push(...creator.children.slice(0).reverse())
        }
    }
}

type RectBox = { // 矩形包围盒
    lt: { x: number, y: number }, // 左上角坐标
    rb: { x: number, y: number }, // 右下角坐标
    w: number, // 宽
    h: number, // 高
}

function getRectLTAndRB(x: number, y: number, w: number, h: number, transform: Transform3D): RectBox { // 获取一个矩形的包围盒
    if (!transform.hasRotation()) return {
        lt: { x: x, y: y },
        rb: { x: x + w, y: y + h },
        w: w,
        h: h,
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
        w: maxX * 2,
        h: maxY * 2,
    }
}

function mergeRectBox(...rectBoxes: RectBox[]): RectBox { // 合并多个矩形包围盒
    const ltX = Math.min(...rectBoxes.map(item => item.lt.x))
    const ltY = Math.min(...rectBoxes.map(item => item.lt.y))
    const rbX = Math.max(...rectBoxes.map(item => item.rb.x))
    const rbY = Math.max(...rectBoxes.map(item => item.rb.y))
    return {
        lt: { x: ltX, y: ltY },
        rb: { x: rbX, y: rbY },
        w: rbX - ltX,
        h: rbY - ltY,
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

type MyColor = {
    r: number,
    g: number,
    b: number,
    a: number,
}

// https://developer.mozilla.org/zh-CN/docs/Web/CSS/named-color
const namedColorMap: Record<string, string> = {
    "black": "#000000",
    "silver": "#c0c0c0",
    "gray": "#808080",
    "white": "#ffffff",
    "maroon": "#800000",
    "red": "#ff0000",
    "purple": "#800080",
    "fuchsia": "#ff00ff",
    "green": "#008000",
    "lime": "#00ff00",
    "olive": "#808000",
    "yellow": "#ffff00",
    "navy": "#000080",
    "blue": "#0000ff",
    "teal": "#008080",
    "aqua": "#00ffff",
    "aliceblue": "#f0f8ff",
    "antiquewhite": "#faebd7",
    "aquamarine": "#7fffd4",
    "azure": "#f0ffff",
    "beige": "#f5f5dc",
    "bisque": "#ffe4c4",
    "blanchedalmond": "#ffebcd",
    "blueviolet": "#8a2be2",
    "brown": "#a52a2a",
    "burlywood": "#deb887",
    "cadetblue": "#5f9ea0",
    "chartreuse": "#7fff00",
    "chocolate": "#d2691e",
    "coral": "#ff7f50",
    "cornflowerblue": "#6495ed",
    "cornsilk": "#fff8dc",
    "crimson": "#dc143c",
    "cyan": "#00ffff",
    "darkblue": "#00008b",
    "darkcyan": "#008b8b",
    "darkgoldenrod": "#b8860b",
    "darkgray": "#a9a9a9",
    "darkgreen": "#006400",
    "darkgrey": "#a9a9a9",
    "darkkhaki": "#bdb76b",
    "darkmagenta": "#8b008b",
    "darkolivegreen": "#556b2f",
    "darkorange": "#ff8c00",
    "darkorchid": "#9932cc",
    "darkred": "#8b0000",
    "darksalmon": "#e9967a",
    "darkseagreen": "#8fbc8f",
    "darkslateblue": "#483d8b",
    "darkslategray": "#2f4f4f",
    "darkslategrey": "#2f4f4f",
    "darkturquoise": "#00ced1",
    "darkviolet": "#9400d3",
    "deeppink": "#ff1493",
    "deepskyblue": "#00bfff",
    "dimgray": "#696969",
    "dimgrey": "#696969",
    "dodgerblue": "#1e90ff",
    "firebrick": "#b22222",
    "floralwhite": "#fffaf0",
    "forestgreen": "#228b22",
    "gainsboro": "#dcdcdc",
    "ghostwhite": "#f8f8ff",
    "gold": "#ffd700",
    "goldenrod": "#daa520",
    "greenyellow": "#adff2f",
    "grey": "#808080",
    "honeydew": "#f0fff0",
    "hotpink": "#ff69b4",
    "indianred": "#cd5c5c",
    "indigo": "#4b0082",
    "ivory": "#fffff0",
    "khaki": "#f0e68c",
    "lavender": "#e6e6fa",
    "lavenderblush": "#fff0f5",
    "lawngreen": "#7cfc00",
    "lemonchiffon": "#fffacd",
    "lightblue": "#add8e6",
    "lightcoral": "#f08080",
    "lightcyan": "#e0ffff",
    "lightgoldenrodyellow": "#fafad2",
    "lightgray": "#d3d3d3",
    "lightgreen": "#90ee90",
    "lightgrey": "#d3d3d3",
    "lightpink": "#ffb6c1",
    "lightsalmon": "#ffa07a",
    "lightseagreen": "#20b2aa",
    "lightskyblue": "#87cefa",
    "lightslategray": "#778899",
    "lightslategrey": "#778899",
    "lightsteelblue": "#b0c4de",
    "lightyellow": "#ffffe0",
    "limegreen": "#32cd32",
    "linen": "#faf0e6",
    "magenta": "#ff00ff",
    "mediumaquamarine": "#66cdaa",
    "mediumblue": "#0000cd",
    "mediumorchid": "#ba55d3",
    "mediumpurple": "#9370db",
    "mediumseagreen": "#3cb371",
    "mediumslateblue": "#7b68ee",
    "mediumspringgreen": "#00fa9a",
    "mediumturquoise": "#48d1cc",
    "mediumvioletred": "#c71585",
    "midnightblue": "#191970",
    "mintcream": "#f5fffa",
    "mistyrose": "#ffe4e1",
    "moccasin": "#ffe4b5",
    "navajowhite": "#ffdead",
    "oldlace": "#fdf5e6",
    "olivedrab": "#6b8e23",
    "orange": "#ffa500",
    "orangered": "#ff4500",
    "orchid": "#da70d6",
    "palegoldenrod": "#eee8aa",
    "palegreen": "#98fb98",
    "paleturquoise": "#afeeee",
    "palevioletred": "#db7093",
    "papayawhip": "#ffefd5",
    "peachpuff": "#ffdab9",
    "peru": "#cd853f",
    "pink": "#ffc0cb",
    "plum": "#dda0dd",
    "powderblue": "#b0e0e6",
    "rebeccapurple": "#663399",
    "rosybrown": "#bc8f8f",
    "royalblue": "#4169e1",
    "saddlebrown": "#8b4513",
    "salmon": "#fa8072",
    "sandybrown": "#f4a460",
    "seagreen": "#2e8b57",
    "seashell": "#fff5ee",
    "sienna": "#a0522d",
    "skyblue": "#87ceeb",
    "slateblue": "#6a5acd",
    "slategray": "#708090",
    "slategrey": "#708090",
    "snow": "#fffafa",
    "springgreen": "#00ff7f",
    "steelblue": "#4682b4",
    "tan": "#d2b48c",
    "thistle": "#d8bfd8",
    "tomato": "#ff6347",
    "transparent": "#00000000",
    "turquoise": "#40e0d0",
    "violet": "#ee82ee",
    "wheat": "#f5deb3",
    "whitesmoke": "#f5f5f5",
    "yellowgreen": "#9acd32",
}

function parseColor(content: string): MyColor | undefined {
    if (content in namedColorMap) content = namedColorMap[content];
    let color
    if (content.startsWith("rgba")) {
        const rgba = content.slice(5, -1).split(",").map(item => parseFloat(item))
        color = {
            r: rgba[0],
            g: rgba[1],
            b: rgba[2],
            a: rgba[3],
        }
    } else if (content.startsWith("rgb")) {
        const rgb = content.slice(4, -1).split(",").map(item => parseFloat(item))
        color = {
            r: rgb[0],
            g: rgb[1],
            b: rgb[2],
            a: 1,
        }
    } else if (content.startsWith("#")) {
        let hex = content.slice(1)
        let r, g, b, a
        if (hex.length === 3) {
            r = parseInt(hex[0] + hex[0], 16)
            g = parseInt(hex[1] + hex[1], 16)
            b = parseInt(hex[2] + hex[2], 16)
            a = 1
        } else if (hex.length === 4) {
            r = parseInt(hex[0] + hex[0], 16)
            g = parseInt(hex[1] + hex[1], 16)
            b = parseInt(hex[2] + hex[2], 16)
            a = parseInt(hex[3] + hex[3], 16) / 255
        } else if (hex.length === 6) {
            r = parseInt(hex.substring(0, 2), 16)
            g = parseInt(hex.substring(2, 4), 16)
            b = parseInt(hex.substring(4, 6), 16)
            a = 1
        } else if (hex.length === 8) {
            r = parseInt(hex.substring(0, 2), 16)
            g = parseInt(hex.substring(2, 4), 16)
            b = parseInt(hex.substring(4, 6), 16)
            a = parseInt(hex.substring(6, 8), 16) / 255
        } else {
            console.log("无效的颜色格式", content)
            return
        }
        color = {
            r: r,
            g: g,
            b: b,
            a: a,
        }
    } else if (content === "none") {

    } else {
        console.log("不支持的颜色格式", content)
    }

    return color
}

type Attributes = { // 从元素的attributes中解析出来的属性
    style?: string,
    styleAttributes?: Record<string, string>,

    x?: number,
    y?: number,
    width?: number,
    height?: number,

    transform?: string,
    styleTransform?: string,

    opacity?: number,
    fill?: MyColor,
    stroke?: {
        color: MyColor,
        width?: number,
        dashArray: number[], // 虚线的length、gap参数，实线则为[0, 0]
        position: "inside" | "center" | "outside", // 位置：内部、中心、外部
    },
    strokeWidth?: number,

    // 椭圆
    cx?: number,
    cy?: number,
    rx?: number,
    ry?: number,

    // 直线
    x1?: number,
    y1?: number,
    x2?: number,
    y2?: number,

    // 图片
    href?: string,
}

// 将父元素的属性合并到子元素
function mergeAttributes(parent: BaseCreator, child: BaseCreator) {
    const parentShape = parent.shape
    const childShape = child.shape
    if (!parentShape || !childShape) return;

    // 合并transform
    child.transform = parent.transform.clone().addTransform(child.transform)
    child.updateShapeAttrByTransform()

    // 合并透明度
    if (parent.attributes.opacity) {
        if (child.attributes.opacity) child.attributes.opacity *= parent.attributes.opacity;
        else child.attributes.opacity = parent.attributes.opacity;
    }
    child.updateShapeStyle()
}

class BaseCreator extends BaseTreeNode {
    context: any
    root: BaseCreator | undefined
    parent: BaseCreator | undefined
    children: BaseCreator[] = []

    htmlElement?: {
        root: Element,
        node: Element,
        tagName: string,
    }

    localAttributes: Record<string, string> = {}
    attributes: Attributes = {}
    transform = new Transform3D()

    shape: Shape | undefined = undefined
    style?: Style

    constructor(context: any, root: BaseCreator | undefined, parent: BaseCreator | undefined, htmlElement?: {
        root: Element,
        node: Element,
    }) {
        super()
        this.context = context
        this.root = root
        this.parent = parent

        if (htmlElement) {
            this.htmlElement = {
                ...htmlElement,
                tagName: htmlElement.node.tagName,
            }
        }

        this.parseAttributes()
    }

    static method(handlerName: keyof BaseCreator) {
        return function (creator: BaseCreator) {
            creator[handlerName]()
        } as TreeNodeTraverseHandler
    }

    getShapeNumberName(name: string) {
        let shapeNameCountMap = this.context.shapeNameCountMap
        if (Object.prototype.toString.call(shapeNameCountMap) !== "[object Object]") {
            shapeNameCountMap = this.context.shapeNameCountMap = {}
        }
        if (!(name in shapeNameCountMap)) shapeNameCountMap[name] = 0;
        const number = ++shapeNameCountMap[name]
        return name + (number > 1 ? number : "")
    }

    /**
     * 调整阶段
     * adjust(): void // 调整节点
     * afterChildrenAdjust(): void // 所有子节点adjust之后
     * afterSiblingAdjust(): void // 所有兄弟节点adjust之后
     * afterAllAdjust(): void // 所有节点adjust之后
     *
     * shape创建阶段
     * createShape(): void // 创建shape
     * afterChildrenCreateShape(): void // 所有子节点创建shape之后
     * afterSiblingCreateShape(): void // 所有兄弟节点创建shape之后
     * afterAllCreateShape(): void // 所有节点创建shape之后
     */

    adjust() {

    }

    afterChildrenAdjust() {

    }

    afterSiblingAdjust() {

    }

    afterAllAdjust() {

    }

    createShape() {

    }

    _createShape() {
        this.createShape()
        this.updateShapeAttr()
    }

    afterChildrenCreateShape() {

    }

    afterSiblingCreateShape() {

    }

    afterAllCreateShape() {
        if (this.shape) this.shape.name = this.getShapeNumberName(this.shape.name);
    }

    parseAttributes() {
        if (!this.htmlElement) return;

        const attributes = this.htmlElement.node.attributes
        for (const attribute of attributes) this.localAttributes[attribute.name] = attribute.value;

        const style = this.localAttributes["style"]
        if (style) {
            this.attributes.style = style
            this.attributes.styleAttributes = getAllStyleFromString(style)
            if ("transform" in this.attributes.styleAttributes) {
                this.attributes.styleTransform = this.attributes.styleAttributes.transform
            }
        }

        const x = this.localAttributes["x"]
        if (x) this.attributes.x = parseFloat(x);
        const y = this.localAttributes["y"]
        if (y) this.attributes.y = parseFloat(y);

        const width = this.localAttributes["width"]
        if (width) this.attributes.width = parseFloat(width);
        const height = this.localAttributes["height"]
        if (height) this.attributes.height = parseFloat(height);

        let transform
        if (this.attributes.styleTransform) transform = this.attributes.styleTransform;
        if (!transform) {
            this.attributes.transform = this.localAttributes["transform"] ?? undefined
            transform = this.attributes.transform
        }
        if (transform) this.transform.addTransform(parseTransform(transform));

        const opacity = this.localAttributes["opacity"]
        if (opacity) this.attributes.opacity = parseFloat(opacity);

        let fill
        if (this.attributes.styleAttributes && "fill" in this.attributes.styleAttributes) {
            fill = this.attributes.styleAttributes.fill
        }
        if (!fill) fill = this.localAttributes["fill"];
        if (fill) this.attributes.fill = parseColor(fill);

        const stroke = this.localAttributes["stroke"]
        if (stroke) {
            const color = parseColor(stroke)
            if (color) {
                const dashArray: number[] = this.localAttributes["stroke-dasharray"]?.split(",").map(item => parseFloat(item)) || [0, 0]
                this.attributes.stroke = {
                    color: color,
                    dashArray: dashArray,
                    position: "center",
                }
            }
        }
        const strokeWidth = this.localAttributes["stroke-width"]
        if (strokeWidth) {
            this.attributes.strokeWidth = parseFloat(strokeWidth)
            if (this.attributes.stroke) this.attributes.stroke.width = this.attributes.strokeWidth;
        }

        const cx = this.localAttributes["cx"]
        if (cx) this.attributes.x = this.attributes.cx = parseFloat(cx);
        const cy = this.localAttributes["cy"]
        if (cy) this.attributes.y = this.attributes.cy = parseFloat(cy);
        const rx = this.localAttributes["rx"]
        if (rx) this.attributes.rx = parseFloat(rx);
        const ry = this.localAttributes["ry"]
        if (ry) this.attributes.ry = parseFloat(ry);
        const r = this.localAttributes["r"]
        if (r) this.attributes.rx = this.attributes.ry = parseFloat(r);

        const x1 = this.localAttributes["x1"]
        if (x1) this.attributes.x = this.attributes.x1 = parseFloat(x1);
        const y1 = this.localAttributes["y1"]
        if (y1) this.attributes.y = this.attributes.y1 = parseFloat(y1);
        const x2 = this.localAttributes["x2"]
        if (x2) this.attributes.x2 = parseFloat(x2);
        const y2 = this.localAttributes["y2"]
        if (y2) this.attributes.y2 = parseFloat(y2);

        const href = this.localAttributes["xlink:href"] ?? this.localAttributes["href"]
        if (href) this.attributes.href = href;
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

    updateShapeStyle() { // 设置shape的样式
        const shape = this.shape
        if (!shape) return;

        const borders = new BasicArray<Border>()
        if (this.attributes.stroke) {
            const strokeWidth = this.attributes.stroke.width || 1
            const color = new Color(
                this.attributes.stroke.color.a,
                this.attributes.stroke.color.r,
                this.attributes.stroke.color.g,
                this.attributes.stroke.color.b,
            )
            const borderStyle = new BorderStyle(this.attributes.stroke.dashArray[0], this.attributes.stroke.dashArray[1])
            borders.push(new Border([0] as BasicArray<number>, uuid(), true, FillType.SolidColor, color, BorderPosition.Center, strokeWidth, borderStyle))
        }

        const fills = new BasicArray<Fill>()
        if (this.attributes.fill && !(this instanceof TextCreator)) { // 文本不需要填充
            const color = new Color(this.attributes.fill.a, this.attributes.fill.r, this.attributes.fill.g, this.attributes.fill.b)
            fills.push(new Fill(new BasicArray(), uuid(), true, FillType.SolidColor, color))
        }

        const shadows = new BasicArray<Shadow>()

        this.style = new Style(borders, fills, shadows)
        if (this.attributes.opacity) this.style.contextSettings = new ContextSettings(BlendMode.Normal, this.attributes.opacity);
        shape.style = this.style
    }

    updateShapeAttr() { // 设置shape的属性
        const shape = this.shape
        if (!shape) return;

        // 叠加xy
        let x = this.attributes.x || 0
        let y = this.attributes.y || 0
        if (this.parent instanceof SvgCreator && this.parent.viewBox) { // viewBox偏移
            x -= this.parent.viewBox[0]
            y -= this.parent.viewBox[1]
        }
        if (x !== 0 || y !== 0) this.transform.translate(x, y, 0)

        this.updateShapeAttrByTransform()
        this.updateShapeStyle()
    }
}

class NoneCreator extends BaseCreator {

}

class GroupCreator extends BaseCreator {
    createShape() {
        this.shape = shapeCreator.newGroupShape("编组", this.style)
    }

    afterChildrenCreateShape(): void {
        if (!this.shape) return;
        const children: {
            shape: Shape,
            creator: BaseCreator,
        }[] = this.children.filter(child => child.shape).map(child => {
            return {
                shape: child.shape!,
                creator: child,
            }
        })

        if (children.length === 0) { // 空的group，移除自身
            this.remove()
            return
        }

        const reservedAttributes = ["fill", "stroke"] // 保留属性，有则不会被子级替代
        const isReserved = reservedAttributes.some(attr => attr in this.attributes)
        if (!isReserved && children.length === 1) { // 用子元素替代自身
            mergeAttributes(this, children[0].creator)
            this.replaceWithChildren()
            return
        }

        const groupShape = this.shape as GroupShape
        groupShape.childs.push(...children.map(child => child.shape))

        const childShapeBoxes = children.map(child => {
            const childShape = child.shape
            const childCreator = child.creator
            return getRectLTAndRB(childShape.frame.x, childShape.frame.y, childShape.frame.width, childShape.frame.height, childCreator.transform)
        })
        const childesShapeBox = mergeRectBox(...childShapeBoxes) // 合并所有子元素的包围盒

        // 根据子元素包围盒更新groupShape的宽高
        groupShape.frame.width = childesShapeBox.w
        groupShape.frame.height = childesShapeBox.h

        // 将子元素包围盒偏移至groupShape的左上角
        for (const child of children) {
            child.creator.transform.translate(-childesShapeBox.lt.x, -childesShapeBox.lt.y, 0)
            child.creator.updateShapeAttrByTransform()
        }
        // 将groupShape偏移至子元素包围盒原来的位置
        groupShape.frame.x += childesShapeBox.lt.x
        groupShape.frame.y += childesShapeBox.lt.y
    }
}

class SvgCreator extends BaseCreator {
    viewBox: [number, number, number, number] | undefined

    createShape() {
        const viewBox = this.localAttributes["viewBox"]
        if (viewBox) {
            const viewBoxSplitRes = viewBox.split(" ").map(item => parseFloat(item))
            if (viewBoxSplitRes.length === 4) {
                this.viewBox = viewBoxSplitRes as [number, number, number, number]
            }
        }
        const width = (this.viewBox ? this.viewBox[2] : this.attributes.width) || 0
        const height = (this.viewBox ? this.viewBox[3] : this.attributes.height) || 0
        this.shape = shapeCreator.newArtboard("容器", new ShapeFrame(0, 0, width, height))
    }

    afterChildrenCreateShape(): void {
        if (!this.shape) return;
        const svgShape = this.shape as Artboard
        const childrenShapes = this.children.filter(item => item.shape).map(item => item.shape!)
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

function getPathBoxFromD(d: string) {
    const svg = getHiddenSvgElement()
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path")
    path.setAttribute("d", d)
    svg.appendChild(path)
    return path.getBBox()
}

class PathCreator extends BaseCreator {
    afterAllAdjust() {
        // 识别本节点是否为边框部分
        if (this.attributes.fill || !this.attributes.stroke) return;

        // 主体部分
        const mainPath = this.siblings().find(item =>
            item instanceof PathCreator
            && item.attributes.fill
            && item.attributes.x === this.attributes.x
            && item.attributes.y === this.attributes.y
            && item.attributes.width === this.attributes.width
            && item.attributes.height === this.attributes.height
            && item.localAttributes["d"] === this.localAttributes["d"]
        ) as PathCreator | undefined
        if (!mainPath) return;

        // 设置边框
        console.log(this.attributes)
        mainPath.attributes.stroke = {
            color: this.attributes.stroke.color,
            width: this.attributes.strokeWidth,
            dashArray: this.attributes.stroke.dashArray,
            position: "center",
        }

        this.remove() // 移除自身
    }

    createShape() {
        const d = this.localAttributes["d"]
        if (!d) return;
        let { x, y, width, height } = getPathBoxFromD(d)
        const path = new Path(d);
        path.translate(-x, -y);
        this.transform.translate(x + (this.attributes.x || 0), y + (this.attributes.y || 0), 0)
        this.shape = shapeCreator.newPathShape("路径", new ShapeFrame(x, y, width, height), path, this.style)
    }
}

class RectCreator extends BaseCreator {
    createShape() {
        const x = this.attributes.x || 0
        const y = this.attributes.y || 0
        const width = this.attributes.width || 0
        const height = this.attributes.height || 0
        this.shape = shapeCreator.newRectShape("矩形", new ShapeFrame(x, y, width, height))
    }
}

class EllipseCreator extends BaseCreator {
    createShape() {
        const x = this.attributes.x || 0
        const y = this.attributes.y || 0

        let width = 0
        if (this.attributes.rx) width = this.attributes.rx * 2;
        else if (this.attributes.width) width = this.attributes.width;

        let height = 0
        if (this.attributes.ry) height = this.attributes.ry * 2;
        else if (this.attributes.height) height = this.attributes.height;

        this.shape = shapeCreator.newOvalShape("圆形", new ShapeFrame(x, y, width, height))
    }
}

class LineCreator extends BaseCreator {
    createShape() {
        const x1 = this.attributes.x1 || 0
        const y1 = this.attributes.y1 || 0
        const x2 = this.attributes.x2 || 0
        const y2 = this.attributes.y2 || 0
        const dx = x2 - x1
        const dy = y2 - y1
        const line = shapeCreator.newLineShape("直线", new ShapeFrame(x1, y1, 1, 1))
        if (!line.points) line.points = new BasicArray();
        line.points[0] = new CurvePoint([0] as BasicArray<number>, uuid(), 0, 0, CurveMode.Straight);
        line.points[1] = new CurvePoint([0] as BasicArray<number>, uuid(), dx, dy, CurveMode.Straight);
        this.shape = line
    }
}

class TextCreator extends BaseCreator {
    createShape() {
        const x = this.attributes.x || 0
        const y = this.attributes.y || 0

        const text = this.htmlElement!.node.textContent
        if (!text) return;

        const fontStyleAttr = this.attributes.styleAttributes?.font
        const fill = this.attributes.fill

        const textShape = shapeCreator.newTextShape("文本", new ShapeFrame(x, y, 0, 0))
        textShape.text.insertText(text, 0)

        this.shape = textShape
    }
}

class ImageCreator extends BaseCreator {
    createShape() {
        const x = this.attributes.x || 0
        const y = this.attributes.y || 0
        const width = this.attributes.width || 0
        const height = this.attributes.height || 0

        const href = this.attributes.href
        if (!href || !href.startsWith("data:image")) return;

        const media = {
            buff: Uint8Array.from(atob(href.split(",")[1]), c => c.charCodeAt(0)),
            base64: href,
        }

        const format = getFormatFromBase64(href)
        const ref = `${uuid()}.${format}`

        const mediaResourceMgr = this.context.mediaResourceMgr
        mediaResourceMgr.add(ref, media)

        this.shape = shapeCreator.newImageShape("图片", new ShapeFrame(x, y, width, height), mediaResourceMgr, ref)
    }
}

class Parser {
    svgRoot: Element
    context: any = {
        mediaResourceMgr: new ResourceMgr<{ buff: Uint8Array, base64: string }>([uuid(), "medias"]),
    }

    constructor(root: Element) {
        this.svgRoot = root
    }

    create(node: Element) { // 处理svg元素内的一个节点，并返回其子节点
        const children = Array.from(node.children)
        let creatorConstruction: typeof BaseCreator
        if (node.tagName === "g") {
            creatorConstruction = GroupCreator
        } else if (node.tagName === "svg") {
            creatorConstruction = SvgCreator
        } else if (node.tagName === "path") {
            creatorConstruction = PathCreator
        } else if (node.tagName === "rect") {
            creatorConstruction = RectCreator
        } else if (node.tagName === "circle" || node.tagName === "ellipse") {
            creatorConstruction = EllipseCreator
        } else if (node.tagName === "line") {
            creatorConstruction = LineCreator
        } else if (node.tagName === "text") {
            creatorConstruction = TextCreator
        } else if (node.tagName === "image") {
            creatorConstruction = ImageCreator
        } else {
            creatorConstruction = NoneCreator
        }
        (node as any).creator = new creatorConstruction(
            this.context, // context
            (this.svgRoot as any).creator, // root
            (node.parentElement as any)?.creator, // parent
            {
                root: this.svgRoot, // svgRoot
                node: node, // svgNode
            },
        )
        return children
    }

    parse(): Shape | undefined {
        // 创建creator树
        const stack0 = [this.svgRoot]
        while (stack0.length) {
            const node = stack0.pop()!
            const children = this.create(node)

            const creator = (node as any).creator as BaseCreator

            const parentNode = node.parentElement
            if (parentNode) {
                const parentCreator = (parentNode as any).creator as BaseCreator
                parentCreator.children.push(creator)
            }

            stack0.push(...children.slice(0).reverse())
        }
        const rootCreator = (this.svgRoot as any).creator as BaseCreator

        // 调整阶段
        rootCreator.traverse({
            do: BaseCreator.method("adjust"),
            afterChildrenDo: BaseCreator.method("afterChildrenAdjust"),
            afterSiblingDo: BaseCreator.method("afterSiblingAdjust"),
            afterAllDo: BaseCreator.method("afterAllAdjust"),
        })

        // 创建shape阶段
        rootCreator.traverse({
            do: BaseCreator.method("_createShape"),
            afterChildrenDo: BaseCreator.method("afterChildrenCreateShape"),
            afterSiblingDo: BaseCreator.method("afterSiblingCreateShape"),
            afterAllDo: BaseCreator.method("afterAllCreateShape"),
        })

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
            api.shapeInsert(context.data, page, page, shape, page.childs.length)
            repo.commit()
        } catch (error) {
            console.log(error)
            repo.rollback()
        }
    }

    ;(window as any).svgElement = svgElement // eslint-disable-line
}
