import { Action } from "./recordcanvas";
import msgpack from "@msgpack/msgpack"

const actionHandlers: { [key: number]: (p: any[], canvas: OffscreenCanvasRenderingContext2D) => void } = {}

actionHandlers[Action.globalAlpha] = (p: any[], canvas: OffscreenCanvasRenderingContext2D) => {
    canvas.globalAlpha = p[0]
}
actionHandlers[Action.globalCompositeOperation] = (p: any[], canvas: OffscreenCanvasRenderingContext2D) => {
    canvas.globalCompositeOperation = p[0]
}
actionHandlers[Action.drawImage] = (p: any[], canvas: OffscreenCanvasRenderingContext2D) => {
    canvas.drawImage(p[0], p[1], p[2])
}
actionHandlers[Action.beginPath] = (p: any[], canvas: OffscreenCanvasRenderingContext2D) => {
    canvas.beginPath()
}
actionHandlers[Action.clip] = (p: any[], canvas: OffscreenCanvasRenderingContext2D) => {
    canvas.clip(p[0])
}
actionHandlers[Action.fill] = (p: any[], canvas: OffscreenCanvasRenderingContext2D) => {
    canvas.fill(p[0])
}
actionHandlers[Action.stroke] = (p: any[], canvas: OffscreenCanvasRenderingContext2D) => {
    canvas.stroke()
}
actionHandlers[Action.fillStyle] = (p: any[], canvas: OffscreenCanvasRenderingContext2D) => {
    canvas.fillStyle = p[0]
}
actionHandlers[Action.strokeStyle] = (p: any[], canvas: OffscreenCanvasRenderingContext2D) => {
    canvas.strokeStyle = p[0]
}
actionHandlers[Action.filter] = (p: any[], canvas: OffscreenCanvasRenderingContext2D) => {
    canvas.filter = p [0]
}
actionHandlers[Action.putImageData] = (p: any[], canvas: OffscreenCanvasRenderingContext2D) => {
    canvas.putImageData(p[0], p[1], p[2])
}
actionHandlers[Action.imageSmoothingEnabled] = (p: any[], canvas: OffscreenCanvasRenderingContext2D) => {
    canvas.imageSmoothingEnabled = p[0]
}
actionHandlers[Action.imageSmoothingQuality] = (p: any[], canvas: OffscreenCanvasRenderingContext2D) => {
    canvas.imageSmoothingQuality = p[0]
}
actionHandlers[Action.arc] = (p: any[], canvas: OffscreenCanvasRenderingContext2D) => {
    canvas.arc(p[0], p[1], p[2], p[3], p[4], p[5])
}
actionHandlers[Action.arcTo] = (p: any[], canvas: OffscreenCanvasRenderingContext2D) => {
    canvas.arcTo(p[0], p[1], p[2], p[3], p[4])
}
actionHandlers[Action.bezierCurveTo] = (p: any[], canvas: OffscreenCanvasRenderingContext2D) => {
    canvas.bezierCurveTo(p[0], p[1], p[2], p[3], p[4], p[5])
}
actionHandlers[Action.closePath] = (p: any[], canvas: OffscreenCanvasRenderingContext2D) => {
    canvas.closePath()
}
actionHandlers[Action.ellipse] = (p: any[], canvas: OffscreenCanvasRenderingContext2D) => {
    canvas.ellipse(p[0], p[1], p[2], p[3], p[4], p[5], p[6], p[7])
}
actionHandlers[Action.lineTo] = (p: any[], canvas: OffscreenCanvasRenderingContext2D) => {
    canvas.lineTo(p[0], p[1])
}
actionHandlers[Action.moveTo] = (p: any[], canvas: OffscreenCanvasRenderingContext2D) => {
    canvas.moveTo(p[0], p[1])
}
actionHandlers[Action.quadraticCurveTo] = (p: any[], canvas: OffscreenCanvasRenderingContext2D) => {
    canvas.quadraticCurveTo(p[0], p[1], p[2], p[3])
}
actionHandlers[Action.rect] = (p: any[], canvas: OffscreenCanvasRenderingContext2D) => {
    canvas.rect(p[0], p[1], p[2], p[3])
}
actionHandlers[Action.roundRect] = (p: any[], canvas: OffscreenCanvasRenderingContext2D) => {
    canvas.roundRect(p[0], p[1], p[2], p[3], p[4])
}
actionHandlers[Action.lineCap] = (p: any[], canvas: OffscreenCanvasRenderingContext2D) => {
    canvas.lineCap = p[0]
}
actionHandlers[Action.lineDashOffset] = (p: any[], canvas: OffscreenCanvasRenderingContext2D) => {
    canvas.lineDashOffset = p[0]
}
actionHandlers[Action.lineJoin] = (p: any[], canvas: OffscreenCanvasRenderingContext2D) => {
    canvas.lineJoin = p[0]
}
actionHandlers[Action.lineWidth] = (p: any[], canvas: OffscreenCanvasRenderingContext2D) => {
    canvas.lineWidth = p[0]
}
actionHandlers[Action.miterLimit] = (p: any[], canvas: OffscreenCanvasRenderingContext2D) => {
    canvas.miterLimit = p[0]
}
actionHandlers[Action.setLineDash] = (p: any[], canvas: OffscreenCanvasRenderingContext2D) => {
    canvas.setLineDash(p[0])
}
actionHandlers[Action.clearRect] = (p: any[], canvas: OffscreenCanvasRenderingContext2D) => {
    canvas.clearRect(p[0], p[1], p[2], p[3])
}
actionHandlers[Action.fillRect] = (p: any[], canvas: OffscreenCanvasRenderingContext2D) => {
    canvas.fillRect(p[0], p[1], p[2], p[3])
}
actionHandlers[Action.strokeRect] = (p: any[], canvas: OffscreenCanvasRenderingContext2D) => {
    canvas.strokeRect(p[0], p[1], p[2], p[3])
}
actionHandlers[Action.shadowBlur] = (p: any[], canvas: OffscreenCanvasRenderingContext2D) => {
    canvas.shadowBlur = p[0]
}
actionHandlers[Action.shadowColor] = (p: any[], canvas: OffscreenCanvasRenderingContext2D) => {
    canvas.shadowColor = p[0]
}
actionHandlers[Action.shadowOffsetX] = (p: any[], canvas: OffscreenCanvasRenderingContext2D) => {
    canvas.shadowOffsetX = p[0]
}
actionHandlers[Action.shadowOffsetY] = (p: any[], canvas: OffscreenCanvasRenderingContext2D) => {
    canvas.shadowOffsetY = p[0]
}
actionHandlers[Action.reset] = (p: any[], canvas: OffscreenCanvasRenderingContext2D) => {
    canvas.reset()
}
actionHandlers[Action.restore] = (p: any[], canvas: OffscreenCanvasRenderingContext2D) => {
    canvas.restore()
}
actionHandlers[Action.save] = (p: any[], canvas: OffscreenCanvasRenderingContext2D) => {
    canvas.save()
}
actionHandlers[Action.fillText] = (p: any[], canvas: OffscreenCanvasRenderingContext2D) => {
    canvas.fillText(p[0], p[1], p[2], p[3])
}
actionHandlers[Action.strokeText] = (p: any[], canvas: OffscreenCanvasRenderingContext2D) => {
    canvas.strokeText(p[0], p[1], p[2], p[3])
}
actionHandlers[Action.direction] = (p: any[], canvas: OffscreenCanvasRenderingContext2D) => {
    canvas.direction = p[0]
}
actionHandlers[Action.font] = (p: any[], canvas: OffscreenCanvasRenderingContext2D) => {
    canvas.font = p[0]
}
actionHandlers[Action.fontKerning] = (p: any[], canvas: OffscreenCanvasRenderingContext2D) => {
    canvas.fontKerning = p[0]
}
actionHandlers[Action.fontStretch] = (p: any[], canvas: OffscreenCanvasRenderingContext2D) => {
    canvas.fontStretch = p[0]
}
actionHandlers[Action.fontVariantCaps] = (p: any[], canvas: OffscreenCanvasRenderingContext2D) => {
    canvas.fontVariantCaps = p[0]
}
actionHandlers[Action.letterSpacing] = (p: any[], canvas: OffscreenCanvasRenderingContext2D) => {
    canvas.letterSpacing = p[0]
}
actionHandlers[Action.textAlign] = (p: any[], canvas: OffscreenCanvasRenderingContext2D) => {
    canvas.textAlign = p[0]
}
actionHandlers[Action.textBaseline] = (p: any[], canvas: OffscreenCanvasRenderingContext2D) => {
    canvas.textBaseline = p[0]
}
actionHandlers[Action.textRendering] = (p: any[], canvas: OffscreenCanvasRenderingContext2D) => {
    canvas.textRendering = p[0]
}
actionHandlers[Action.wordSpacing] = (p: any[], canvas: OffscreenCanvasRenderingContext2D) => {
    canvas.wordSpacing = p[0]
}
actionHandlers[Action.resetTransform] = (p: any[], canvas: OffscreenCanvasRenderingContext2D) => {
    canvas.resetTransform()
}
actionHandlers[Action.rotate] = (p: any[], canvas: OffscreenCanvasRenderingContext2D) => {
    canvas.rotate(p[0])
}
actionHandlers[Action.scale] = (p: any[], canvas: OffscreenCanvasRenderingContext2D) => {
    canvas.scale(p[0], p[1])
}
actionHandlers[Action.setTransform] = (p: any[], canvas: OffscreenCanvasRenderingContext2D) => {
    canvas.setTransform(p[0])
}
actionHandlers[Action.transform] = (p: any[], canvas: OffscreenCanvasRenderingContext2D) => {
    canvas.transform(p[0], p[1], p[2], p[3], p[4], p[5])
}
actionHandlers[Action.translate] = (p: any[], canvas: OffscreenCanvasRenderingContext2D) => {
    canvas.translate(p[0], p[1])
}
// actionHandlers[Action.drawFocusIfNeeded] = (p: any[], canvas: OffscreenCanvasRenderingContext2D) => {
//     canvas.
// }

export function execRecord(records: { a: Action, p: any[] }[], canvas: OffscreenCanvasRenderingContext2D) {
    records.forEach(r => {
        const h = actionHandlers[r.a]
        if (!h) {
            throw new Error("Action:" + r.a + ", Not implemented.")
        }
        h(r.p, canvas)
    })
}

export function execRecordRaw(records: Uint8Array, canvas: OffscreenCanvasRenderingContext2D) {
    const _records = msgpack.decode(records) as { a: Action, p: any[] }[]
    execRecord(_records, canvas)
}