import {
    creator as shapeCreator,
    ShapeFrame,
    getFormatFromBase64,
} from "@kcdesign/data"
import { v4 as uuid } from "uuid"
import { BaseCreator } from "./base"

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
