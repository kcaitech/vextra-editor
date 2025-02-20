import {
    creator as shapeCreator, Path,
    ShapeFrame, ColVector3D, Transform
} from "@kcdesign/data"
import {BaseCreator} from "./base"

export class Polyline extends BaseCreator {
    createShape() {
        const pointsToPathD = this.attributes.pointsToPathD
        if (!pointsToPathD) return;
        const x = this.attributes.polylineX || 0
        const y = this.attributes.polylineY || 0
        const width = this.attributes.width || 0
        const height = this.attributes.height || 0
        const path = new Path(pointsToPathD)
        path.translate(-x, -y)
        this.transform.addPreTransform(new Transform().translate(new ColVector3D([x + (this.attributes.x || 0), y + (this.attributes.y || 0), 0])));
        this.shape = shapeCreator.newPathShape(this.htmlElement?.tagName || "polyline", new ShapeFrame(x, y, width, height), path, this.context.styleMgr, this.style)
    }
}
