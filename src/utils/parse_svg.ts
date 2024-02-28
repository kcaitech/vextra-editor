import { Context } from "@/context"
import { Shape, creator, GroupShape, ShapeFrame, Artboard, Path } from "@kcdesign/data"

interface ShapeCreator {
    create(): Shape | undefined // 创建shape
    afterChildrenCreated(): void // 子节点create之后
    afterSiblingCreated(): void // 兄弟节点create之后
    afterRootCreated(): void // 根节点create之后
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

class BaseShapeCreator implements ShapeCreator {
    root: BaseShapeCreator | undefined
    parent: BaseShapeCreator | undefined
    children: BaseShapeCreator[] = []
    svgRoot: Element
    svgNode: Element
    svgNodeTagName: string
    shape: Shape | undefined = undefined

    x: number | undefined
    y: number | undefined
    width: number | undefined
    height: number | undefined

    constructor(root: BaseShapeCreator | undefined, parent: BaseShapeCreator | undefined, svgRoot: Element, svgNode: Element) {
        this.root = root
        this.parent = parent
        this.svgRoot = svgRoot
        this.svgNode = svgNode
        this.svgNodeTagName = svgNode.tagName
        this.parseAttributes()
        this.shape = this.create()
        if (this.shape) {
            this.shape.frame.x = this.x || 0
            this.shape.frame.y = this.y || 0
            if (this.parent instanceof SvgShapeCreator && this.parent.viewBox) {
                this.shape.frame.x -= this.parent.viewBox[0]
                this.shape.frame.y -= this.parent.viewBox[1]
            }
        }
    }

    parseAttributes() {
        const transform = this.svgNode.getAttribute("transform")
        if (transform) {
            const { x, y } = parseTranslate(transform)
            this.x = x
            this.y = y
        }

        const width = this.svgNode.getAttribute("width")
        if (width) this.width = parseFloat(width);
        const height = this.svgNode.getAttribute("height")
        if (height) this.height = parseFloat(height);

        console.log(`${this.svgNodeTagName} x: ${this.x}, y: ${this.y}, width: ${this.width}, height: ${this.height}}`)
    }

    create(): Shape | undefined {
        return
    }

    afterChildrenCreated(): void {

    }

    afterSiblingCreated(): void {

    }

    afterRootCreated(): void {

    }
}

class NoneShapeCreator extends BaseShapeCreator {
    create(): Shape | undefined {
        return
    }
}

class GroupShapeCreator extends BaseShapeCreator {
    create(): Shape | undefined {
        return creator.newGroupShape("编组")
    }

    afterChildrenCreated(): void {
        if (!this.shape) return;
        const groupShape = this.shape as GroupShape
        const childrenShapes = this.children.filter(item => item.shape).map(item => item.shape!)
        if (childrenShapes.length === 0) {
            this.shape = undefined
            return
        }
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
        const width = (this.viewBox ? this.viewBox[2] : this.width) || 0
        const height = (this.viewBox ? this.viewBox[3] : this.height) || 0
        return creator.newArtboard("容器", new ShapeFrame(0, 0, width, height))
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

class PathShapeCreator extends BaseShapeCreator {
    create(): Shape | undefined {
        const d = this.svgNode.getAttribute("d")
        if (!d) return;
        const x = this.x || 0
        const y = this.y || 0
        const path = new Path(d);
        path.translate(-x, -y);
        return creator.newPathShape("路径", new ShapeFrame(x, y, 100, 100), path)
    }
}

class Parser {
    svgRoot: Element
    context: any = {}

    constructor(root: Element) {
        this.svgRoot = root
    }

    visit(node: Element) {
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
        )
        return children
    }

    parse(): Shape | undefined {
        const stack = [this.svgRoot]
        const stack1: [
            Element, // 已create的元素
            number, // 其子节点的数量
        ][] = []

        while (stack.length) {
            const node = stack.pop()!
            const children = this.visit(node)

            const creator = (node as any).creator
            if (!creator) throw new Error("creator不存在");

            const parentNode = node.parentElement
            if (parentNode) {
                const parentCreator = (parentNode as any).creator
                if (!parentCreator) throw new Error("creator不存在");
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
                        const childCreator = (child as any).creator
                        if (childCreator) childCreator.afterSiblingCreated();
                    }

                    const parentCreator = (svgParent as any).creator
                    parentCreator.afterChildrenCreated()
                }
            }
        }

        return (this.svgRoot as any).creator?.shape
    }
}

export function insert(context: Context, svgString: string) {
    const parser = new DOMParser()
    const svgDocument = parser.parseFromString(svgString, "image/svg+xml")
    const svgElement = svgDocument.documentElement
    const svgParser = new Parser(svgElement)
    const shape = svgParser.parse()
    console.log("parse result", shape)
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
