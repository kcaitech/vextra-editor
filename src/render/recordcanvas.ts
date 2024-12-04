import { CanvasApi } from "./canvasapi";

export enum Action {
    globalAlpha = 1,
    globalCompositeOperation,
    drawImage,
    beginPath,
    clip,
    fill,
    stroke,
    fillStyle,
    strokeStyle,
    filter,
    putImageData,
    imageSmoothingEnabled,
    imageSmoothingQuality,
    arc,
    arcTo,
    bezierCurveTo,
    closePath,
    ellipse,
    lineTo,
    moveTo,
    quadraticCurveTo,
    rect,
    roundRect,
    lineCap,
    lineDashOffset,
    lineJoin,
    lineWidth,
    miterLimit,
    setLineDash,
    clearRect,
    fillRect,
    strokeRect,
    shadowBlur,
    shadowColor,
    shadowOffsetX,
    shadowOffsetY,
    reset,
    restore,
    save,
    fillText,
    strokeText,
    direction,
    font,
    fontKerning,
    fontStretch,
    fontVariantCaps,
    letterSpacing,
    textAlign,
    textBaseline,
    textRendering,
    wordSpacing,
    resetTransform,
    rotate,
    scale,
    setTransform,
    transform,
    translate,
    // drawFocusIfNeeded
}

export class RecordCanvas implements CanvasApi {
    _records: { a: Action, p: any[] }[] = []
    get canvas(): HTMLCanvasElement {
        throw new Error("Method not implemented.");
    }
    getContextAttributes(): CanvasRenderingContext2DSettings {
        throw new Error("Method not implemented.");
    }
    _globalAlpha: number = 1.0;
    get globalAlpha() {
        return this._globalAlpha
    }
    set globalAlpha(a: number) {
        this._globalAlpha = a
        this._records.push({
            a: Action.globalAlpha,
            p: [a]
        })
    }
    _globalCompositeOperation: GlobalCompositeOperation = "source-over";
    get globalCompositeOperation() {
        return this._globalCompositeOperation
    }
    set globalCompositeOperation(o: GlobalCompositeOperation) {
        this._globalCompositeOperation = o
        this._records.push({
            a: Action.globalCompositeOperation,
            p: [o]
        })
    }
    drawImage(image: unknown, sx: unknown, sy: unknown, sw?: unknown, sh?: unknown, dx?: unknown, dy?: unknown, dw?: unknown, dh?: unknown): void {
        this._records.push({
            a: Action.drawImage,
            p: [image, sx, sy, sw, sh, dx, dy, dw, dh]
        })
    }
    beginPath(): void {
        this._records.push({
            a: Action.beginPath,
            p: []
        })
    }
    clip(path?: unknown, fillRule?: unknown): void {
        this._records.push({
            a: Action.clip,
            p: [path, fillRule]
        })
    }
    fill(path?: unknown, fillRule?: unknown): void {
        this._records.push({
            a: Action.fill,
            p: [path, fillRule]
        })
    }
    isPointInPath(path: unknown, x: unknown, y?: unknown, fillRule?: unknown): boolean {
        throw new Error("Method not implemented.");
    }
    isPointInStroke(path: unknown, x: unknown, y?: unknown): boolean {
        throw new Error("Method not implemented.");
    }
    stroke(path?: unknown): void {
        this._records.push({
            a: Action.stroke,
            p: [path]
        })
    }
    _fillStyle: string | CanvasGradient | CanvasPattern = "#000";
    get fillStyle() {
        return this._fillStyle
    }
    set fillStyle(s: string | CanvasGradient | CanvasPattern) {
        this._fillStyle = s
        this._records.push({
            a: Action.fillStyle,
            p: [s]
        })
    }
    _strokeStyle: string | CanvasGradient | CanvasPattern = "#000";
    get strokeStyle() {
        return this._strokeStyle
    }
    set strokeStyle(s: string | CanvasGradient | CanvasPattern) {
        this._strokeStyle = s
        this._records.push({
            a: Action.strokeStyle,
            p: [s]
        })
    }
    createConicGradient(startAngle: unknown, x: unknown, y: unknown): CanvasGradient {
        throw new Error("Method not implemented.");
    }
    createLinearGradient(x0: unknown, y0: unknown, x1: unknown, y1: unknown): CanvasGradient {
        throw new Error("Method not implemented.");
    }
    createPattern(image: unknown, repetition: unknown): CanvasPattern | null {
        throw new Error("Method not implemented.");
    }
    createRadialGradient(x0: unknown, y0: unknown, r0: unknown, x1: unknown, y1: unknown, r1: unknown): CanvasGradient {
        throw new Error("Method not implemented.");
    }
    _filter: string = "none";
    get filter() {
        return this._filter
    }
    set filter(f: string) {
        this._filter = f
        this._records.push({
            a: Action.filter,
            p: [f]
        })
    }
    createImageData(sw: unknown, sh?: unknown, settings?: unknown): ImageData {
        throw new Error("Method not implemented.");
    }
    getImageData(sx: unknown, sy: unknown, sw: unknown, sh: unknown, settings?: unknown): ImageData {
        throw new Error("Method not implemented.");
    }
    putImageData(imagedata: unknown, dx: unknown, dy: unknown, dirtyX?: unknown, dirtyY?: unknown, dirtyWidth?: unknown, dirtyHeight?: unknown): void {
        this._records.push({
            a: Action.putImageData,
            p: [imagedata, dx, dy, dirtyX, dirtyY, dirtyWidth, dirtyHeight]
        })
    }
    _imageSmoothingEnabled: boolean = true;
    get imageSmoothingEnabled() {
        return this._imageSmoothingEnabled
    }
    set imageSmoothingEnabled(e: boolean) {
        this._imageSmoothingEnabled = e
        this._records.push({
            a: Action.imageSmoothingEnabled,
            p: [e]
        })
    }
    _imageSmoothingQuality: ImageSmoothingQuality = "low";
    get imageSmoothingQuality() {
        return this._imageSmoothingQuality
    }
    set imageSmoothingQuality(s: ImageSmoothingQuality) {
        this._imageSmoothingQuality = s
        this._records.push({
            a: Action.imageSmoothingQuality,
            p: [s]
        })
    }
    arc(x: unknown, y: unknown, radius: unknown, startAngle: unknown, endAngle: unknown, counterclockwise?: unknown): void {
        this._records.push({
            a: Action.arc,
            p: [x, y, radius, startAngle, endAngle, counterclockwise]
        })
    }
    arcTo(x1: unknown, y1: unknown, x2: unknown, y2: unknown, radius: unknown): void {
        this._records.push({
            a: Action.arcTo,
            p: [x1, y1, x2, y2, radius]
        })
    }
    bezierCurveTo(cp1x: unknown, cp1y: unknown, cp2x: unknown, cp2y: unknown, x: unknown, y: unknown): void {
        this._records.push({
            a: Action.bezierCurveTo,
            p: [cp1x, cp1y, cp2x, cp2y, x, y]
        })
    }
    closePath(): void {
        this._records.push({
            a: Action.closePath,
            p: []
        })
    }
    ellipse(x: unknown, y: unknown, radiusX: unknown, radiusY: unknown, rotation: unknown, startAngle: unknown, endAngle: unknown, counterclockwise?: unknown): void {
        this._records.push({
            a: Action.ellipse,
            p: [x, y, radiusX, radiusY, rotation, startAngle, endAngle, counterclockwise]
        })
    }
    lineTo(x: unknown, y: unknown): void {
        this._records.push({
            a: Action.lineTo,
            p: [x, y]
        })
    }
    moveTo(x: unknown, y: unknown): void {
        this._records.push({
            a: Action.moveTo,
            p: [x, y]
        })
    }
    quadraticCurveTo(cpx: unknown, cpy: unknown, x: unknown, y: unknown): void {
        this._records.push({
            a: Action.quadraticCurveTo,
            p: [cpx, cpy, x, y]
        })
    }
    rect(x: unknown, y: unknown, w: unknown, h: unknown): void {
        this._records.push({
            a: Action.rect,
            p: [x, y, w, h]
        })
    }
    roundRect(x: unknown, y: unknown, w: unknown, h: unknown, radii?: unknown): void {
        this._records.push({
            a: Action.roundRect,
            p: [x, y, w, h, radii]
        })
    }
    _lineCap: CanvasLineCap = "butt";
    get lineCap() {
        return this._lineCap
    }
    set lineCap(c: CanvasLineCap) {
        this._lineCap = c
        this._records.push({
            a: Action.lineCap,
            p: [c]
        })
    }
    _lineDashOffset: number = 0.0;
    get lineDashOffset() {
        return this._lineDashOffset
    }
    set lineDashOffset(o: number) {
        this._lineDashOffset = o
        this._records.push({
            a: Action.lineDashOffset,
            p: [o]
        })
    }
    _lineJoin: CanvasLineJoin = "miter";
    get lineJoin() {
        return this._lineJoin
    }
    set lineJoin(j: CanvasLineJoin) {
        this._lineJoin = j
        this._records.push({
            a: Action.lineJoin,
            p: [j]
        })
    }
    _lineWidth: number = 1.0;
    get lineWidth() {
        return this._lineWidth
    }
    set lineWidth(w: number) {
        this._lineWidth = w
        this._records.push({
            a: Action.lineWidth,
            p: [w]
        })
    }
    _miterLimit: number = 10.0;
    get miterLimit() {
        return this._miterLimit
    }
    set miterLimit(l: number) {
        this._miterLimit = l
        this._records.push({
            a: Action.miterLimit,
            p: [l]
        })
    }
    getLineDash(): number[] {
        throw new Error("Method not implemented.");
    }
    setLineDash(segments: unknown): void {
        this._records.push({
            a: Action.setLineDash,
            p: [segments]
        })
    }
    clearRect(x: unknown, y: unknown, w: unknown, h: unknown): void {
        this._records.push({
            a: Action.clearRect,
            p: [x, y, w, h]
        })
    }
    fillRect(x: unknown, y: unknown, w: unknown, h: unknown): void {
        this._records.push({
            a: Action.fillRect,
            p: [x, y, w, h]
        })
    }
    strokeRect(x: unknown, y: unknown, w: unknown, h: unknown): void {
        this._records.push({
            a: Action.strokeRect,
            p: [x, y, w, h]
        })
    }
    _shadowBlur: number = 0;
    get shadowBlur() {
        return this._shadowBlur
    }
    set shadowBlur(b: number) {
        this._shadowBlur = b
        this._records.push({
            a: Action.shadowBlur,
            p: [b]
        })
    }
    _shadowColor: string = "rgba(0, 0, 0, 0)";
    get shadowColor() {
        return this._shadowColor
    }
    set shadowColor(c: string) {
        this._shadowColor = c
        this._records.push({
            a: Action.shadowColor,
            p: [c]
        })
    }
    _shadowOffsetX: number = 0;
    get shadowOffsetX() {
        return this._shadowOffsetX
    }
    set shadowOffsetX(x: number) {
        this._shadowOffsetX = x
        this._records.push({
            a: Action.shadowOffsetX,
            p: [x]
        })
    }
    _shadowOffsetY: number = 0;
    get shadowOffsetY() {
        return this._shadowOffsetY
    }
    set shadowOffsetY(y: number) {
        this._shadowOffsetY = y
        this._records.push({
            a: Action.shadowOffsetY,
            p: [y]
        })
    }
    isContextLost(): boolean {
        throw new Error("Method not implemented.");
    }
    reset(): void {
        this._globalAlpha = 1.0;
        this._globalCompositeOperation = "source-over";
        this._fillStyle = "#000";
        this._strokeStyle = "#000";
        this._filter = "none";
        this._imageSmoothingEnabled = true;
        this._imageSmoothingQuality = "low";
        this._lineCap = "butt";
        this._lineDashOffset = 0.0;
        this._lineJoin = "miter";
        this._lineWidth = 1.0;
        this._miterLimit = 10.0;
        this._shadowBlur = 0;
        this._shadowColor = "rgba(0, 0, 0, 0)";
        this._shadowOffsetX = 0;
        this._shadowOffsetY = 0;
        this._direction = "inherit";
        this._font = "10px sans-serif";
        this._fontKerning = "auto";
        this._fontStretch = "normal";
        this._fontVariantCaps = "normal";
        this._letterSpacing = "0px";
        this._textAlign = "start";
        this._textBaseline = "alphabetic";
        this._textRendering = "auto";
        this._wordSpacing = "0px";

        this._records.push({
            a: Action.reset,
            p: []
        })
    }
    restore(): void {
        this._records.push({
            a: Action.restore,
            p: []
        })
    }
    save(): void {
        this._records.push({
            a: Action.save,
            p: []
        })
    }
    fillText(text: unknown, x: unknown, y: unknown, maxWidth?: unknown): void {
        this._records.push({
            a: Action.fillText,
            p: [text, x, y, maxWidth]
        })
    }
    measureText(text: unknown): TextMetrics {
        throw new Error("Method not implemented.");
    }
    strokeText(text: unknown, x: unknown, y: unknown, maxWidth?: unknown): void {
        this._records.push({
            a: Action.strokeText,
            p: [text, x, y, maxWidth]
        })
    }
    _direction: CanvasDirection = "inherit";
    get direction() {
        return this._direction
    }
    set direction(d: CanvasDirection) {
        this._direction = d
        this._records.push({
            a: Action.direction,
            p: [d]
        })
    }
    _font: string = "10px sans-serif";
    get font() {
        return this._font
    }
    set font(f: string) {
        this._font = f
        this._records.push({
            a: Action.font,
            p: [f]
        })
    }
    _fontKerning: CanvasFontKerning = "auto";
    get fontKerning() {
        return this._fontKerning
    }
    set fontKerning(k: CanvasFontKerning) {
        this._fontKerning = k
        this._records.push({
            a: Action.fontKerning,
            p: [k]
        })
    }
    _fontStretch: CanvasFontStretch = "normal";
    get fontStretch() {
        return this._fontStretch
    }
    set fontStretch(f: CanvasFontStretch) {
        this._fontStretch = f
        this._records.push({
            a: Action.fontStretch,
            p: [f]
        })
    }
    _fontVariantCaps: CanvasFontVariantCaps = "normal";
    get fontVariantCaps() {
        return this._fontVariantCaps
    }
    set fontVariantCaps(f: CanvasFontVariantCaps) {
        this._fontVariantCaps = f
        this._records.push({
            a: Action.fontVariantCaps,
            p: [f]
        })
    }
    _letterSpacing: string = "0px";
    get letterSpacing() {
        return this._letterSpacing
    }
    set letterSpacing(s: string) {
        this._letterSpacing = s
        this._records.push({
            a: Action.letterSpacing,
            p: [s]
        })
    }
    _textAlign: CanvasTextAlign = "start";
    get textAlign() {
        return this._textAlign
    }
    set textAlign(a: CanvasTextAlign) {
        this._textAlign = a
        this._records.push({
            a: Action.textAlign,
            p: [a]
        })
    }
    _textBaseline: CanvasTextBaseline = "alphabetic";
    get textBaseline() {
        return this._textBaseline
    }
    set textBaseline(b: CanvasTextBaseline) {
        this._textBaseline = b
        this._records.push({
            a: Action.textBaseline,
            p: [b]
        })
    }
    _textRendering: CanvasTextRendering = "auto";
    get textRendering() {
        return this._textRendering
    }
    set textRendering(r: CanvasTextRendering) {
        this._textRendering = r
        this._records.push({
            a: Action.textRendering,
            p: [r]
        })
    }
    _wordSpacing: string = "0px";
    get wordSpacing() {
        return this._wordSpacing
    }
    set wordSpacing(s: string) {
        this._wordSpacing = s
        this._records.push({
            a: Action.wordSpacing,
            p: [s]
        })
    }
    getTransform(): DOMMatrix {
        throw new Error("Method not implemented.");
    }
    resetTransform(): void {
        this._records.push({
            a: Action.resetTransform,
            p: []
        })
    }
    rotate(angle: unknown): void {
        this._records.push({
            a: Action.rotate,
            p: [angle]
        })
    }
    scale(x: unknown, y: unknown): void {
        this._records.push({
            a: Action.scale,
            p: [x, y]
        })
    }
    setTransform(a?: unknown, b?: unknown, c?: unknown, d?: unknown, e?: unknown, f?: unknown): void {
        this._records.push({
            a: Action.setTransform,
            p: [a, b, c, d, e, f]
        })
    }
    transform(a: unknown, b: unknown, c: unknown, d: unknown, e: unknown, f: unknown): void {
        this._records.push({
            a: Action.transform,
            p: [a, b, c, d, e, f]
        })
    }
    translate(x: unknown, y: unknown): void {
        this._records.push({
            a: Action.translate,
            p: [x, y]
        })
    }
    drawFocusIfNeeded(path: unknown, element?: unknown): void {
        throw new Error("Method not implemented.");
        // this._records.push({
        //     a: Action.drawFocusIfNeeded,
        //     p: [path, element]
        // })
    }
}