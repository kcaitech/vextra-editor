
export class CanvasApi implements CanvasRenderingContext2D {
    get canvas(): HTMLCanvasElement {
        throw new Error("Method not implemented.");
    }
    getContextAttributes(): CanvasRenderingContext2DSettings {
        throw new Error("Method not implemented.");
    }
    globalAlpha: number = 1.0;
    globalCompositeOperation: GlobalCompositeOperation = "source-over";
    drawImage(image: unknown, sx: unknown, sy: unknown, sw?: unknown, sh?: unknown, dx?: unknown, dy?: unknown, dw?: unknown, dh?: unknown): void {
        throw new Error("Method not implemented.");
    }
    beginPath(): void {
        throw new Error("Method not implemented.");
    }
    clip(path?: unknown, fillRule?: unknown): void {
        throw new Error("Method not implemented.");
    }
    fill(path?: unknown, fillRule?: unknown): void {
        throw new Error("Method not implemented.");
    }
    isPointInPath(path: unknown, x: unknown, y?: unknown, fillRule?: unknown): boolean {
        throw new Error("Method not implemented.");
    }
    isPointInStroke(path: unknown, x: unknown, y?: unknown): boolean {
        throw new Error("Method not implemented.");
    }
    stroke(path?: unknown): void {
        throw new Error("Method not implemented.");
    }
    fillStyle: string | CanvasGradient | CanvasPattern = "#000";
    strokeStyle: string | CanvasGradient | CanvasPattern = "#000";
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
    filter: string = "none";
    createImageData(sw: unknown, sh?: unknown, settings?: unknown): ImageData {
        throw new Error("Method not implemented.");
    }
    getImageData(sx: unknown, sy: unknown, sw: unknown, sh: unknown, settings?: unknown): ImageData {
        throw new Error("Method not implemented.");
    }
    putImageData(imagedata: unknown, dx: unknown, dy: unknown, dirtyX?: unknown, dirtyY?: unknown, dirtyWidth?: unknown, dirtyHeight?: unknown): void {
        throw new Error("Method not implemented.");
    }
    imageSmoothingEnabled: boolean = true;
    imageSmoothingQuality: ImageSmoothingQuality = "low";
    arc(x: unknown, y: unknown, radius: unknown, startAngle: unknown, endAngle: unknown, counterclockwise?: unknown): void {
        throw new Error("Method not implemented.");
    }
    arcTo(x1: unknown, y1: unknown, x2: unknown, y2: unknown, radius: unknown): void {
        throw new Error("Method not implemented.");
    }
    bezierCurveTo(cp1x: unknown, cp1y: unknown, cp2x: unknown, cp2y: unknown, x: unknown, y: unknown): void {
        throw new Error("Method not implemented.");
    }
    closePath(): void {
        throw new Error("Method not implemented.");
    }
    ellipse(x: unknown, y: unknown, radiusX: unknown, radiusY: unknown, rotation: unknown, startAngle: unknown, endAngle: unknown, counterclockwise?: unknown): void {
        throw new Error("Method not implemented.");
    }
    lineTo(x: unknown, y: unknown): void {
        throw new Error("Method not implemented.");
    }
    moveTo(x: unknown, y: unknown): void {
        throw new Error("Method not implemented.");
    }
    quadraticCurveTo(cpx: unknown, cpy: unknown, x: unknown, y: unknown): void {
        throw new Error("Method not implemented.");
    }
    rect(x: unknown, y: unknown, w: unknown, h: unknown): void {
        throw new Error("Method not implemented.");
    }
    roundRect(x: unknown, y: unknown, w: unknown, h: unknown, radii?: unknown): void {
        throw new Error("Method not implemented.");
    }
    lineCap: CanvasLineCap = "butt";
    lineDashOffset: number = 0.0;
    lineJoin: CanvasLineJoin = "miter";
    lineWidth: number = 1.0;
    miterLimit: number = 10.0;
    getLineDash(): number[] {
        throw new Error("Method not implemented.");
    }
    setLineDash(segments: unknown): void {
        throw new Error("Method not implemented.");
    }
    clearRect(x: unknown, y: unknown, w: unknown, h: unknown): void {
        throw new Error("Method not implemented.");
    }
    fillRect(x: unknown, y: unknown, w: unknown, h: unknown): void {
        throw new Error("Method not implemented.");
    }
    strokeRect(x: unknown, y: unknown, w: unknown, h: unknown): void {
        throw new Error("Method not implemented.");
    }
    shadowBlur: number = 0;
    shadowColor: string = "rgba(0, 0, 0, 0)";
    shadowOffsetX: number = 0;
    shadowOffsetY: number = 0;
    isContextLost(): boolean {
        throw new Error("Method not implemented.");
    }
    reset(): void {
        throw new Error("Method not implemented.");
    }
    restore(): void {
        throw new Error("Method not implemented.");
    }
    save(): void {
        throw new Error("Method not implemented.");
    }
    fillText(text: unknown, x: unknown, y: unknown, maxWidth?: unknown): void {
        throw new Error("Method not implemented.");
    }
    measureText(text: unknown): TextMetrics {
        throw new Error("Method not implemented.");
    }
    strokeText(text: unknown, x: unknown, y: unknown, maxWidth?: unknown): void {
        throw new Error("Method not implemented.");
    }
    direction: CanvasDirection = "inherit";
    font: string = "10px sans-serif";
    fontKerning: CanvasFontKerning = "auto";
    fontStretch: CanvasFontStretch = "normal";
    fontVariantCaps: CanvasFontVariantCaps = "normal";
    letterSpacing: string = "0px";
    textAlign: CanvasTextAlign = "start";
    textBaseline: CanvasTextBaseline = "alphabetic";
    textRendering: CanvasTextRendering = "auto";
    wordSpacing: string = "0px";
    getTransform(): DOMMatrix {
        throw new Error("Method not implemented.");
    }
    resetTransform(): void {
        throw new Error("Method not implemented.");
    }
    rotate(angle: unknown): void {
        throw new Error("Method not implemented.");
    }
    scale(x: unknown, y: unknown): void {
        throw new Error("Method not implemented.");
    }
    setTransform(a?: unknown, b?: unknown, c?: unknown, d?: unknown, e?: unknown, f?: unknown): void {
        throw new Error("Method not implemented.");
    }
    transform(a: unknown, b: unknown, c: unknown, d: unknown, e: unknown, f: unknown): void {
        throw new Error("Method not implemented.");
    }
    translate(x: unknown, y: unknown): void {
        throw new Error("Method not implemented.");
    }
    drawFocusIfNeeded(path: unknown, element?: unknown): void {
        throw new Error("Method not implemented.");
    }
}