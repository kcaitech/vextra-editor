import {
    creator as shapeCreator,
    ShapeFrame,
    Artboard,
} from "@kcdesign/data"
import { BaseCreator } from "./base"

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
