import {buildIdentityArray, ColVector, Matrix, Point, Vector} from "./matrix"
import {NumberArray2D} from "./number_array"

function hasSkewZ(matrix: Matrix) { // 验证矩阵是否存在Z轴斜切
    return matrix.col(0).dot(matrix.col(2)) !== 0 || matrix.col(1).dot(matrix.col(2)) !== 0
}

export class Transform { // 变换
    /** 变换矩阵
     * | a b c tx |         |         |   |
     * | d e f ty | ------> |  R·K·S  | T |
     * | g h i tz | ------> |_________|___|
     * | 0 0 0 1  |         |    0    | 1 |
     */
    matrix: Matrix

    // 变换顺序：缩放、斜切、旋转、平移 -> Transform = T·R·K·S
    translateMatrix: Matrix // 平移矩阵
    rotateMatrix: Matrix // 旋转矩阵
    skewMatrix: Matrix // 斜切矩阵
    scaleMatrix: Matrix // 缩放矩阵


    isMatrixLatest: boolean = true // matrix为最新
    isSubMatrixLatest: boolean = true // 子矩阵是否为最新

    updateMatrix() {
        if (this.isMatrixLatest && this.isSubMatrixLatest) return;
        // if (!this.isMatrixLatest && !this.isSubMatrixLatest) throw new Error("矩阵数据错误：isMatrixLatest与isSubMatrixLatest同时为false");
        if (!this.isMatrixLatest) {
            this.matrix = this.translateMatrix.clone().multiply(this.rotateMatrix).multiply(this.skewMatrix).multiply(this.scaleMatrix)
        } else {
            this.translateMatrix = this.matrix.col(3).insertCols(buildIdentityArray(4, 3), 0, true)

            const matrix3x3 = this.matrix.clone().resize(3, 3)
            const xDotY = matrix3x3.col(0).dot(matrix3x3.col(1)) // x轴与y轴的点积
            const norm_xCrossY = (matrix3x3.col(0).cross(matrix3x3.col(1)) as Vector).norm // x轴与y轴叉积的模
            let angle = Math.atan2(norm_xCrossY, xDotY) // y轴相对x轴的夹角（逆时针为正）
            if (angle < 0) angle += 2 * Math.PI;
            const skewXAngle = 0.5 * Math.PI - angle;
            const tanSkewX = Math.tan(skewXAngle)
            this.skewMatrix = new Matrix(new NumberArray2D([4, 4], [
                1, tanSkewX, 0, 0,
                0, 1, 0, 0,
                0, 0, 1, 0,
                0, 0, 0, 1,
            ], true))

            const xNorm = this.matrix.col(0).norm
            const yNorm = this.matrix.col(1).norm
            const zNorm = this.matrix.col(2).norm
            this.scaleMatrix = new Matrix(new NumberArray2D([4, 4], [
                xNorm, 0, 0, 0,
                0, yNorm / Math.sqrt(tanSkewX ** 2 + 1), 0, 0,
                0, 0, zNorm, 0,
                0, 0, 0, 1,
            ], true))

            // R = (T^-1)·Transform·(S^-1)·(K^-1)
            this.rotateMatrix = this.translateMatrix.getInverse()!.multiply(this.matrix).multiply(this.scaleMatrix.getInverse()!).multiply(this.skewMatrix.getInverse()!)
        }
        this.isMatrixLatest = true
        this.isSubMatrixLatest = true
    }

    constructor(params?: {
        matrix?: Matrix,
        subMatrix?: {
            translate: Matrix,
            rotate: Matrix,
            skew: Matrix,
            scale: Matrix,
        },
    }) {
        this.matrix = params?.matrix || Matrix.buildIdentity(4)
        this.translateMatrix = params?.subMatrix?.translate || Matrix.buildIdentity(4)
        this.rotateMatrix = params?.subMatrix?.rotate || Matrix.buildIdentity(4)
        this.skewMatrix = params?.subMatrix?.skew || Matrix.buildIdentity(4)
        this.scaleMatrix = params?.subMatrix?.scale || Matrix.buildIdentity(4)
        if (params?.matrix || params?.subMatrix) {
            this.isMatrixLatest = !!params?.matrix
            if (this.isMatrixLatest && hasSkewZ(this.matrix)) throw new Error("矩阵数据错误：matrix存在Z轴斜切");

            this.isSubMatrixLatest = !!params?.subMatrix
            if (this.isSubMatrixLatest && hasSkewZ(this.skewMatrix)) throw new Error("矩阵数据错误：skewMatrix存在Z轴斜切");
        }
    }

    clone() {
        this.updateMatrix()
        return new Transform({
            matrix: this.matrix.clone(),
            subMatrix: {
                translate: this.translateMatrix.clone(),
                rotate: this.rotateMatrix.clone(),
                skew: this.skewMatrix.clone(),
                scale: this.scaleMatrix.clone(),
            },
        })
    }

    transform(cols: Matrix) { // 对多个三维列向量（三维点）进行变换
        const [m, n] = cols.dimension
        if (m !== 3) throw new Error("点必须是3维向量");
        if (!this.isMatrixLatest) this.updateMatrix();
        return this.matrix.clone().multiply(cols.clone().insertRows(new NumberArray2D([1, n], 1))).resize(3, n)
    }

    transformCol(x: number, y: number, z: number) { // 对一个三维列向量（三维点）进行变换
        return this.transform(new ColVector([x, y, z])).toXYZ()
    }

    translate(x: number, y: number, z: number) { // 平移
        if (!this.isSubMatrixLatest) this.updateMatrix();
        const matrix = new Matrix(new NumberArray2D([4, 4], [
            1, 0, 0, x,
            0, 1, 0, y,
            0, 0, 1, z,
            0, 0, 0, 1,
        ], true))
        this.translateMatrix = matrix.multiply(this.translateMatrix)
        this.isMatrixLatest = false
        return this
    }

    // 缩放
    scale(params: {
        xScale?: number,
        yScale?: number,
        zScale?: number,
    }) {
        if (!this.isSubMatrixLatest) this.updateMatrix();
        const xScale = params.xScale || 1
        const yScale = params.yScale || 1
        const zScale = params.zScale || 1
        const matrix = new Matrix(new NumberArray2D([4, 4], [
            xScale, 0, 0, 0,
            0, yScale, 0, 0,
            0, 0, zScale, 0,
            0, 0, 0, 1,
        ], true))
        this.scaleMatrix = matrix.multiply(this.scaleMatrix)
        this.isMatrixLatest = false
        return this
    }

    rotateX(angle: number) { // 绕x轴旋转
        if (!this.isSubMatrixLatest) this.updateMatrix();
        const sin = Math.sin(angle)
        const cos = Math.cos(angle)
        const matrix = new Matrix(new NumberArray2D([4, 4], [
            1, 0, 0, 0,
            0, cos, -sin, 0,
            0, sin, cos, 0,
            0, 0, 0, 1,
        ], true))
        this.rotateMatrix = matrix.multiply(this.rotateMatrix)
        this.isMatrixLatest = false
        return this
    }

    rotateY(angle: number) { // 绕y轴旋转
        if (!this.isSubMatrixLatest) this.updateMatrix();
        const sin = Math.sin(angle)
        const cos = Math.cos(angle)
        const matrix = new Matrix(new NumberArray2D([4, 4], [
            cos, 0, sin, 0,
            0, 1, 0, 0,
            -sin, 0, cos, 0,
            0, 0, 0, 1,
        ], true))
        this.rotateMatrix = matrix.multiply(this.rotateMatrix)
        this.isMatrixLatest = false
        return this
    }

    rotateZ(angle: number) { // 绕z轴旋转
        if (!this.isSubMatrixLatest) this.updateMatrix();
        const sin = Math.sin(angle)
        const cos = Math.cos(angle)
        const matrix = new Matrix(new NumberArray2D([4, 4], [
            cos, -sin, 0, 0,
            sin, cos, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1,
        ], true))
        this.rotateMatrix = matrix.multiply(this.rotateMatrix)
        this.isMatrixLatest = false
        return this
    }

    rotate(axis: ColVector, angle: number) { // 绕任意轴旋转，axis为旋转轴的单位向量
        if (axis.dimension[0] !== 3) throw new Error("旋转轴必须是3维向量");
        if (!this.isSubMatrixLatest) this.updateMatrix();
        axis = axis.normalize() // axis化为单位向量
        const [x, y, z] = axis.rawData
        const c = Math.cos(angle)
        const s = Math.sin(angle)
        const t = 1 - c
        const matrix = new Matrix(new NumberArray2D([4, 4], [
            t * x * x + c, t * x * y - s * z, t * x * z + s * y, 0,
            t * x * y + s * z, t * y * y + c, t * y * z - s * x, 0,
            t * x * z - s * y, t * y * z + s * x, t * z * z + c, 0,
            0, 0, 0, 1,
        ], true))
        this.rotateMatrix = matrix.multiply(this.rotateMatrix)
        this.isMatrixLatest = false
        return this
    }

    rotateAt(axis: ColVector, point: Point, angle: number) { // 绕任意不过原点的轴旋转，axis为旋转轴的单位向量，point为旋转轴上的一点
        if (point.dimension[0] !== 3) throw new Error("旋转轴上的点必须是3维点");
        if (!this.isSubMatrixLatest) this.updateMatrix();

        this.rotateMatrix.m03 -= point.x
        this.rotateMatrix.m13 -= point.y
        this.rotateMatrix.m23 -= point.z

        this.rotate(axis, angle)

        this.rotateMatrix.m03 += point.x
        this.rotateMatrix.m13 += point.y
        this.rotateMatrix.m23 += point.z

        const diffTranslate = this.rotateMatrix.col(3)

        this.rotateMatrix.m03 = 0
        this.rotateMatrix.m13 = 0
        this.rotateMatrix.m23 = 0

        this.translate(diffTranslate.m0, diffTranslate.m1, diffTranslate.m2)

        return this
    }

    hasRotation() { // 判断是否有旋转
        if (!this.isSubMatrixLatest) this.updateMatrix();
        return !this.rotateMatrix.isIdentity
    }

    addTransform(transform: Transform) { // 叠加另一个变换（先执行本变换，再执行另一个变换）
        if (!transform.isMatrixLatest) transform.updateMatrix();
        if (!this.isMatrixLatest) this.updateMatrix();
        this.matrix = transform.matrix.clone().multiply(this.matrix)
        this.isSubMatrixLatest = false
        return this
    }

    decompose3DTranslate() { // 分解出平移的三维值
        if (!this.isSubMatrixLatest) this.updateMatrix();
        const matrix = this.isMatrixLatest ? this.matrix : this.translateMatrix
        return {
            x: matrix.m03,
            y: matrix.m13,
            z: matrix.m23,
        }
    }

    decomposeEulerZXY() { // 分解出欧拉角（ZXY序）的三维值
        if (!this.isSubMatrixLatest) this.updateMatrix();
        return Transform.decomposeEulerZXY(this.rotateMatrix)
    }

    decompose3DScale() { // 分解出缩放的三维值
        if (!this.isSubMatrixLatest) this.updateMatrix();
        return {
            x: this.scaleMatrix.m00,
            y: this.scaleMatrix.m11,
            z: this.scaleMatrix.m22,
        }
    }

    decomposeSkew() { // 分解出斜切的参数
        if (!this.isSubMatrixLatest) this.updateMatrix();
        return {
            skewX: Math.atan(this.skewMatrix.m01),
            skewY: Math.atan(this.skewMatrix.m10),
        }
    }

    // 旋转矩阵转欧拉角
    // 维基百科：https://en.wikipedia.org/wiki/Euler_angles
    // 欧拉角的“序”与实际操作顺序相反，例如ZXY序指的是先绕y轴旋转，再绕x轴旋转，最后绕z轴旋转
    // https://zhuanlan.zhihu.com/p/45404840?from=groupmessage
    static decomposeEulerZXY(matrix: Matrix) { // 通过旋转矩阵分解出欧拉角（ZXY序），返回值的单位为弧度
        const m = matrix.data
        const x = Math.asin(matrix.m21)
        let y, z
        if (x === Math.PI / 2 || x === -Math.PI / 2) {
            y = Math.atan2(matrix.m10, matrix.m00)
            z = 0
        } else {
            y = Math.atan2(-matrix.m20, matrix.m22)
            z = Math.atan2(-matrix.m01, matrix.m11)
        }
        return {
            x: x,
            y: y,
            z: z,
        }
    }

    decompose3DWithEulerZXY() { // 分解出平移、欧拉角（ZXY序）、缩放的三维值
        return {
            translate: this.decompose3DTranslate(),
            rotate: this.decomposeEulerZXY(),
            scale: this.decompose3DScale(),
            skew: this.decomposeSkew(),
        }
    }

    clearRotation() { // 清除旋转操作
        if (!this.isSubMatrixLatest) this.updateMatrix();
        this.rotateMatrix = Matrix.buildIdentity(4)
        this.isMatrixLatest = false
        return this
    }

    clearSkew() { // 清除斜切操作
        if (!this.isSubMatrixLatest) this.updateMatrix();
        this.skewMatrix = Matrix.buildIdentity(4)
        this.isMatrixLatest = false
        return this
    }

    clearScale() { // 清除缩放操作
        if (!this.isSubMatrixLatest) this.updateMatrix();
        this.scaleMatrix = Matrix.buildIdentity(4)
        this.isMatrixLatest = false
        return this
    }

    clearRKS() { // 清除旋转、斜切、缩放操作
        if (!this.isSubMatrixLatest) this.updateMatrix();
        this.rotateMatrix = Matrix.buildIdentity(4)
        this.skewMatrix = Matrix.buildIdentity(4)
        this.scaleMatrix = Matrix.buildIdentity(4)
        this.isMatrixLatest = false
        return this
    }

    clearTranslate() { // 清除平移操作
        if (!this.isSubMatrixLatest) this.updateMatrix();
        this.translateMatrix = Matrix.buildIdentity(4)
        this.isMatrixLatest = false
        return this
    }

    toString() {
        if (!this.isMatrixLatest) this.updateMatrix();
        return this.matrix.toString()
    }
}
