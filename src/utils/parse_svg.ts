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
    FillRule,
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
    Gradient,
    GradientType,
    Stop,
    Point2D,
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

    add(matrix: Matrix) { // 矩阵相加，不修改原矩阵，返回新矩阵
        const [m0, n0] = this.dimension
        const [m1, n1] = matrix.dimension
        if (m0 !== m1 || n0 !== n1) throw new Error("矩阵阶数不匹配，无法相加");
        const result: number[][] = buildArray(m0, n0)
        for (let i = 0; i < m0; i++) for (let j = 0; j < n0; j++) result[i][j] = this.data[i][j] + matrix.data[i][j]
        return new Matrix(result, true)
    }

    subtract(matrix: Matrix) { // 矩阵相减，不修改原矩阵，返回新矩阵
        const [m0, n0] = this.dimension
        const [m1, n1] = matrix.dimension
        if (m0 !== m1 || n0 !== n1) throw new Error("矩阵阶数不匹配，无法相减");
        const result: number[][] = buildArray(m0, n0)
        for (let i = 0; i < m0; i++) for (let j = 0; j < n0; j++) result[i][j] = this.data[i][j] - matrix.data[i][j]
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

enum TransformMode { // 变换模式
    Local, // 相对坐标系变换，缩放、旋转、平移之间互不影响
    LocalTranslate, // 相对坐标系变换，平移会受到旋转、缩放的影响
    LocalPartialTranslate, // 相对坐标系变换，支持传入一个translate，旋转、缩放仅影响这部分平移
    Global, // 全局坐标系变换，缩放、旋转、平移之间相互影响。使用全局坐标系变换时，会使整个Transform3D对象变为全局坐标系变换（isLocalTransform=false），不可逆
}

type TransformParams = {
    transformMode?: TransformMode,
    translate?: { x: number, y: number, z: number },
}

class Transform3D { // 变换
    /** 变换矩阵
     * | a b c tx |
     * | d e f ty |
     * | g h i tz |
     * | 0 0 0 1  |
     */
    matrix: Matrix

    // 是否为相对坐标系变换
    // 相对坐标系变换：每次基本变换（缩放、旋转、平移等）都相对于图形自身的坐标系进行，缩放、旋转、平移之间互不影响
    // 变换顺序：缩放、旋转、平移 -> Transform = T·R·S
    isLocalTransform: boolean = true

    translateMatrix: Matrix // 平移矩阵
    rotateMatrix: Matrix // 旋转矩阵
    scaleMatrix: Matrix // 缩放矩阵

    // matrix是否为最新
    isMatrixLatest: boolean = false

    updateMatrix() {
        if (!this.isLocalTransform) return this.matrix;
        if (!this.isMatrixLatest) {
            this.matrix = this.translateMatrix.multiply(this.rotateMatrix).multiply(this.scaleMatrix)
            this.isMatrixLatest = true
        }
        return this.matrix
    }

    constructor(params?: {
        local?: {
            translate: Matrix,
            rotate: Matrix,
            scale: Matrix,
        },
        matrix?: Matrix,
    }) {
        this.isLocalTransform = !params?.matrix
        this.matrix = params?.matrix || new Matrix(buildIdentityArray(4))
        this.translateMatrix = params?.local?.translate || new Matrix(buildIdentityArray(4))
        this.rotateMatrix = params?.local?.rotate || new Matrix(buildIdentityArray(4))
        this.scaleMatrix = params?.local?.scale || new Matrix(buildIdentityArray(4))
    }

    clone() {
        const params: any = {}
        if (!this.isLocalTransform) {
            params.matrix = this.matrix.clone()
        } else {
            params.local = {
                translate: this.translateMatrix.clone(),
                rotate: this.rotateMatrix.clone(),
                scale: this.scaleMatrix.clone(),
            }
        }
        return new Transform3D(params)
    }

    transform(points: Matrix) { // 对多个三维点（列向量）进行变换
        points = points.clone()
        const [m, n] = points.dimension
        if (m !== 3) throw new Error("点必须是3维向量");
        this.updateMatrix()
        return this.matrix.multiply(points.insertRows(Matrix.build(1, n, 1))).resize(3, points.dimension[1])
    }

    transformPoint(x: number, y: number, z: number) { // 对一个三维点（列向量）进行变换
        return this.transform(Matrix.ColVec3D(x, y, z))
    }

    translate(x: number, y: number, z: number) { // 平移，会修改原变换
        const matrix = new Matrix([
            [1, 0, 0, x],
            [0, 1, 0, y],
            [0, 0, 1, z],
            [0, 0, 0, 1],
        ], true)
        if (!this.isLocalTransform) {
            this.matrix = matrix.multiply(this.matrix)
            return this
        }
        this.translateMatrix = matrix.multiply(this.translateMatrix)
        this.isMatrixLatest = false
        return this
    }

    // 缩放，会修改原变换
    scale(xScale: number, yScale: number, zScale: number, transformParams: TransformParams = {
        transformMode: TransformMode.Local
    }) {
        const matrix = new Matrix([
            [xScale, 0, 0, 0],
            [0, yScale, 0, 0],
            [0, 0, zScale, 0],
            [0, 0, 0, 1],
        ], true)
        if (transformParams.transformMode === TransformMode.Global) {
            this.updateMatrix()
            this.isLocalTransform = false
            this.matrix = matrix.multiply(this.matrix)
            return this
        }
        this.scaleMatrix = matrix.multiply(this.scaleMatrix)
        if (transformParams.transformMode === TransformMode.LocalTranslate) {
            this.translateMatrix = matrix.multiply(this.translateMatrix)
        } else if (transformParams.transformMode === TransformMode.LocalPartialTranslate) {
            const translate = transformParams.translate || { x: 0, y: 0, z: 0 }
            const translateMatrix = new Matrix([
                [1, 0, 0, translate.x],
                [0, 1, 0, translate.y],
                [0, 0, 1, translate.z],
                [0, 0, 0, 1],
            ], true)
            const translateMatrix2 = matrix.multiply(translateMatrix)
            const translateDiffMatrix = translateMatrix2.subtract(translateMatrix)
            this.translateMatrix = this.translateMatrix.add(translateDiffMatrix)
        }
        this.isMatrixLatest = false
        return this
    }

    // 旋转缩放等，会修改原变换
    _rotate(matrix: Matrix, transformParams: TransformParams = {
        transformMode: TransformMode.Local
    }) {
        if (transformParams.transformMode === TransformMode.Global) {
            this.updateMatrix()
            this.isLocalTransform = false
            this.matrix = matrix.multiply(this.matrix)
            return this
        }
        this.rotateMatrix = matrix.multiply(this.rotateMatrix)
        if (transformParams.transformMode === TransformMode.LocalTranslate) {
            this.translateMatrix = matrix.multiply(this.translateMatrix)
        } else if (transformParams.transformMode === TransformMode.LocalPartialTranslate) {
            const translate = transformParams.translate || { x: 0, y: 0, z: 0 }
            const translateMatrix = new Matrix([
                [1, 0, 0, translate.x],
                [0, 1, 0, translate.y],
                [0, 0, 1, translate.z],
                [0, 0, 0, 1],
            ], true)
            const translateMatrix2 = matrix.multiply(translateMatrix)
            const translateDiffMatrix = translateMatrix2.subtract(translateMatrix)
            this.translateMatrix = this.translateMatrix.add(translateDiffMatrix)
        }
        this.isMatrixLatest = false
        return this
    }

    // 绕x轴旋转，会修改原变换
    rotateX(angle: number, transformParams: TransformParams = {
        transformMode: TransformMode.Local
    }) {
        const sin = Math.sin(angle)
        const cos = Math.cos(angle)
        const matrix = new Matrix([
            [1, 0, 0, 0],
            [0, cos, -sin, 0],
            [0, sin, cos, 0],
            [0, 0, 0, 1],
        ], true)
        return this._rotate(matrix, transformParams)
    }

    // 绕y轴旋转，会修改原变换
    rotateY(angle: number, transformParams: TransformParams = {
        transformMode: TransformMode.Local
    }) {
        const sin = Math.sin(angle)
        const cos = Math.cos(angle)
        const matrix = new Matrix([
            [cos, 0, sin, 0],
            [0, 1, 0, 0],
            [-sin, 0, cos, 0],
            [0, 0, 0, 1],
        ], true)
        return this._rotate(matrix, transformParams)
    }

    // 绕z轴旋转，会修改原变换
    rotateZ(angle: number, transformParams: TransformParams = {
        transformMode: TransformMode.Local
    }) {
        const sin = Math.sin(angle)
        const cos = Math.cos(angle)
        const matrix = new Matrix([
            [cos, -sin, 0, 0],
            [sin, cos, 0, 0],
            [0, 0, 1, 0],
            [0, 0, 0, 1],
        ], true)
        return this._rotate(matrix, transformParams)
    }

    // 绕任意轴旋转，axis为旋转轴的单位向量，会修改原变换
    rotate(axis: Matrix, angle: number, transformParams: TransformParams = {
        transformMode: TransformMode.Local
    }) {
        if (axis.dimension[0] !== 3 || axis.dimension[1] !== 1) throw new Error("旋转轴必须是3维向量");
        axis = axis.normalize() // axis化为单位向量
        const [x, y, z] = axis.data.map(item => item[0])
        const c = Math.cos(angle)
        const s = Math.sin(angle)
        const t = 1 - c
        const matrix = new Matrix([
            [t * x * x + c, t * x * y - s * z, t * x * z + s * y, 0],
            [t * x * y + s * z, t * y * y + c, t * y * z - s * x, 0],
            [t * x * z - s * y, t * y * z + s * x, t * z * z + c, 0],
            [0, 0, 0, 1],
        ], true)
        return this._rotate(matrix, transformParams)
    }

    // 绕任意不过原点的轴旋转，axis为旋转轴的单位向量，point为旋转轴上的一点，会修改原变换
    rotateAt(axis: Matrix, point: Matrix, angle: number) {
        if (axis.dimension[0] !== 3 || axis.dimension[1] !== 1) throw new Error("旋转轴必须是3维向量");
        if (point.dimension[0] !== 3 || point.dimension[1] !== 1) throw new Error("旋转轴上的点必须是3维向量");
        this.rotate(axis, angle, {
            transformMode: TransformMode.LocalPartialTranslate,
            translate: { x: -point.data[0][0] + this.translateMatrix.data[0][3], y: -point.data[1][0] + this.translateMatrix.data[1][3], z: -point.data[2][0] + this.translateMatrix.data[2][3] },
        })
        return this
    }

    hasRotation() { // 判断是否有旋转
        if (!this.isLocalTransform) throw new Error("非局部变换模式，不能判断是否有旋转");
        return !this.rotateMatrix.isIdentity
    }

    addTransform(transform: Transform3D) { // 叠加另一个变换（先执行本变换，再执行另一个变换），会修改原变换
        if (!transform.isLocalTransform) {
            this.updateMatrix()
            this.isLocalTransform = false
            this.matrix = transform.matrix.multiply(this.matrix)
            return this
        }
        this.translateMatrix = transform.translateMatrix.multiply(this.translateMatrix)
        this.rotateMatrix = transform.rotateMatrix.multiply(this.rotateMatrix)
        this.scaleMatrix = transform.scaleMatrix.multiply(this.scaleMatrix)
        this.isMatrixLatest = false
        return this
    }

    decompose3DTranslate() { // 解算出平移的三维值
        const m = !this.isLocalTransform ? this.matrix.data : this.translateMatrix.data
        return {
            x: m[0][3],
            y: m[1][3],
            z: m[2][3],
        }
    }

    decomposeEulerZXY() { // 解算出欧拉角（ZXY序）的三维值
        if (!this.isLocalTransform) throw new Error("非局部变换模式，不能解算欧拉角");
        if (!this.hasRotation()) return { x: 0, y: 0, z: 0 };
        return Transform3D.decomposeEulerZXY(this.rotateMatrix)
    }

    decompose3DScale() { // 解算出缩放的三维值
        if (!this.isLocalTransform) throw new Error("非局部变换模式，不能解算缩放值");
        return {
            x: this.scaleMatrix.data[0][0],
            y: this.scaleMatrix.data[1][1],
            z: this.scaleMatrix.data[2][2],
        }
    }

    // 旋转矩阵转欧拉角
    // 维基百科：https://en.wikipedia.org/wiki/Euler_angles
    // 欧拉角的“序”与实际操作顺序相反，例如ZXY序指的是先绕y轴旋转，再绕x轴旋转，最后绕z轴旋转
    // https://zhuanlan.zhihu.com/p/45404840?from=groupmessage
    static decomposeEulerZXY(matrix: Matrix) { // 通过旋转矩阵分解出欧拉角（ZXY序），返回值的单位为弧度
        const m = matrix.data
        const x = Math.asin(m[2][1])
        let y, z
        if (x === Math.PI / 2 || x === -Math.PI / 2) {
            y = Math.atan2(m[1][0], m[0][0])
            z = 0
        } else {
            y = Math.atan2(-m[2][0], m[2][2])
            z = Math.atan2(-m[0][1], m[1][1])
        }
        return {
            x: x,
            y: y,
            z: z,
        }
    }

    decompose3DWithEulerZXY() { // 分解出平移、欧拉角（ZXY序）、缩放的三维值
        if (!this.isLocalTransform) throw new Error("非局部变换模式，不能解算欧拉角和缩放值");
        return {
            translate: this.decompose3DTranslate(),
            rotate: this.decomposeEulerZXY(),
            scale: this.decompose3DScale(),
        }
    }

    clearRotation() { // 清除旋转操作，会修改原变换
        if (!this.isLocalTransform) throw new Error("非局部变换模式，不能清除旋转操作");
        this.rotateMatrix = new Matrix(buildIdentityArray(4))
        this.isMatrixLatest = false
        return this
    }

    clearScale() { // 清除缩放操作，会修改原变换
        if (!this.isLocalTransform) throw new Error("非局部变换模式，不能清除缩放操作");
        this.scaleMatrix = new Matrix(buildIdentityArray(4))
        this.isMatrixLatest = false
        return this
    }

    clearRotationAndScale() { // 清除旋转和缩放操作，会修改原变换
        if (!this.isLocalTransform) {
            this.matrix = Matrix.buildIdentity(4, 3).insertCols(this.matrix.col(3))
            return this
        }
        this.rotateMatrix = new Matrix(buildIdentityArray(4))
        this.scaleMatrix = new Matrix(buildIdentityArray(4))
        this.isMatrixLatest = false
        return this
    }

    clearTranslate() { // 清除平移操作，会修改原变换
        if (!this.isLocalTransform) {
            this.matrix.data[0][3] = this.matrix.data[1][3] = this.matrix.data[2][3] = 0
            return this
        }
        this.translateMatrix.data[0][3] = this.translateMatrix.data[1][3] = this.translateMatrix.data[2][3] = 0
        this.isMatrixLatest = false
        return this
    }

    decomposeRotateMatrix() { // 解算出旋转变换
        if (!this.isLocalTransform) throw new Error("非局部变换模式，不能解算旋转变换");
        return this.clone().clearScale().clearTranslate()
    }

    decomposeScale() { // 解算出缩放变换
        if (!this.isLocalTransform) throw new Error("非局部变换模式，不能解算缩放变换");
        return this.clone().clearRotation().clearTranslate()
    }

    decomposeTranslate() { // 解算出平移变换
        return this.clone().clearRotationAndScale()
    }

    toString() {
        this.updateMatrix()
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

    isAncestorOf(node: BaseTreeNode) { // 判断本节点是否为指定节点的祖先
        let parent = node.parent
        while (parent) {
            if (parent === this) return true;
            parent = parent.parent
        }
        return false
    }

    isDescendantOf(node: BaseTreeNode) { // 判断本节点是否为指定节点的后代
        return node.isAncestorOf(this)
    }

    isOnTree() { // 判断本节点是否在树上
        if (!this.root) return false;
        return this.root.isAncestorOf(this)
    }

    isSiblingOf(node: BaseTreeNode) { // 判断本节点是否为指定节点的兄弟节点
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

    replaceWithChildren() { // 用子节点代替本节点（移除本节点但保留子节点）
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

function getRectBox(x: number, y: number, w: number, h: number, transform: Transform3D): RectBox { // 获取一个矩形的包围盒
    if (!transform.hasRotation()) return {
        lt: { x: x, y: y },
        rb: { x: x + w, y: y + h },
        w: w,
        h: h,
    };
    transform = transform.decomposeRotateMatrix()
    // 矩形中心为原点的情况下，矩形的四个顶点坐标
    const points = Matrix.FromCols([
        Matrix.ColVec3D(-w / 2, -h / 2, 0), // 左上
        Matrix.ColVec3D(w / 2, -h / 2, 0), // 右上
        Matrix.ColVec3D(w / 2, h / 2, 0), // 右下
        Matrix.ColVec3D(-w / 2, h / 2, 0), // 左下
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

function parseTransform(transformContent: string, params?: {
    transformMode?: TransformMode,
    diffX?: number,
    diffY?: number,
}) {
    const transformParams = {
        transformMode: params?.transformMode || TransformMode.Local,
    }
    const diffX = params?.diffX || 0
    const diffY = params?.diffY || 0

    const functionCalls = getAllFunctionCallFromString(transformContent)
    const transform = new Transform3D()

    for (const [name, args] of functionCalls) {
        const argList = args.split(/,|\s+/).filter(arg => arg && arg.trim()) // 分隔符为逗号或空格

        const numArgList = argList.map((value, i) => {
            if (value.includes("deg")) return parseFloat(value.replace("deg", "")) * Math.PI / 180;
            else if (value.includes("rad")) return parseFloat(value.replace("rad", ""));
            else if (value.includes("grad")) return parseFloat(value.replace("grad", "")) * Math.PI / 200;
            else if (value.includes("turn")) return parseFloat(value.replace("turn", "")) * Math.PI * 2;
            else {
                if (name.startsWith("rotate") && !(name === "rotate" && i > 0) && !(name === "rotate3d" && i < 3)) {
                    return parseFloat(value.replace("deg", "")) * Math.PI / 180
                } else {
                    return parseFloat(value)
                }
            }
        })

        if (name === "matrix") {
            // const matrix = new Matrix([
            //     [numArgList[0], numArgList[2], 0, numArgList[4]],
            //     [numArgList[1], numArgList[3], 0, numArgList[5]],
            //     [0, 0, 1, 0],
            //     [0, 0, 0, 1],
            // ], true)
            // transform.addTransform(new Transform3D({ matrix: matrix }))
            console.log("不支持的变换函数", name, args)
        } else if (name.startsWith("rotate")) {
            if (name === "rotate") {
                if (numArgList.length === 1) transform.rotateZ(numArgList[0], transformParams);
                else if (numArgList.length === 3) transform.rotateAt(Matrix.ColVec([0, 0, 1]), Matrix.ColVec([numArgList[1] - diffX, numArgList[2] - diffY, 0]), numArgList[0]);
            } else if (name === "rotateX") {
                transform.rotateX(numArgList[0], transformParams)
            } else if (name === "rotateY") {
                transform.rotateY(numArgList[0], transformParams)
            } else if (name === "rotateZ") {
                transform.rotateZ(numArgList[0], transformParams)
            } else if (name === "rotate3d") {
                transform.rotate(Matrix.ColVec([numArgList[0], numArgList[1], numArgList[2]]), numArgList[3], transformParams)
            }
        } else if (name === "scale") {
            transform.scale(numArgList[0], numArgList[1], numArgList[2] || 1, transformParams)
        } else if (name === "translate") {
            transform.translate(numArgList[0], numArgList[1], numArgList[2] || 0)
        } else {
            console.log("不支持的变换函数", name, args)
        }
    }
    return transform
}

type MyColor = {
    r: number,
    g: number,
    b: number,
    a: number,
}

function myColorToString(color: MyColor) {
    return `rgba(${color.r},${color.g},${color.b},${color.a})`
}

function myColorToColor(color: MyColor | undefined) {
    if (!color) return new Color(1, 0, 0, 0);
    return new Color(color.a, color.r, color.g, color.b)
}

type GradientStop = {
    offset: number,
    color: MyColor,
    opacity: number,
}

type LinearGradient = {
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    opacity: number,
    stops: GradientStop[],
}

type RadialGradient = {
    cx: number,
    cy: number,
    r: number,
    opacity: number,
    transform: Transform3D,
    stops: GradientStop[],
    scales: number[],
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

type FillColor = {
    colorType: "color" | "linearGradient" | "radialGradient", // 纯色、线性渐变、径向渐变
    color?: MyColor,
    linearGradient?: LinearGradient,
    radialGradient?: RadialGradient,
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
    fill?: FillColor,
    stroke?: FillColor & {
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
    isLocalAttributesParsed = false
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
     * 调整节点
     * adjust() // 调整节点
     * afterChildrenAdjust() // 所有子节点adjust之后
     * afterSiblingAdjust() // 所有兄弟节点adjust之后
     * afterAllAdjust() // 所有节点adjust之后
     *
     * 创建shape
     * createShape() // 创建shape
     * afterChildrenCreateShape() // 所有子节点创建shape之后
     * afterSiblingCreateShape() // 所有兄弟节点创建shape之后
     * afterAllCreateShape() // 所有节点创建shape之后
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

        const svgRoot = this.htmlElement?.root
        if (!svgRoot) return;

        if (this.isLocalAttributesParsed) return;
        this.isLocalAttributesParsed = true

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
        if (transform) this.transform.addTransform(parseTransform(transform, {
            diffX: parseFloat(x) || 0,
            diffY: parseFloat(y) || 0
        }));

        const opacity = this.localAttributes["opacity"]
        if (opacity) this.attributes.opacity = parseFloat(opacity);

        const parseFillColor = (content: string): FillColor | undefined => {
            let colorType: "color" | "linearGradient" | "radialGradient" | undefined
            let color: MyColor | undefined
            let linearGradient: LinearGradient | undefined
            let radialGradient: RadialGradient | undefined

            if (content.startsWith("url(#")) {
                const urlId = content.slice(5, -1)
                const el = svgRoot.querySelector(`#${urlId}`)
                if (el) {
                    const creator = (el as any).creator as BaseCreator
                    creator.parseAttributes()
                    const stops: GradientStop[] = creator.children.filter(child => child.htmlElement?.tagName === "stop").map(child => {
                        child.parseAttributes()
                        const attrs = child.localAttributes
                        let offset = 0
                        if (attrs["offset"]) {
                            if (attrs["offset"].includes("%")) offset = parseFloat(attrs["offset"].replace("%", "")) / 100;
                            else offset = parseFloat(attrs["offset"]);
                        }
                        const stopColor = parseColor(attrs["stop-color"] || "black")!
                        const stopOpacity = parseFloat(attrs["stop-opacity"] || "1")
                        return {
                            offset: offset,
                            color: stopColor,
                            opacity: stopOpacity,
                        }
                    })
                    if (creator.htmlElement?.tagName === "linearGradient") {
                        const x1 = parseFloat(creator.localAttributes["x1"] || "0")
                        const y1 = parseFloat(creator.localAttributes["y1"] || "0")
                        const x2 = parseFloat(creator.localAttributes["x2"] || "1")
                        const y2 = parseFloat(creator.localAttributes["y2"] || "0")
                        const parentX = parseFloat(this.localAttributes["x"] || "0")
                        const parentY = parseFloat(this.localAttributes["y"] || "0")
                        linearGradient = {
                            x1: x1 - parentX,
                            y1: y1 - parentY,
                            x2: x2 - parentX,
                            y2: y2 - parentY,
                            opacity: this.attributes.opacity || 1,
                            stops: stops,
                        }
                        colorType = "linearGradient"
                    } else if (creator.htmlElement?.tagName === "radialGradient") {
                        const cx = parseFloat(creator.localAttributes["cx"] || "0")
                        const cy = parseFloat(creator.localAttributes["cy"] || "0")
                        const r = parseFloat(creator.localAttributes["r"] || "1")
                        const transform = new Transform3D()
                        if (creator.localAttributes["gradientTransform"]) transform.addTransform(parseTransform(creator.localAttributes["gradientTransform"]));
                        const scaleArgs = getAllFunctionCallFromString(creator.localAttributes["gradientTransform"]).find(item => item[0] === "scale")?.[1].split(/,|\s+/).filter(arg => arg && arg.trim())
                        radialGradient = {
                            cx: cx,
                            cy: cy,
                            r: r,
                            opacity: this.attributes.opacity || 1,
                            transform: transform,
                            stops: stops,
                            scales: scaleArgs ? scaleArgs.map(arg => parseFloat(arg)) : [1, 1],
                        }
                        colorType = "radialGradient"
                    }
                }
            } else { // 纯色
                color = parseColor(content)
                if (color) colorType = "color";
            }

            return colorType && {
                colorType: colorType,
                color: color,
                linearGradient: linearGradient,
                radialGradient: radialGradient,
            }
        }

        let fill
        if (this.attributes.styleAttributes && "fill" in this.attributes.styleAttributes) {
            fill = this.attributes.styleAttributes.fill
        }
        if (!fill) fill = this.localAttributes["fill"];
        if (fill) {
            const fillColor = parseFillColor(fill)
            if (fillColor) this.attributes.fill = {
                colorType: fillColor.colorType,
                linearGradient: fillColor.linearGradient,
                radialGradient: fillColor.radialGradient,
                color: fillColor.color,
            };
        }

        const stroke = this.localAttributes["stroke"]
        const dashArray: number[] = this.localAttributes["stroke-dasharray"]?.split(",").map(item => parseFloat(item)) || [0, 0]
        if (stroke) {
            const fillColor = parseFillColor(stroke)
            if (fillColor) this.attributes.stroke = {
                colorType: fillColor.colorType,
                linearGradient: fillColor.linearGradient,
                radialGradient: fillColor.radialGradient,
                color: fillColor.color,
                dashArray: dashArray,
                position: "center",
            };
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

        const { translate, rotate } = this.transform.decompose3DWithEulerZXY()

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

        const buildGradientByFillColor = (fillColor: FillColor) => {
            const gradient = fillColor.colorType === "linearGradient" ? fillColor.linearGradient! : fillColor.radialGradient!

            let from: Point2D, to: Point2D
            let colorType
            let elipseLength
            const opacity = gradient.opacity
            const width = this.attributes.width || 1
            const height = this.attributes.height || 1

            if (fillColor.colorType === "linearGradient") {
                from = new Point2D(fillColor.linearGradient!.x1 / width, fillColor.linearGradient!.y1 / height)
                to = new Point2D(fillColor.linearGradient!.x2 / width, fillColor.linearGradient!.y2 / height)
                colorType = GradientType.Linear
            } else {
                const translate = fillColor.radialGradient!.transform.decompose3DTranslate()
                from = new Point2D(translate.x / width, translate.y / height)

                const toVec = fillColor.radialGradient!.transform.transform(Matrix.ColVec([1, 0, 0]))
                to = new Point2D(toVec.data[0][0] / width, toVec.data[1][0] / height)

                colorType = GradientType.Radial
                elipseLength = fillColor.radialGradient!.scales[1] / fillColor.radialGradient!.scales[0] * height / width
            }

            const stops = gradient.stops.map((item, i) =>
                new Stop([i] as BasicArray<number>, uuid(), item.offset, myColorToColor(item.color))
            ) as BasicArray<Stop>

            return new Gradient(from, to, colorType, stops as BasicArray<Stop>, elipseLength, opacity)
        }

        const fills = new BasicArray<Fill>()
        const fillColor = this.attributes.fill
        if (fillColor && !(this instanceof TextCreator)) { // 文本不需要填充
            const fill = new Fill(new BasicArray(), uuid(), true, FillType.SolidColor, myColorToColor(fillColor.color))
            fills.push(fill)

            if (fillColor.colorType !== "color") {
                fill.gradient = buildGradientByFillColor(fillColor)
                fill.fillType = FillType.Gradient
            }

            if (this.localAttributes["fill-rule"] === "evenodd") fill.fillRule = FillRule.Evenodd;
            else fill.fillRule = FillRule.Nonzero;
        }

        const borders = new BasicArray<Border>()
        const stroke = this.attributes.stroke
        if (stroke) {
            const strokeWidth = stroke.width || 1

            let position: BorderPosition
            if (stroke.position === "inside") position = BorderPosition.Inner;
            else if (stroke.position === "center") position = BorderPosition.Center;
            else position = BorderPosition.Outer;

            const borderStyle = new BorderStyle(stroke.dashArray[0], stroke.dashArray[1])
            const border = new Border([0] as BasicArray<number>, uuid(), true, FillType.SolidColor, myColorToColor(stroke.color), position, strokeWidth, borderStyle)
            borders.push(border)

            if (stroke.colorType !== "color") {
                border.gradient = buildGradientByFillColor(stroke)
                border.fillType = FillType.Gradient
            }
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
        if (x !== 0 || y !== 0) this.transform.translate(x, y, 0);

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
            return getRectBox(childShape.frame.x, childShape.frame.y, childShape.frame.width, childShape.frame.height, childCreator.transform)
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

        const svgRoot = this.root?.htmlElement?.root
        if (!svgRoot) return;

        // 填充部分
        let fillPart: PathCreator | undefined
        let position: "inside" | "center" | "outside"

        const findFillPart = (item: BaseTreeNode) => {
            return item instanceof PathCreator
                && item.attributes.fill
                && item.attributes.x === this.attributes.x
                && item.attributes.y === this.attributes.y
                && item.attributes.width === this.attributes.width
                && item.attributes.height === this.attributes.height
                && item.localAttributes["d"] === this.localAttributes["d"]
        }

        const mask = this.localAttributes["mask"]
        const clip = this.localAttributes["clip-path"]
        if ((mask && mask.startsWith("url(#")) || (clip && clip.startsWith("url(#"))) { // 外部、内部
            position = mask ? "outside" : "inside"
            const urlId = (mask || clip).slice(5, -1)
            const el = svgRoot.querySelector(`#${urlId}>path`)
            if (el) {
                const creator = (el as any).creator as BaseCreator
                if (creator instanceof PathCreator && creator.localAttributes["d"] === this.localAttributes["d"]) {
                    fillPart = this.parent?.siblings().find(findFillPart) as PathCreator | undefined
                    if (!fillPart) fillPart = this.parent?.siblings().reduce((prev, cur) => {
                        prev.push(...cur.children)
                        return prev
                    }, [] as BaseTreeNode[]).find(findFillPart) as PathCreator | undefined;
                }
            }
        } else { // 中心
            position = "center"
            fillPart = this.siblings().find(findFillPart) as PathCreator | undefined
            if (!fillPart) fillPart = this.parent?.siblings().find(findFillPart) as PathCreator | undefined;
            if (!fillPart) fillPart = this.parent?.siblings().reduce((prev, cur) => {
                prev.push(...cur.children)
                return prev
            }, [] as BaseTreeNode[]).find(findFillPart) as PathCreator | undefined;
        }

        if (!fillPart) fillPart = this;

        // 设置填充部分的边框
        let strokeWidth = this.attributes.strokeWidth
        if (strokeWidth && position !== "center") strokeWidth /= 2;
        fillPart.attributes.stroke = {
            ...this.attributes.stroke,
            width: strokeWidth,
            position: position,
        }

        if (fillPart !== this) this.remove(); // 有填充的情况下移除边框部分
    }

    createShape() {
        const d = this.localAttributes["d"]
        if (!d) return;
        let { x, y, width, height } = getPathBoxFromD(d)
        this.attributes.width = width
        this.attributes.height = height
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

        // 解析属性
        rootCreator.traverse({
            do: BaseCreator.method("parseAttributes"),
        })

        // 调整节点
        rootCreator.traverse({
            do: BaseCreator.method("adjust"),
            afterChildrenDo: BaseCreator.method("afterChildrenAdjust"),
            afterSiblingDo: BaseCreator.method("afterSiblingAdjust"),
            afterAllDo: BaseCreator.method("afterAllAdjust"),
        })

        // 创建shape
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
}
