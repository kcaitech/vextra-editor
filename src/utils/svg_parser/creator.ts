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
    ContextSettings,
    BlendMode,
    BorderStyle,
    BorderPosition,
    CurvePoint,
    CurveMode,
    getFormatFromBase64,
    Gradient,
    GradientType,
    Stop,
    Point2D,
} from "@kcdesign/data"
import { v4 as uuid } from "uuid"
import { BaseTreeNode, TreeNodeTraverseHandler } from "./tree"
import {
    Attributes,
    FillColor,
    getAllFunctionCallFromString,
    getAllStyleFromString,
    getPathBoxFromD,
    getRectBox,
    GradientStop,
    LinearGradient,
    mergeAttributes,
    mergeRectBox,
    MyColor,
    myColorToColor,
    MyShadow,
    parseColor,
    parseTransform,
    RadialGradient
} from "./utils"
import { Transform3D, TransformMode } from "./transform_3d"
import { Matrix } from "./matrix"

export class BaseCreator extends BaseTreeNode {
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

        // css样式属性
        const style = this.localAttributes["style"]
        if (style) {
            this.attributes.style = style
            this.attributes.styleAttributes = getAllStyleFromString(style)
            if ("transform" in this.attributes.styleAttributes) {
                this.attributes.styleTransform = this.attributes.styleAttributes.transform
            }
        }

        // x、y
        const x = this.localAttributes["x"]
        if (x) this.attributes.x = parseFloat(x);
        const y = this.localAttributes["y"]
        if (y) this.attributes.y = parseFloat(y);
        // width、height
        const width = this.localAttributes["width"]
        if (width) this.attributes.width = parseFloat(width);
        const height = this.localAttributes["height"]
        if (height) this.attributes.height = parseFloat(height);

        // path
        const d = this.localAttributes["d"]
        if (d) {
            this.attributes.d = d
            const { x, y, width, height } = getPathBoxFromD(d)
            this.attributes.pathX = x
            this.attributes.pathY = y
            this.attributes.width = width
            this.attributes.height = height
        }

        // transform
        let transform
        if (this.attributes.styleTransform) transform = this.attributes.styleTransform;
        if (!transform) {
            this.attributes.transform = this.localAttributes["transform"] ?? undefined
            transform = this.attributes.transform
        }
        if (transform) this.transform.addTransform(parseTransform(transform, {
            transformMode: TransformMode.LocalSpecialTranslate,
            translate: {
                x: (this.attributes.width || 0) / 2,
                y: (this.attributes.height || 0) / 2,
                z: 0,
            },
            diffX: parseFloat(x) || 0,
            diffY: parseFloat(y) || 0,
        }));

        // opacity
        const opacity = this.localAttributes["opacity"]
        if (opacity) this.attributes.opacity = parseFloat(opacity);

        // 解析fill、stroke
        const parseFillColor = (content: string, fillOpacity: number): FillColor | undefined => {
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
                if (color) {
                    color.a *= fillOpacity
                    colorType = "color"
                }
            }

            return colorType && {
                colorType: colorType,
                color: color,
                linearGradient: linearGradient,
                radialGradient: radialGradient,
            }
        }

        // fill
        let fill
        if (this.attributes.styleAttributes && "fill" in this.attributes.styleAttributes) {
            fill = this.attributes.styleAttributes.fill
        }
        if (!fill) fill = this.localAttributes["fill"];
        if (fill) {
            const fillOpacity = parseFloat(this.localAttributes["fill-opacity"]) || 1
            const fillColor = parseFillColor(fill, fillOpacity)
            if (fillColor) this.attributes.fill = {
                colorType: fillColor.colorType,
                linearGradient: fillColor.linearGradient,
                radialGradient: fillColor.radialGradient,
                color: fillColor.color,
            };
        }

        // stroke
        const stroke = this.localAttributes["stroke"]
        const dashArray: number[] = this.localAttributes["stroke-dasharray"]?.split(/,|\s+/).filter(arg => arg && arg.trim()).map(item => parseFloat(item)) || [0, 0]
        if (stroke) {
            const fillColor = parseFillColor(stroke, 1)
            if (fillColor) this.attributes.stroke = {
                colorType: fillColor.colorType,
                linearGradient: fillColor.linearGradient,
                radialGradient: fillColor.radialGradient,
                color: fillColor.color,
                dashArray: dashArray,
                position: "center",
            };
        }
        // stroke-width
        const strokeWidth = this.localAttributes["stroke-width"]
        if (strokeWidth) {
            this.attributes.strokeWidth = parseFloat(strokeWidth)
            if (this.attributes.stroke) this.attributes.stroke.width = this.attributes.strokeWidth;
        }

        // 解析阴影（通过filter）
        const parseShadow = (content: string): MyShadow | undefined => {
            if (!content.startsWith("url(#")) return;
            const urlId = content.slice(5, -1)
            const el = svgRoot.querySelector(`#${urlId}`)
            if (!el) return;
            const creator = (el as any).creator as BaseCreator
            creator.parseAttributes()
            for (const child of creator.children) child.parseAttributes();

            const x = creator.localAttributes["x"] || ""
            const y = creator.localAttributes["y"] || ""
            const width = creator.localAttributes["width"] || ""
            const height = creator.localAttributes["height"] || ""
            const shadowType = (x + y + width + height).includes("%") ? "inner" : "outer"

            let color
            for (const child of creator.children) {
                if (child.htmlElement?.tagName === "feColorMatrix" && !("in" in child.localAttributes) && child.localAttributes["values"]) {
                    const values = child.localAttributes["values"].split(/,|\s+/).filter(arg => arg && arg.trim())
                    if (values.length !== 20) continue;
                    color = {
                        r: (parseFloat(values[4]) || 0) * 255,
                        g: (parseFloat(values[9]) || 0) * 255,
                        b: (parseFloat(values[14]) || 0) * 255,
                        a: (parseFloat(values[18]) || 1),
                    }
                    break
                }
                if (child.htmlElement?.tagName === "feFlood" && ("flood-color" in child.localAttributes)) {
                    color = parseColor(child.localAttributes["flood-color"])
                    break
                }
            }
            if (!color) return;

            let offsetX = 0
            let offsetY = 0
            let blur = 0
            let spread = 0
            for (const child of creator.children) {
                if (child.htmlElement?.tagName === "feOffset") {
                    offsetX = parseFloat(child.localAttributes["dx"] || "0")
                    offsetY = parseFloat(child.localAttributes["dy"] || "0")
                }
                if (child.htmlElement?.tagName === "feGaussianBlur") {
                    blur = parseFloat(child.localAttributes["stdDeviation"] || "0") * 2
                }
                if (child.htmlElement?.tagName === "feMorphology") {
                    spread = parseFloat(child.localAttributes["radius"] || "0")
                }
            }

            const w = this.attributes.width || 1
            const scale = this.transform.decompose3DScale()
            if (scale.x !== 1 || scale.y !== 1) {
                // 按现有算法逆推，详见kcdesign-data/src/render/shadow.ts:shadowOri[ShadowPosition.Outer]
                spread = 10000 * (scale.x - 1) * w / (19900 - w)
                offsetX *= scale.x
            }

            return {
                type: shadowType,
                offsetX: offsetX,
                offsetY: offsetY,
                blur: blur,
                spread: spread,
                color: color,
            }
        }

        // 圆形
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

        // 直线
        const x1 = this.localAttributes["x1"]
        if (x1) this.attributes.x1 = parseFloat(x1);
        if (!this.attributes.x) this.attributes.x = this.attributes.x1;
        const y1 = this.localAttributes["y1"]
        if (y1) this.attributes.y1 = parseFloat(y1);
        if (!this.attributes.y) this.attributes.y = this.attributes.y1;
        const x2 = this.localAttributes["x2"]
        if (x2) this.attributes.x2 = parseFloat(x2);
        const y2 = this.localAttributes["y2"]
        if (y2) this.attributes.y2 = parseFloat(y2);

        // 图片
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
                // 按现有算法逆推，详见kcdesign-data/src/render/line_gradient.ts:render()->scaleY
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

export class NoneCreator extends BaseCreator {

}

export class GroupCreator extends BaseCreator {
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

export class SvgCreator extends BaseCreator {
    viewBox: [number, number, number, number] | undefined

    createShape() {
        const viewBox = this.localAttributes["viewBox"]
        if (viewBox) {
            const viewBoxSplitRes = viewBox.split(/,|\s+/).filter(arg => arg && arg.trim()).map(item => parseFloat(item))
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

export class PathCreator extends BaseCreator {
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
        const d = this.attributes.d
        if (!d) return;
        const x = this.attributes.pathX || 0
        const y = this.attributes.pathY || 0
        const width = this.attributes.width || 0
        const height = this.attributes.height || 0
        const path = new Path(d);
        path.translate(-x, -y);
        this.transform.translate(x + (this.attributes.x || 0), y + (this.attributes.y || 0), 0)
        this.shape = shapeCreator.newPathShape("路径", new ShapeFrame(x, y, width, height), path, this.style)
    }
}

export class RectCreator extends BaseCreator {
    createShape() {
        const x = this.attributes.x || 0
        const y = this.attributes.y || 0
        const width = this.attributes.width || 0
        const height = this.attributes.height || 0
        this.shape = shapeCreator.newRectShape("矩形", new ShapeFrame(x, y, width, height))
    }
}

export class EllipseCreator extends BaseCreator {
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

export class LineCreator extends BaseCreator {
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

export class TextCreator extends BaseCreator {
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

export class ImageCreator extends BaseCreator {
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
