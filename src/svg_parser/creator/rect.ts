import {
    creator as shapeCreator,
    PathShape,
    ShapeFrame,
} from "@kcdesign/data"
import {BaseCreator} from "./base"

export class RectCreator extends BaseCreator {
    createShape() {
        const x = this.attributes.x || 0
        const y = this.attributes.y || 0
        const width = this.attributes.width || 0
        const height = this.attributes.height || 0
        this.shape = shapeCreator.newRectShape("矩形", new ShapeFrame(x, y, width, height))
        let rx = this.attributes.rx
        let ry = this.attributes.ry
        if (rx === undefined) rx = ry;
        if (ry === undefined) ry = rx;
        const r = ((rx || 0) + (ry || 0)) / 2
        if (r > 0) for (let i = 0; i < 4; i++) (this.shape as PathShape).pathsegs[0].points[i].radius = r;
    }
}
