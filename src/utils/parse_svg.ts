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
                if (!Number.isInteger(data[i][j])) data[i][j] = 0;
            }
        }
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

    multiply(matrix: Matrix) { // 矩阵相乘，右乘，不修改原矩阵，返回新矩阵
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

    toString() { // 转为字符串
        return this.data.map(item => item.join(",")).join("\n")
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
    let match
    while (match = regexp.exec(content)) {
        result.push([match[1], match[2]])
    }
    return result
}

class TransformParser { // 解析transform属性
    /** 变换矩阵
     * | a b tx |
     * | c d ty |
     * | 0 0 1  |
     */
    matrix: number[][] = [
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1],
    ]

    functionCalls: FunctionCall[] = []

    constructor(transform: string) {
        this.functionCalls = getAllFunctionCallFromString(transform)
        this.parse()
    }

    parseMatrix(args: string) {
        const values = args.split(",").map(item => parseFloat(item))
        if (values.length === 6) {
            this.matrix = [
                [values[0], values[2], values[4]],
                [values[1], values[3], values[5]],
                [0, 0, 1],
            ]
        }
    }

    parseTranslate(args: string) {
        const values = args.split(",").map(item => parseFloat(item))
        if (values.length === 1) {
            this.matrix[0][2] += values[0]
            this.matrix[1][2] += values[0]
        }
    }

    parse() {
        for (const [name, args] of this.functionCalls) {
            if (name === "matrix") {
                this.parseMatrix(args)
            } else {
                console.log("未知的transform函数", name, args)
            }
        }
    }
}

function parseTranslate(translate: string): {
    x: number | undefined,
    y: number | undefined,
} {
    const regexp = /translate\(([\d.]+?),([\d.]+?)\)/
    const match = translate.match(regexp)
    if (!match) return { x: undefined, y: undefined }
    return { x: parseFloat(match[1]), y: parseFloat(match[2]) }
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
            const { x, y } = parseTranslate(transform)
            this.attributes.x = x
            this.attributes.y = y
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
