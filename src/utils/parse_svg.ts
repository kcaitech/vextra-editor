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

function buildIdentityArray(n: number) { // 构建n阶单位数组
    const result = buildArray(n, n, 0)
    for (let i = 0; i < n; i++) result[i][i] = 1;
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

    static colVec(data: number[]) { // 列向量
        return new Matrix(data.map(item => [item]))
    }

    static rowVec(data: number[]) { // 行向量
        return new Matrix([data])
    }

    copy() {
        return new Matrix(this.data.map(item => item.slice()))
    }

    get dimension() { // 矩阵的阶数
        return [this.data.length, this.data[0].length]
    }

    get isSquare() { // 判断是否为方阵
        const [m, n] = this.dimension
        return m === n
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
        return new Matrix(result)
    }

    transpose() { // 转置，不修改原矩阵，返回新矩阵
        const [m, n] = this.dimension
        const result: number[][] = buildArray(n, m)
        for (let i = 0; i < m; i++) {
            for (let j = 0; j < n; j++) {
                result[j][i] = this.data[i][j]
            }
        }
        return new Matrix(result)
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
        return new Matrix(result)
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

    determinant(): number | undefined { // 求矩阵的行列式（递归法）
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

    adjoint(): Matrix | undefined { // 求矩阵的伴随矩阵（递归法）
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
        return new Matrix(result)
    }

    toString() { // 转为字符串
        return this.data.map(item => item.join(",")).join("\n")
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
        this.matrix = matrix || new Matrix(buildIdentityArray(4))
    }

    translate(x: number, y: number, z: number) { // 平移
        const matrix = new Matrix([
            [1, 0, 0, x],
            [0, 1, 0, y],
            [0, 0, 1, z],
            [0, 0, 0, 1],
        ])
        this.matrix = matrix.multiply(this.matrix)
    }

    scale(xScale: number, yScale: number, zScale: number) { // 缩放
        const matrix = new Matrix([
            [xScale, 0, 0, 0],
            [0, yScale, 0, 0],
            [0, 0, zScale, 0],
            [0, 0, 0, 1],
        ])
        this.matrix = matrix.multiply(this.matrix)
    }

    rotateX(angle: number) { // 绕x轴旋转
        const sin = Math.sin(angle)
        const cos = Math.cos(angle)
        const matrix = new Matrix([
            [1, 0, 0, 0],
            [0, cos, -sin, 0],
            [0, sin, cos, 0],
            [0, 0, 0, 1],
        ])
        this.matrix = matrix.multiply(this.matrix)
    }

    rotateY(angle: number) { // 绕y轴旋转
        const sin = Math.sin(angle)
        const cos = Math.cos(angle)
        const matrix = new Matrix([
            [cos, 0, sin, 0],
            [0, 1, 0, 0],
            [-sin, 0, cos, 0],
            [0, 0, 0, 1],
        ])
        this.matrix = matrix.multiply(this.matrix)
    }

    rotateZ(angle: number) { // 绕z轴旋转
        const sin = Math.sin(angle)
        const cos = Math.cos(angle)
        const matrix = new Matrix([
            [cos, -sin, 0, 0],
            [sin, cos, 0, 0],
            [0, 0, 1, 0],
            [0, 0, 0, 1],
        ])
        this.matrix = matrix.multiply(this.matrix)
    }

    rotate(axis: Matrix, angle: number) { // 绕任意轴旋转，axis为旋转轴的单位向量
        if (axis.dimension[0] !== 3 || axis.dimension[1] !== 1) throw new Error("旋转轴必须是3维向量");
        const [x, y, z] = axis.data.map(item => item[0])
        const c = Math.cos(angle)
        const s = Math.sin(angle)
        const t = 1 - c
        const matrix = new Matrix([
            [t * x * x + c, t * x * y - s * z, t * x * z + s * y, 0],
            [t * x * y + s * z, t * y * y + c, t * y * z - s * x, 0],
            [t * x * z - s * y, t * y * z + s * x, t * z * z + c, 0],
            [0, 0, 0, 1],
        ])
        this.matrix = matrix.multiply(this.matrix)
    }

    rotateAt(axis: Matrix, point: Matrix, angle: number) { // 绕任意旋转点和旋转轴旋转，axis为旋转轴的单位向量，point为旋转点
        this.translate(-point.data[0][0], -point.data[1][0], -point.data[2][0])
        this.rotate(axis, angle)
        this.translate(point.data[0][0], point.data[1][0], point.data[2][0])
    }

    addTransform(transform: Transform3D) { // 叠加另一个变换（先执行本变换，再执行另一个变换）
        this.matrix = transform.matrix.multiply(this.matrix)
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
            ]),
            rotate: new Matrix([
                [m[0][0] / sx, m[1][0] / sy, m[2][0] / sz, 0],
                [m[0][1] / sx, m[1][1] / sy, m[2][1] / sz, 0],
                [m[0][2] / sx, m[1][2] / sy, m[2][2] / sz, 0],
                [0, 0, 0, 1],
            ]),
            scale: new Matrix([
                [sx, 0, 0, 0],
                [0, sy, 0, 0],
                [0, 0, sz, 0],
                [0, 0, 0, 1],
            ]),
        }
    }

    static decomposeEulerYXZ(matrix: Matrix) { // 旋转矩阵分解出欧拉角（YXZ顺序），返回值的单位为弧度
        const m = matrix.data
        const sy = Math.sqrt(m[0][0] ** 2 + m[1][0] ** 2)
        const singular = sy < 1e-6
        let x, y, z
        if (!singular) {
            x = Math.atan2(m[2][1], m[2][2])
            y = Math.atan2(-m[2][0], sy)
            z = Math.atan2(m[1][0], m[0][0])
        } else {
            x = Math.atan2(-m[1][2], m[1][1])
            y = Math.atan2(-m[2][0], sy)
            z = 0
        }
        return {
            x: x,
            y: y,
            z: z,
        }
    }

    decomposeToEulerYXZ() { // 分解出平移、欧拉角（YXZ顺序）、缩放矩阵
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

    toString() {
        return this.matrix.toString()
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
    for(;;) {
        const match = regexp.exec(content)
        if (!match) break;
        result.push([match[1], match[2]])
    }
    return result
}

function parseTransform(transform: string) {
    const functionCalls = getAllFunctionCallFromString(transform)
    const transform3D = new Transform3D()
    for (const [name, args] of functionCalls) {
        const argList = args.split(",")
        if (name === "translate") {
            transform3D.translate(parseFloat(argList[0]), parseFloat(argList[1]), parseFloat(argList[2] || "0"))
        } else if (name === "scale") {
            transform3D.scale(parseFloat(argList[0]), parseFloat(argList[1]), parseFloat(argList[2] || "1"))
        } else if (name === "rotate") {
            transform3D.rotateZ(parseFloat(argList[0]) * Math.PI / 180)
        } else if (name === "rotateX") {
            transform3D.rotateX(parseFloat(argList[0]) * Math.PI / 180)
        } else if (name === "rotateY") {
            transform3D.rotateY(parseFloat(argList[0]) * Math.PI / 180)
        } else if (name === "rotateZ") {
            transform3D.rotateZ(parseFloat(argList[0]) * Math.PI / 180)
        } else if (name === "rotate3d") {
            transform3D.rotate(Matrix.colVec([parseFloat(argList[0]), parseFloat(argList[1]), parseFloat(argList[2])]), parseFloat(argList[3]) * Math.PI / 180)
        } else if (name === "matrix") {
            const matrix = new Matrix([
                [parseFloat(argList[0]), parseFloat(argList[2]), 0, parseFloat(argList[4])],
                [parseFloat(argList[1]), parseFloat(argList[3]), 0, parseFloat(argList[5])],
                [0, 0, 1, 0],
                [0, 0, 0, 1],
            ])
            transform3D.addTransform(new Transform3D(matrix))
        } else {
            console.log("不支持的变换函数", name, args)
        }
    }
    return transform3D.decomposeToEulerYXZ()
}

type Attributes = { // 从元素的attributes中解析出来的属性
    x?: number,
    y?: number,
    width?: number,
    height?: number,
}

// 将父元素的属性合并到子元素
function mergeAttributes(parent: BaseShapeCreator, child: BaseShapeCreator) {
    const parentShape = parent.shape
    const childShape = child.shape
    if (!parentShape || !childShape) return;

    // 合并xy
    const parentFrame = parentShape.frame
    const childFrame = childShape.frame
    childFrame.x += parentFrame.x
    childFrame.y += parentFrame.y
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

    attributes: Attributes = {}

    constructor(root: BaseShapeCreator | undefined, parent: BaseShapeCreator | undefined, svgRoot: Element, svgNode: Element) {
        this.root = root
        this.parent = parent
        this.svgRoot = svgRoot
        this.svgNode = svgNode
        this.svgNodeTagName = svgNode.tagName
        this.parseAttributes()
        this.shape = this.create()
        if (this.shape) {
            this.shape.frame.x = this.attributes.x || 0
            this.shape.frame.y = this.attributes.y || 0
            if (this.parent instanceof SvgShapeCreator && this.parent.viewBox) {
                this.shape.frame.x -= this.parent.viewBox[0]
                this.shape.frame.y -= this.parent.viewBox[1]
            }
        }
    }

    make(): BaseShapeCreator {
        return this
    }

    parseAttributes() {
        const transform = this.svgNode.getAttribute("transform")
        if (transform) {
            console.log("transform", transform)
            const { translate, rotate, scale } = parseTransform(transform)
            this.attributes.x = translate.x
            this.attributes.y = translate.y
            console.log(translate, rotate, scale)
        }

        const width = this.svgNode.getAttribute("width")
        if (width) this.attributes.width = parseFloat(width);
        const height = this.svgNode.getAttribute("height")
        if (height) this.attributes.height = parseFloat(height);

        console.log(this.svgNodeTagName, this.attributes)
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
        const childrenShapes = this.children.filter(item => item.shape).map(item => item.shape!)
        if (childrenShapes.length === 0) {
            this.shape = undefined
            return
        }
        if (childrenShapes.length === 1) {
            const childShape = childrenShapes[0]
            mergeAttributes(this, this.children[0])
            this.shape = childShape
            return
        }

        const groupShape = this.shape as GroupShape
        groupShape.childs.push(...childrenShapes)

        let ltX = groupShape.frame.x
        let ltY = groupShape.frame.y
        let rbX = groupShape.frame.x + groupShape.frame.width
        let rbY = groupShape.frame.y + groupShape.frame.height
        for (const item of childrenShapes) {
            const itemLtX = ltX + item.frame.x
            const itemLtY = ltY + item.frame.y
            const itemRbX = ltX + item.frame.x + item.frame.width
            const itemRbY = ltY + item.frame.y + item.frame.height
            if (itemLtX < ltX) ltX = itemLtX;
            if (itemLtY < ltY) ltY = itemLtY;
            if (itemRbX > rbX) rbX = itemRbX;
            if (itemRbY > rbY) rbY = itemRbY;
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
        const childrenShapes = this.children.filter(item => item.shape).map(item => item.shape!)
        if (childrenShapes.length === 0) {
            this.shape = undefined
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
