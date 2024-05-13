import {
    creator as shapeCreator,
    ShapeFrame,
} from "@kcdesign/data"
import { BaseCreator } from "./base"

export class RectCreator extends BaseCreator {
    createShape() {
        const x = this.attributes.x || 0
        const y = this.attributes.y || 0
        const width = this.attributes.width || 0
        const height = this.attributes.height || 0
        this.shape = shapeCreator.newRectShape("矩形", new ShapeFrame(x, y, width, height))
    }
}
