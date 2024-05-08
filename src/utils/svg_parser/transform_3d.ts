import { buildIdentityArray, Matrix } from "./matrix"
import {NumberArray2D} from "./number_array"

export enum TransformMode { // 变换模式
    Local, // 相对坐标系变换，缩放、旋转、平移之间互不影响
    LocalTranslate, // 相对坐标系变换，平移会受到旋转、缩放的影响
    LocalSpecialOrigin, // 相对坐标系变换，支持指定origin原点属性，进行旋转、缩放时会基于该原点进行
    Global, // 全局坐标系变换，缩放、旋转、平移之间相互影响。使用全局坐标系变换时，会使整个Transform3D对象变为全局坐标系变换（isLocalTransform=false），不可逆
}

export type TransformParams = {
    transformMode?: TransformMode,
    origin?: { x: number, y: number, z: number }, // 指定原点，仅在transformMode为LocalSpecialOrigin时有效
}

export class Transform3D { // 变换
    /** 变换矩阵
     * | a b c tx |         |         |   |
     * | d e f ty | ------> |   R·S   | T |
     * | g h i tz | ------> |_________|___|
     * | 0 0 0 1  |         |    0    | 1 |
     */
    matrix: Matrix

    // 是否为相对坐标系变换
    // 相对坐标系变换：每次基本变换（缩放、旋转、平移等）都相对于图形自身的坐标系进行，缩放、旋转、平移之间互不影响
    // 相对坐标系变换顺序：缩放、旋转、平移 -> Transform = T·R·S
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
        return this.matrix.multiply(points.insertRows(Matrix.build(1, n, 1))).resize(3, n)
    }

    transformPoint(x: number, y: number, z: number) { // 对一个三维点（列向量）进行变换
        return this.transform(Matrix.ColVec3D(x, y, z)).toXYZ()
    }

    translate(x: number, y: number, z: number) { // 平移，会修改原变换
        const matrix = new Matrix(new NumberArray2D([4, 4], [
            1, 0, 0, x,
            0, 1, 0, y,
            0, 0, 1, z,
            0, 0, 0, 1,
        ]))
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
        const matrix = new Matrix(new NumberArray2D([4, 4], [
            xScale, 0, 0, 0,
            0, yScale, 0, 0,
            0, 0, zScale, 0,
            0, 0, 0, 1,
        ]))
        if (transformParams.transformMode === TransformMode.Global) {
            this.updateMatrix()
            this.isLocalTransform = false
            this.matrix = matrix.multiply(this.matrix)
            return this
        }
        this.scaleMatrix = matrix.multiply(this.scaleMatrix)
        if (transformParams.transformMode === TransformMode.LocalTranslate) {
            this.translateMatrix = matrix.multiply(this.translateMatrix).col(3).insertCols(Matrix.buildIdentity(4, 3), 0)
        } else if (transformParams.transformMode === TransformMode.LocalSpecialOrigin) {
            const origin = transformParams.origin || { x: 0, y: 0, z: 0 }
            const originCol = Matrix.ColVec([origin.x, origin.y, origin.z, 1])
            const originCol2 = matrix.multiply(originCol)
            const originDiffCol = originCol2.subtract(originCol)
            this.translateMatrix = this.translateMatrix.add(originDiffCol, 0, 3)
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
            this.translateMatrix = matrix.multiply(this.translateMatrix).col(3).insertCols(Matrix.buildIdentity(4, 3), 0)
        } else if (transformParams.transformMode === TransformMode.LocalSpecialOrigin) {
            const origin = transformParams.origin || { x: 0, y: 0, z: 0 }
            const originCol = Matrix.ColVec([origin.x, origin.y, origin.z, 1])
            const originCol2 = matrix.multiply(originCol)
            const originDiffCol = originCol2.subtract(originCol)
            this.translateMatrix = this.translateMatrix.add(originDiffCol, 0, 3)
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
        const matrix = new Matrix(new NumberArray2D([4, 4], [
            1, 0, 0, 0,
            0, cos, -sin, 0,
            0, sin, cos, 0,
            0, 0, 0, 1,
        ]))
        return this._rotate(matrix, transformParams)
    }

    // 绕y轴旋转，会修改原变换
    rotateY(angle: number, transformParams: TransformParams = {
        transformMode: TransformMode.Local
    }) {
        const sin = Math.sin(angle)
        const cos = Math.cos(angle)
        const matrix = new Matrix(new NumberArray2D([4, 4], [
            cos, 0, sin, 0,
            0, 1, 0, 0,
            -sin, 0, cos, 0,
            0, 0, 0, 1,
        ]))
        return this._rotate(matrix, transformParams)
    }

    // 绕z轴旋转，会修改原变换
    rotateZ(angle: number, transformParams: TransformParams = {
        transformMode: TransformMode.Local
    }) {
        const sin = Math.sin(angle)
        const cos = Math.cos(angle)
        const matrix = new Matrix(new NumberArray2D([4, 4], [
            cos, -sin, 0, 0,
            sin, cos, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1,
        ]))
        return this._rotate(matrix, transformParams)
    }

    // 绕任意轴旋转，axis为旋转轴的单位向量，会修改原变换
    rotate(axis: Matrix, angle: number, transformParams: TransformParams = {
        transformMode: TransformMode.Local
    }) {
        if (axis.dimension[0] !== 3 || axis.dimension[1] !== 1) throw new Error("旋转轴必须是3维向量");
        axis = axis.normalize() // axis化为单位向量
        const [x, y, z] = axis.data.data
        const c = Math.cos(angle)
        const s = Math.sin(angle)
        const t = 1 - c
        const matrix = new Matrix(new NumberArray2D([4, 4], [
            t * x * x + c, t * x * y - s * z, t * x * z + s * y, 0,
            t * x * y + s * z, t * y * y + c, t * y * z - s * x, 0,
            t * x * z - s * y, t * y * z + s * x, t * z * z + c, 0,
            0, 0, 0, 1,
        ]))
        return this._rotate(matrix, transformParams)
    }

    // 绕任意不过原点的轴旋转，axis为旋转轴的单位向量，point为旋转轴上的一点，会修改原变换
    rotateAt(axis: Matrix, point: Matrix, angle: number) {
        if (axis.dimension[0] !== 3 || axis.dimension[1] !== 1) throw new Error("旋转轴必须是3维向量");
        if (point.dimension[0] !== 3 || point.dimension[1] !== 1) throw new Error("旋转轴上的点必须是3维向量");
        this.rotate(axis, angle, {
            transformMode: TransformMode.LocalSpecialOrigin,
            origin: {
                x: point.data.get([0, 0]) - this.translateMatrix.data.get([0, 3]),
                y: point.data.get([1, 0]) - this.translateMatrix.data.get([1, 3]),
                z: point.data.get([2, 0]) - this.translateMatrix.data.get([2, 3]),
            },
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
            x: m.get([0, 3]),
            y: m.get([1, 3]),
            z: m.get([2, 3]),
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
            x: this.scaleMatrix.data.get([0, 0]),
            y: this.scaleMatrix.data.get([1, 1]),
            z: this.scaleMatrix.data.get([2, 2]),
        }
    }

    // 旋转矩阵转欧拉角
    // 维基百科：https://en.wikipedia.org/wiki/Euler_angles
    // 欧拉角的“序”与实际操作顺序相反，例如ZXY序指的是先绕y轴旋转，再绕x轴旋转，最后绕z轴旋转
    // https://zhuanlan.zhihu.com/p/45404840?from=groupmessage
    static decomposeEulerZXY(matrix: Matrix) { // 通过旋转矩阵分解出欧拉角（ZXY序），返回值的单位为弧度
        const m = matrix.data
        const x = Math.asin(m.get([2, 1]))
        let y, z
        if (x === Math.PI / 2 || x === -Math.PI / 2) {
            y = Math.atan2(m.get([1, 0]), m.get([0, 0]))
            z = 0
        } else {
            y = Math.atan2(-m.get([2, 0]), m.get([2, 2]))
            z = Math.atan2(-m.get([0, 1]), m.get([1, 1]))
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
            this.matrix.data.set([0, 3], 0)
            this.matrix.data.set([1, 3], 0)
            this.matrix.data.set([2, 3], 0)
            return this
        }
        this.translateMatrix.data.set([0, 3], 0)
        this.translateMatrix.data.set([1, 3], 0)
        this.translateMatrix.data.set([2, 3], 0)
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
