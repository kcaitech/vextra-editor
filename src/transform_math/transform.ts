import {ColVector, ColVector2D, ColVector3D, isZero, Matrix, Point3D, Vector} from "./matrix"
import {NumberArray2D} from "./number_array"

function hasSkewZ(matrix: Matrix) { // 验证矩阵是否存在Z轴斜切
    return matrix.col(0).dot(matrix.col(2)) !== 0 || matrix.col(1).dot(matrix.col(2)) !== 0
}

export enum TransformMode { // 变换模式
    Local, // 局部模式，不同变换（缩放、斜切、旋转、平移）之间互不影响
    Global, // 全局模式，不同变换之间相互影响
}

export class TranslateMatrix extends Matrix { // 平移矩阵
    getInverse(): Matrix | undefined {
        return new Matrix(new NumberArray2D([4, 4], [
            1, 0, 0, -this.m03,
            0, 1, 0, -this.m13,
            0, 0, 1, -this.m23,
            0, 0, 0, 1,
        ], true))
    }

    multiply(matrix: Matrix) {
        return Matrix.FromMatrix(matrix.add(this.col3.deleteRow(3), [0, 3]))
    }

    static FromMatrix(matrix: Matrix) {
        if (matrix instanceof TranslateMatrix) return matrix;
        return new TranslateMatrix(matrix.data)
    }
}

// 重写几个变换矩阵的部分方法，优化性能

export class RotateMatrix extends Matrix { // 旋转矩阵
    getInverse(): Matrix | undefined {
        if (isZero(this.m20) && isZero(this.m21) && isZero(this.m02) && isZero(this.m12)) { // 退化为二维旋转矩阵
            const det = this.m00 * this.m11 - this.m01 * this.m10
            if (isZero(det)) return; // 行列式为0，矩阵不可逆
            return new Matrix(new NumberArray2D([4, 4], [
                this.m11 / det, -this.m01 / det, 0, 0,
                -this.m10 / det, this.m00 / det, 0, 0,
                0, 0, 1 / this.m22, 0,
                0, 0, 0, 1,
            ], true))
        }
        return super.getInverse()
    }

    multiply(matrix: Matrix) {
        // 分块矩阵相乘
        const R0 = this.subMatrix([3, 3])
        matrix.multiplyLeftSubMatrix(R0)
            .multiplyLeftSubMatrix(R0, [3, 1], [0, 3])
        return Matrix.FromMatrix(matrix)
    }

    static FromMatrix(matrix: Matrix) {
        if (matrix instanceof RotateMatrix) return matrix;
        return new RotateMatrix(matrix.data)
    }
}

export class SkewMatrix extends Matrix { // 斜切矩阵
    getInverse(): Matrix | undefined {
        const kX = this.m01, kY = this.m10
        const t = 1 - kX * kY
        return new Matrix(new NumberArray2D([4, 4], [
            1 / t, -kX / t, 0, 0,
            -kY / t, 1 / t, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1,
        ], true))
    }

    multiply(matrix: Matrix) {
        const result = matrix.add(matrix.row1.multiplyByNumber(this.m01), [0, 0])
        if (!isZero(this.m10)) result.add(matrix.row0.multiplyByNumber(this.m10), [1, 0]);
        return Matrix.FromMatrix(result)
    }

    static FromMatrix(matrix: Matrix) {
        if (matrix instanceof SkewMatrix) return matrix;
        return new SkewMatrix(matrix.data)
    }
}

export class ScaleMatrix extends Matrix { // 缩放矩阵
    getInverse(): Matrix | undefined {
        return new Matrix(new NumberArray2D([4, 4], [
            1 / this.m00, 0, 0, 0,
            0, 1 / this.m11, 0, 0,
            0, 0, 1 / this.m22, 0,
            0, 0, 0, 1,
        ], true))
    }

    multiply(matrix: Matrix) {
        const sX = this.m00, sY = this.m11, sZ = this.m11
        return new Matrix(new NumberArray2D([4, 4], [
            sX * matrix.m00, sX * matrix.m01, sX * matrix.m02, sX * matrix.m03,
            sY * matrix.m10, sY * matrix.m11, sY * matrix.m12, sY * matrix.m13,
            sZ * matrix.m20, sZ * matrix.m21, sZ * matrix.m22, sZ * matrix.m23,
            0, 0, 0, 1,
        ], true))
    }

    static FromMatrix(matrix: Matrix) {
        if (matrix instanceof ScaleMatrix) return matrix;
        return new ScaleMatrix(matrix.data)
    }
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
    translateMatrix: TranslateMatrix // 平移矩阵 T
    rotateMatrix: RotateMatrix // 旋转矩阵 R
    skewMatrix: SkewMatrix // 斜切矩阵 K
    scaleMatrix: ScaleMatrix // 缩放矩阵 S

    // 分解操作的缓存
    decomposeTranslateCache: ColVector3D | undefined = undefined
    decomposeEulerCache: ColVector3D | undefined = undefined
    decomposeScaleCache: ColVector3D | undefined = undefined
    decomposeSkewCache: ColVector2D | undefined = undefined

    clearDecomposeCache() {
        this.decomposeTranslateCache = undefined
        this.decomposeEulerCache = undefined
        this.decomposeScaleCache = undefined
        this.decomposeSkewCache = undefined
    }

    _isMatrixLatest: boolean = true // matrix为最新

    get isMatrixLatest() {
        return this._isMatrixLatest
    }

    set isMatrixLatest(value: boolean) {
        if (!value) this.clearDecomposeCache();
        this._isMatrixLatest = value
    }

    _isSubMatrixLatest: boolean = true // T、R、K、S子矩阵是否为最新

    get isSubMatrixLatest() {
        return this._isSubMatrixLatest
    }

    set isSubMatrixLatest(value: boolean) {
        if (!value) this.clearDecomposeCache();
        this._isSubMatrixLatest = value
    }

    updateMatrix() { // 根据matrix分解出T、R、K、S子矩阵，或根据T、R、K、S子矩阵计算出matrix
        if (this.isMatrixLatest && this.isSubMatrixLatest) return;
        // if (!this.isMatrixLatest && !this.isSubMatrixLatest) throw new Error("矩阵数据错误：isMatrixLatest与isSubMatrixLatest同时为false");
        if (!this.isMatrixLatest) { // 根据T、R、K、S子矩阵计算matrix
            // matrix = T·R·K·S
            this.matrix = this.translateMatrix.clone().multiply(this.rotateMatrix).multiply(this.skewMatrix).multiply(this.scaleMatrix)
        } else { // 根据matrix分解T、R、K、S子矩阵
            // 平移
            this.translateMatrix = TranslateMatrix.FromMatrix(Matrix.BuildIdentity([4, 3]).insertCols(this.matrix.col(3)))

            // 斜切
            const matrix3x3 = this.matrix.clone().resize([3, 3])
            const xDotY = matrix3x3.col(0).dot(matrix3x3.col(1)) // x轴与y轴的点积
            const norm_xCrossY = (matrix3x3.col(0).cross(matrix3x3.col(1)) as Vector).norm // x轴与y轴叉积的模
            let angle = Math.atan2(norm_xCrossY, xDotY) // y轴相对x轴的夹角（逆时针为正）
            // Y轴发生了翻转
            let isYFlipped = false
            if (angle < 0) {
                isYFlipped = true
                angle += Math.PI
            }
            const skewXAngle = 0.5 * Math.PI - angle;
            const tanSkewX = Math.tan(skewXAngle)
            this.skewMatrix = SkewMatrix.FromMatrix(new Matrix(new NumberArray2D([4, 4], [
                1, tanSkewX, 0, 0,
                0, 1, 0, 0,
                0, 0, 1, 0,
                0, 0, 0, 1,
            ], true)))

            // 缩放
            const xNorm = this.matrix.col(0).norm
            const yNorm = this.matrix.col(1).norm * (isYFlipped ? -1 : 1)
            const zNorm = this.matrix.col(2).norm
            this.scaleMatrix = ScaleMatrix.FromMatrix(new Matrix(new NumberArray2D([4, 4], [
                xNorm, 0, 0, 0,
                0, yNorm / Math.sqrt(tanSkewX ** 2 + 1), 0, 0,
                0, 0, zNorm, 0,
                0, 0, 0, 1,
            ], true)))

            // 旋转
            // R = (T^-1)·Transform·(S^-1)·(K^-1)
            this.rotateMatrix = RotateMatrix.FromMatrix(
                this.translateMatrix.getInverse()!
                    .multiply(this.matrix)
                    .multiply(this.scaleMatrix.getInverse()!)
                    .multiply(this.skewMatrix.getInverse()!)
            )
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
        this.matrix = params?.matrix || Matrix.BuildIdentity([4, 4])
        this.translateMatrix = TranslateMatrix.FromMatrix(params?.subMatrix?.translate || Matrix.BuildIdentity([4, 4]))
        this.rotateMatrix = RotateMatrix.FromMatrix(params?.subMatrix?.rotate || Matrix.BuildIdentity([4, 4]))
        this.skewMatrix = SkewMatrix.FromMatrix(params?.subMatrix?.skew || Matrix.BuildIdentity([4, 4]))
        this.scaleMatrix = ScaleMatrix.FromMatrix(params?.subMatrix?.scale || Matrix.BuildIdentity([4, 4]))
        if (params?.matrix || params?.subMatrix) {
            this.isMatrixLatest = !!params?.matrix
            if (this.isMatrixLatest && hasSkewZ(this.matrix)) throw new Error("矩阵数据错误：matrix存在Z轴斜切");

            this.isSubMatrixLatest = !!params?.subMatrix
            if (this.isSubMatrixLatest && hasSkewZ(this.skewMatrix)) throw new Error("矩阵数据错误：skewMatrix存在Z轴斜切");
        }
    }

    clone(): this {
        this.updateMatrix()
        return new (this.constructor as any)({
            matrix: this.matrix.clone(),
            subMatrix: {
                translate: this.translateMatrix.clone(),
                rotate: this.rotateMatrix.clone(),
                skew: this.skewMatrix.clone(),
                scale: this.scaleMatrix.clone(),
            },
        })
    }

    transform(cols: Matrix | ColVector3D[] | Point3D[]) { // 对多个三维列向量（三维点）进行变换
        if (Array.isArray(cols)) cols = Matrix.FromCols(cols);
        const [m, n] = cols.size
        if (m !== 3) throw new Error("点必须是3维列向量");
        if (!this.isMatrixLatest) this.updateMatrix();
        return this.matrix.clone().multiply(cols.clone().insertRows(new NumberArray2D([1, n], 1))).deleteRow()
    }

    transformCol(col: ColVector3D) { // 对一个三维列向量（三维点）进行变换
        return ColVector3D.FromMatrix(this.transform(col))
    }

    // 平移
    translate(params: {
        vector: ColVector3D,
        mode?: TransformMode,
    }) {
        if (params.mode === undefined) params.mode = TransformMode.Global;

        if ((params.mode === TransformMode.Local && !this.isSubMatrixLatest)
            || (params.mode === TransformMode.Global && !this.isMatrixLatest)) {
            this.updateMatrix()
        }

        const matrix = new Matrix(new NumberArray2D([4, 4], [
            1, 0, 0, params.vector.x,
            0, 1, 0, params.vector.y,
            0, 0, 1, params.vector.z,
            0, 0, 0, 1,
        ], true))

        if (params.mode === TransformMode.Local) {
            this.translateMatrix = TranslateMatrix.FromMatrix(matrix.multiply(this.translateMatrix))
            this.isMatrixLatest = false
        } else {
            this.matrix = matrix.multiply(this.matrix)
            this.isSubMatrixLatest = false
        }

        return this
    }

    // 在本变换之前平移
    preTranslate(params: {
        vector: ColVector3D,
    }) {
        if (!this.isMatrixLatest) this.updateMatrix();

        const matrix = new Matrix(new NumberArray2D([4, 4], [
            1, 0, 0, params.vector.x,
            0, 1, 0, params.vector.y,
            0, 0, 1, params.vector.z,
            0, 0, 0, 1,
        ], true))

        this.matrix.multiply(matrix)
        this.isSubMatrixLatest = false

        return this
    }

    // 设置平移参数
    setTranslate(params: {
        vector: ColVector3D,
    }) {
        if (!this.isSubMatrixLatest) this.updateMatrix();
        this.translateMatrix = TranslateMatrix.FromMatrix(new Matrix(new NumberArray2D([4, 4], [
            1, 0, 0, params.vector.x,
            0, 1, 0, params.vector.y,
            0, 0, 1, params.vector.z,
            0, 0, 0, 1,
        ], true)))
        this.isMatrixLatest = false
        return this
    }

    // 缩放
    scale(params: {
        vector: ColVector3D,
        mode?: TransformMode,
    }) {
        if (params.mode === undefined) params.mode = TransformMode.Global;

        if ((params.mode === TransformMode.Local && !this.isSubMatrixLatest)
            || (params.mode === TransformMode.Global && !this.isMatrixLatest)) {
            this.updateMatrix()
        }

        const matrix = new Matrix(new NumberArray2D([4, 4], [
            params.vector.x, 0, 0, 0,
            0, params.vector.y, 0, 0,
            0, 0, params.vector.z, 0,
            0, 0, 0, 1,
        ], true))

        if (params.mode === TransformMode.Local) {
            this.scaleMatrix = ScaleMatrix.FromMatrix(matrix.multiply(this.scaleMatrix))
            this.isMatrixLatest = false
        } else {
            this.matrix = matrix.multiply(this.matrix)
            this.isSubMatrixLatest = false
        }

        return this
    }

    // 设置缩放参数
    setScale(params: {
        vector: ColVector3D,
    }) {
        if (!this.isSubMatrixLatest) this.updateMatrix();
        this.scaleMatrix = ScaleMatrix.FromMatrix(new Matrix(new NumberArray2D([4, 4], [
            params.vector.x, 0, 0, 0,
            0, params.vector.y, 0, 0,
            0, 0, params.vector.z, 0,
            0, 0, 0, 1,
        ], true)))
        this.isMatrixLatest = false
        return this
    }

    // 绕x轴旋转
    rotateX(params: {
        angle: number,
        mode?: TransformMode,
    }) {
        if (params.mode === undefined) params.mode = TransformMode.Global;

        if ((params.mode === TransformMode.Local && !this.isSubMatrixLatest)
            || (params.mode === TransformMode.Global && !this.isMatrixLatest)) {
            this.updateMatrix()
        }

        const sin = Math.sin(params.angle)
        const cos = Math.cos(params.angle)
        const matrix = new Matrix(new NumberArray2D([4, 4], [
            1, 0, 0, 0,
            0, cos, -sin, 0,
            0, sin, cos, 0,
            0, 0, 0, 1,
        ], true))

        if (params.mode === TransformMode.Local) {
            this.rotateMatrix = RotateMatrix.FromMatrix(matrix.multiply(this.rotateMatrix))
            this.isMatrixLatest = false
        } else {
            this.matrix = matrix.multiply(this.matrix)
            this.isSubMatrixLatest = false
        }

        return this
    }

    // 绕y轴旋转
    rotateY(params: {
        angle: number,
        mode?: TransformMode,
    }) {
        if (params.mode === undefined) params.mode = TransformMode.Global;

        if ((params.mode === TransformMode.Local && !this.isSubMatrixLatest)
            || (params.mode === TransformMode.Global && !this.isMatrixLatest)) {
            this.updateMatrix()
        }

        const sin = Math.sin(params.angle)
        const cos = Math.cos(params.angle)
        const matrix = new Matrix(new NumberArray2D([4, 4], [
            cos, 0, sin, 0,
            0, 1, 0, 0,
            -sin, 0, cos, 0,
            0, 0, 0, 1,
        ], true))

        if (params.mode === TransformMode.Local) {
            this.rotateMatrix = RotateMatrix.FromMatrix(matrix.multiply(this.rotateMatrix))
            this.isMatrixLatest = false
        } else {
            this.matrix = matrix.multiply(this.matrix)
            this.isSubMatrixLatest = false
        }

        return this
    }

    // 绕z轴旋转
    rotateZ(params: {
        angle: number,
        mode?: TransformMode,
    }) {
        if (params.mode === undefined) params.mode = TransformMode.Global;

        if ((params.mode === TransformMode.Local && !this.isSubMatrixLatest)
            || (params.mode === TransformMode.Global && !this.isMatrixLatest)) {
            this.updateMatrix()
        }

        const sin = Math.sin(params.angle)
        const cos = Math.cos(params.angle)
        const matrix = new Matrix(new NumberArray2D([4, 4], [
            cos, -sin, 0, 0,
            sin, cos, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1,
        ], true))

        if (params.mode === TransformMode.Local) {
            this.rotateMatrix = RotateMatrix.FromMatrix(matrix.multiply(this.rotateMatrix))
            this.isMatrixLatest = false
        } else {
            this.matrix = matrix.multiply(this.matrix)
            this.isSubMatrixLatest = false
        }

        return this
    }

    // 绕任意轴旋转，axis为旋转轴
    rotate(params: {
        axis?: ColVector3D,
        angle: number,
        mode?: TransformMode,
    }) {
        if (params.mode === undefined) params.mode = TransformMode.Global;

        if (params.axis === undefined) params.axis = new ColVector([0, 0, 1]);
        params.axis = params.axis.normalize() // axis化为单位向量

        if ((params.mode === TransformMode.Local && !this.isSubMatrixLatest)
            || (params.mode === TransformMode.Global && !this.isMatrixLatest)) {
            this.updateMatrix()
        }

        let [x, y, z] = params.axis.rawData
        z = -z // z轴方向定义相反
        const c = Math.cos(params.angle)
        const s = Math.sin(params.angle)
        const t = 1 - c
        // https://developer.mozilla.org/en-US/docs/Web/CSS/transform-function/rotate3d#syntax
        const matrix = new Matrix(new NumberArray2D([4, 4], [
            1 + t * (x ** 2 - 1), z * s + x * y * t, -y * s + x * z * t, 0,
            -z * s + x * y * t, 1 + t * (y ** 2 - 1), x * s + y * z * t, 0,
            y * s + x * z * t, -x * s + y * z * t, 1 + t * (z ** 2 - 1), 0,
            0, 0, 0, 1,
        ], true))

        if (params.mode === TransformMode.Local) {
            this.rotateMatrix = RotateMatrix.FromMatrix(matrix.multiply(this.rotateMatrix))
            this.isMatrixLatest = false
        } else {
            this.matrix = matrix.multiply(this.matrix)
            this.isSubMatrixLatest = false
        }

        return this
    }

    // 绕任意不过原点的轴旋转，axis为旋转轴，point为旋转轴上的一点
    rotateAt(params: {
        axis?: ColVector3D,
        point?: Point3D,
        angle: number,
        mode?: TransformMode,
    }) {
        if (params.mode === undefined) params.mode = TransformMode.Global;
        if ((params.mode === TransformMode.Local && !this.isSubMatrixLatest)
            || (params.mode === TransformMode.Global && !this.isMatrixLatest)) {
            this.updateMatrix()
        }

        if (params.point === undefined) params.point = new Point3D([0, 0, 0]);

        if (params.mode === TransformMode.Local) {
            this.rotateMatrix.col3 = this.rotateMatrix.col3.subtract(params.point)
            this.rotate(params)
            this.rotateMatrix.col3 = this.rotateMatrix.col3.add(params.point)

            const diffTranslate = this.rotateMatrix.col(3)
            this.rotateMatrix.col3 = new ColVector([0, 0, 0, 1])

            this.translate({
                vector: diffTranslate,
            })
        } else {
            this.updateMatrix()
            this.translate({
                vector: params.point.getNegate() as ColVector3D,
                mode: TransformMode.Local,
            })
            this.updateMatrix()
            this.rotate(params)
            this.updateMatrix()
            this.translate({
                vector: params.point,
                mode: TransformMode.Local,
            })
            this.updateMatrix()
        }


        return this
    }

    // 设置旋转参数（欧拉角（ZXY序）：先绕y轴旋转，再绕x轴旋转，最后绕z轴旋转）
    // https://en.wikipedia.org/wiki/Euler_angles
    // x、y、z分别对应维基百科中的β、γ、α
    setRotate(params: {
        euler: ColVector3D,
    }) {
        if (!this.isSubMatrixLatest) this.updateMatrix();
        const [x, y, z] = params.euler.rawData
        const c2 = Math.cos(x), s2 = Math.sin(x)
        const c3 = Math.cos(y), s3 = Math.sin(y)
        const c1 = Math.cos(z), s1 = Math.sin(z)
        this.rotateMatrix = RotateMatrix.FromMatrix(new Matrix(new NumberArray2D([4, 4], [
            c1 * c3 - s1 * s2 * s3, -c2 * s1, c1 * s3 + c3 * s1 * s2, 0,
            c3 * s1 + c1 * s2 * s3, c1 * c2, s1 * s3 - c1 * c3 * s2, 0,
            -c2 * s3, s2, c2 * c3, 0,
            0, 0, 0, 1,
        ], true)))
        this.isMatrixLatest = false
        return this
    }

    setRotateZ(angle: number) { // 仅绕z轴旋转
        return this.setRotate({
            euler: new ColVector3D([0, 0, angle]),
        })
    }

    hasRotation() { // 判断是否有旋转
        if (!this.isSubMatrixLatest) this.updateMatrix();
        return !this.rotateMatrix.isIdentity
    }

    // 斜切
    skew(params: {
        skewAngle: ColVector2D,
        mode?: TransformMode,
    }) {
        if (params.mode === undefined) params.mode = TransformMode.Global;
        if ((params.mode === TransformMode.Local && !this.isSubMatrixLatest)
            || (params.mode === TransformMode.Global && !this.isMatrixLatest)) {
            this.updateMatrix()
        }

        // https://developer.mozilla.org/en-US/docs/Web/CSS/transform-function/skew#syntax
        const matrix = new Matrix(new NumberArray2D([4, 4], [
            1, Math.tan(params.skewAngle.x), 0, 0,
            Math.tan(params.skewAngle.y), 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1,
        ], true))

        if (params.mode === TransformMode.Local) {
            this.skewMatrix = SkewMatrix.FromMatrix(matrix.multiply(this.skewMatrix))
            this.isMatrixLatest = false
        } else {
            this.matrix = matrix.multiply(this.matrix)
            this.isSubMatrixLatest = false
        }

        return this
    }

    // 设置斜切参数
    setSkew(params: {
        skewAngle: ColVector2D,
    }) {
        if (!this.isSubMatrixLatest) this.updateMatrix();
        // https://developer.mozilla.org/en-US/docs/Web/CSS/transform-function/skew#syntax
        this.skewMatrix = SkewMatrix.FromMatrix(new Matrix(new NumberArray2D([4, 4], [
            1, Math.tan(params.skewAngle.x), 0, 0,
            Math.tan(params.skewAngle.y), 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1,
        ], true)))
        this.isMatrixLatest = false
        return this
    }

    hasSkew() { // 判断是否有斜切
        if (!this.isSubMatrixLatest) this.updateMatrix();
        return !this.skewMatrix.isIdentity
    }

    addTransform(transform: Transform) { // 叠加另一个变换（先执行本变换，再执行另一个变换）
        if (!transform.isMatrixLatest) transform.updateMatrix();
        if (!this.isMatrixLatest) this.updateMatrix();
        this.matrix = transform.matrix.clone().multiply(this.matrix)
        this.isSubMatrixLatest = false
        return this
    }

    addPreTransform(transform: Transform) { // 叠加另一个变换（先执行另一个变换，再执行本变换）
        if (!transform.isMatrixLatest) transform.updateMatrix();
        if (!this.isMatrixLatest) this.updateMatrix();
        this.matrix = this.matrix.clone().multiply(transform.matrix)
        this.isSubMatrixLatest = false
        return this
    }

    flipH() { // 水平翻转
        return this.scale({
            vector: new ColVector3D([-1, 1, 1]),
            mode: TransformMode.Local,
        })
    }

    setFlipH(value: boolean) { // 设置水平翻转
        if (!this.isSubMatrixLatest) this.updateMatrix();
        const isFlipH = this.scaleMatrix.m00 < 0
        if (value === isFlipH) return this;
        return this.flipH()
    }

    get isFlipH() { // 是否水平翻转
        if (!this.isSubMatrixLatest) this.updateMatrix();
        return this.scaleMatrix.m00 < 0
    }

    flipV() { // 垂直翻转
        return this.scale({
            vector: new ColVector3D([1, -1, 1]),
            mode: TransformMode.Local,
        })
    }

    setFlipV(value: boolean) { // 设置垂直翻转
        if (!this.isSubMatrixLatest) this.updateMatrix();
        const isFlipV = this.scaleMatrix.m11 < 0
        if (value === isFlipV) return this;
        return this.flipV()
    }

    get isFlipV() { // 是否垂直翻转
        if (!this.isSubMatrixLatest) this.updateMatrix();
        return this.scaleMatrix.m11 < 0
    }

    decomposeTranslate() { // 分解平移参数
        if (this.decomposeTranslateCache !== undefined) return this.decomposeTranslateCache;
        if (!this.isSubMatrixLatest) this.updateMatrix();
        const matrix = this.isMatrixLatest ? this.matrix : this.translateMatrix
        this.decomposeTranslateCache = matrix.col3.deleteRow()
        return this.decomposeTranslateCache
    }

    decomposeEuler() { // 分解欧拉角（ZXY序）参数
        if (this.decomposeEulerCache !== undefined) return this.decomposeEulerCache;
        if (!this.isSubMatrixLatest) this.updateMatrix();
        this.decomposeEulerCache = Transform.DecomposeEuler(this.rotateMatrix)
        return this.decomposeEulerCache
    }

    decomposeScale() { // 分解缩放参数
        if (this.decomposeScaleCache !== undefined) return this.decomposeScaleCache;
        if (!this.isSubMatrixLatest) this.updateMatrix();
        this.decomposeScaleCache = new ColVector3D([this.scaleMatrix.m00, this.scaleMatrix.m11, this.scaleMatrix.m22])
        return this.decomposeScaleCache
    }

    decomposeSkew() { // 分解斜切参数
        if (this.decomposeSkewCache !== undefined) return this.decomposeSkewCache;
        if (!this.isSubMatrixLatest) this.updateMatrix();
        this.decomposeSkewCache = new ColVector2D([Math.atan(this.skewMatrix.m01), Math.atan(this.skewMatrix.m10)])
        return this.decomposeSkewCache
    }

    // 旋转矩阵转欧拉角
    // 欧拉角的“序”与实际操作顺序相反，例如ZXY序指的是先绕y轴旋转，再绕x轴旋转，最后绕z轴旋转
    // https://en.wikipedia.org/wiki/Euler_angles
    // x、y、z分别对应维基百科中的β、γ、α
    // https://zhuanlan.zhihu.com/p/45404840?from=groupmessage
    static DecomposeEuler(matrix: Matrix) { // 通过旋转矩阵分解出欧拉角（ZXY序），返回值的单位为弧度
        const x = Math.asin(matrix.m21)
        let y, z
        if (x === Math.PI / 2 || x === -Math.PI / 2) {
            y = Math.atan2(matrix.m10, matrix.m00)
            z = 0
        } else {
            y = Math.atan2(-matrix.m20, matrix.m22)
            z = Math.atan2(-matrix.m01, matrix.m11)
        }
        return new ColVector3D([x, y, z])
    }

    decompose() { // 分解出平移、欧拉角（ZXY序）、缩放、斜切的参数
        return {
            translate: this.decomposeTranslate(),
            rotate: this.decomposeEuler(),
            scale: this.decomposeScale(),
            skew: this.decomposeSkew(),
        }
    }

    clearRotation() { // 清除旋转操作
        if (!this.isSubMatrixLatest) this.updateMatrix();
        this.rotateMatrix = RotateMatrix.FromMatrix(Matrix.BuildIdentity([4, 4]))
        this.isMatrixLatest = false
        return this
    }

    clearSkew() { // 清除斜切操作
        if (!this.isSubMatrixLatest) this.updateMatrix();
        this.skewMatrix = SkewMatrix.FromMatrix(Matrix.BuildIdentity([4, 4]))
        this.isMatrixLatest = false
        return this
    }

    clearScale() { // 清除缩放操作
        if (!this.isSubMatrixLatest) this.updateMatrix();
        this.scaleMatrix = ScaleMatrix.FromMatrix(Matrix.BuildIdentity([4, 4]))
        this.isMatrixLatest = false
        return this
    }

    clearRKS() { // 清除旋转、斜切、缩放操作
        if (!this.isSubMatrixLatest) this.updateMatrix();
        this.rotateMatrix = RotateMatrix.FromMatrix(Matrix.BuildIdentity([4, 4]))
        this.skewMatrix = SkewMatrix.FromMatrix(Matrix.BuildIdentity([4, 4]))
        this.scaleMatrix = ScaleMatrix.FromMatrix(Matrix.BuildIdentity([4, 4]))
        this.isMatrixLatest = false
        return this
    }

    clearTranslate() { // 清除平移操作
        if (!this.isSubMatrixLatest) this.updateMatrix();
        this.translateMatrix = TranslateMatrix.FromMatrix(Matrix.BuildIdentity([4, 4]))
        this.isMatrixLatest = false
        return this
    }

    makeFromRotateMatrix() { // 根据rotateMatrix构建新的Transform
        return new Transform({
            matrix: this.rotateMatrix.clone(),
        })
    }

    makeFromTranslateMatrix() { // 根据translateMatrix构建新的Transform
        return new Transform({
            matrix: this.translateMatrix.clone(),
        })
    }

    makeFromSkewMatrix() { // 根据skewMatrix构建新的Transform
        return new Transform({
            matrix: this.skewMatrix.clone(),
        })
    }

    makeFromScaleMatrix() { // 根据scaleMatrix构建新的Transform
        return new Transform({
            matrix: this.scaleMatrix.clone(),
        })
    }

    toString() {
        if (!this.isMatrixLatest) this.updateMatrix();
        return this.matrix.toString()
    }
}
