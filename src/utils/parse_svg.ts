import { Context } from "@/context"
import { Shape, creator as shapeCreator, GroupShape, ShapeFrame, Artboard, Path } from "@kcdesign/data"

interface ShapeCreator {
    make(): BaseShapeCreator // 重载make方法，可返回另一类型的creator代替自身
    create(): Shape | undefined // 创建shape
    afterChildrenCreated(): void // 所有子节点create之后
    afterSiblingCreated(): void // 所有兄弟节点create之后
    afterAllCreated(): void // 所有节点create之后
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
